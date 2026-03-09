import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { stripIndents } from 'common-tags';
import { coerceBoolean } from 'cloudflare/core.mjs';

type Bindings = {
	[key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

// Secure all the API routes
app.use('/api/*', (c, next) => {
	const jwtMiddleware = jwt({
		secret: c.env.JWT_SECRET,
	});
	return jwtMiddleware(c, next);
});

// Generate a signed token
app.post("/tmp/token", async (c) => {
	const payload = await c.req.json();
	console.log({payload});
	const token = await sign(payload, c.env.JWT_SECRET);
	return c.json({token});
});

async function addUrl(env: Bindings, slug: string, url: string, override: boolean = false) {
	const existing = await env.URLS.get(slug);
	console.log({ slug, url, override });
	if (existing !== null) {
		if (coerceBoolean(override) === true) {
			console.log(`Overriding shorty ${slug}`);
		} else {
			return {
				slug,
				url: existing,
				shorty: `/${slug}`,
				message: `Did not update ${slug} because it already was pointing to ${existing} and override was set to ${override}.`,
			};
		}
	}
	await env.URLS.put(slug, url);
	return { slug, url, shorty: `/${slug}` };
}

app.post('/api/url', async (c) => {
	const payload = await c.req.json();
	const result = await addUrl(c.env, payload.slug, payload.url, payload.override);
	return c.json(result);
});

async function queryClicks(env: Bindings, sql: string) {
	console.log(sql);
	const API = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
	const response = await fetch(API, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
		},
		body: sql,
	});
	const jsonResponse = await response.json();
	// @ts-ignore
	return jsonResponse.data;
}

app.post('/api/report/:slug', async (c) => {
	const sql = `SELECT blob4 as 'country', COUNT() as 'total' FROM link_clicks WHERE blob1='${c.req.param('slug')}' GROUP BY country`;
	const results = await queryClicks(c.env, sql);
	return c.json(results);
});

// TODO: Remove temporary hack
const SHORTY_SYSTEM_MESSAGE = stripIndents`
You are an assistant for the URL Shortening service named shrty.dev.

Each shortened link is called a shorty. Each shorty starts with the current hostname and then is followed by a forward slash and then the slug.

You are jovial and want to encourage people to create great shortened links.

When doing function calling ensure that boolean values are ALWAYS lowercased, eg: instead of True use true.
`;


const TOOLS = [
	{
		type: 'function' as const,
		function: {
			name: 'createShorty',
			description: 'Creates a new short link',
			parameters: {
				type: 'object',
				properties: {
					slug: {
						type: 'string',
						description: 'The shortened part of the url.',
					},
					url: {
						type: 'string',
						description: 'The final destination where the shorty should redirect. Should start with https://',
					},
					override: {
						type: 'boolean',
						description:
							'Will override if there is an existing shorty at that slug. Default is false.',
					},
				},
				required: ['slug', 'url'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'getClicksByCountryReport',
			description: 'Returns a report of all clicks on a specific shorty grouped by country',
			parameters: {
				type: 'object',
				properties: {
					slug: {
						type: 'string',
						description: 'The shortened part of the url',
					},
				},
				required: ['slug'],
			},
		},
	},
];

async function executeToolCall(env: Bindings, name: string, args: Record<string, unknown>): Promise<string> {
	switch (name) {
		case 'createShorty': {
			const result = await addUrl(env, args.slug as string, args.url as string, args.override as boolean);
			return JSON.stringify(result);
		}
		case 'getClicksByCountryReport': {
			const slug = args.slug as string;
			const sql = stripIndents`
				SELECT
					blob4 as 'country',
					COUNT() as 'total'
				FROM
					link_clicks
				WHERE blob1='${slug}'
				GROUP BY country`;
			const result = await queryClicks(env, sql);
			return JSON.stringify(result);
		}
		default:
			return JSON.stringify({ error: `Unknown tool: ${name}` });
	}
}

const MODEL = '@cf/zai-org/glm-4.7-flash' as keyof AiModels;
const MAX_TOOL_ROUNDS = 5;

/** Pipes an SSE ReadableStream from Workers AI into a plain-text ReadableStream, token by token. */
function createTokenStream(source: ReadableStream): ReadableStream {
	const inputReader = source.getReader();
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = '';
	let chunkCount = 0;
	let totalWritten = 0;

	return new ReadableStream({
		async pull(controller) {
			while (true) {
				const { done, value } = await inputReader.read();
				if (done) {
					console.log(`Stream complete: ${chunkCount} raw reads, ${totalWritten} chars written`);
					controller.close();
					return;
				}
				buffer += decoder.decode(value, { stream: true });
				if (chunkCount === 0) {
					console.log('First raw chunk:', JSON.stringify(buffer).slice(0, 500));
				}
				chunkCount++;

				// Process only complete lines (keep partial trailing line in buffer)
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				let wrote = false;
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith('data:')) continue;
					const data = trimmed.slice(5).trim();
					if (data === '[DONE]') continue;
					try {
						const parsed = JSON.parse(data);
						// Support both OpenAI-compatible format and legacy Workers AI format
						const token = parsed.choices?.[0]?.delta?.content ?? parsed.response ?? '';
						if (token) {
							controller.enqueue(encoder.encode(token));
							totalWritten += token.length;
							wrote = true;
						}
					} catch {
						console.log('Failed to parse SSE chunk:', JSON.stringify(data).slice(0, 200));
					}
				}
				// If we wrote at least one token, yield back so it flushes to the client
				if (wrote) return;
			}
		},
	});
}

app.post('/admin/chat', async (c) => {
	const payload = await c.req.json();
	const messages: RoleScopedChatInput[] = payload.messages || [];
	console.log(`Chat request with ${messages.length} message(s)`);
	messages.unshift({
		role: 'system',
		content: SHORTY_SYSTEM_MESSAGE,
	});

	// Tool calling loop: let the model call tools until it produces a final text response
	for (let i = 0; i < MAX_TOOL_ROUNDS; i++) {
		console.log(`Tool round ${i + 1}/${MAX_TOOL_ROUNDS}`);
		const response = await c.env.AI.run(MODEL, {
			messages,
			tools: TOOLS,
		});
		console.log('AI response:', JSON.stringify(response).slice(0, 500));

		// Extract tool calls from either legacy or OpenAI-compatible format
		const legacyToolCalls = (response as any).tool_calls;
		const oaiChoice = (response as any).choices?.[0];
		const oaiToolCalls = oaiChoice?.message?.tool_calls;
		const toolCalls = oaiToolCalls || legacyToolCalls;

		if (toolCalls && toolCalls.length > 0) {
			console.log(`Model requested ${toolCalls.length} tool call(s):`, JSON.stringify(toolCalls).slice(0, 500));

			// Add the assistant's tool call message
			messages.push({
				role: 'assistant',
				content: '',
				tool_calls: toolCalls.map((tc: any) => ({
					id: tc.id || crypto.randomUUID(),
					type: 'function',
					function: tc.function || { name: tc.name, arguments: typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify(tc.arguments) },
				})),
			} as unknown as RoleScopedChatInput);

			// Execute each tool call and add results
			for (const tc of toolCalls) {
				// Normalize: OpenAI format has tc.function.name/arguments, legacy has tc.name/arguments
				const name = tc.function?.name || tc.name;
				const rawArgs = tc.function?.arguments ?? tc.arguments;
				const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
				const toolCallId = tc.id || crypto.randomUUID();

				console.log(`Executing tool: ${name}`, args);
				const result = await executeToolCall(c.env, name, args);
				console.log(`Tool result: ${result.slice(0, 200)}`);
				messages.push({
					role: 'tool',
					tool_call_id: toolCallId,
					content: result,
				} as unknown as RoleScopedChatInput);
			}
			continue;
		}

		// No tool calls — the model has a final answer. Log what we got, then stream it.
		const textContent = oaiChoice?.message?.content || (response as any).response;
		console.log('No tool calls detected. Text content preview:', (textContent || '(none)').slice(0, 200));
		console.log('Streaming final response');
		break;
	}

	// Stream the final response
	const stream = await c.env.AI.run(MODEL, {
		messages,
		stream: true,
	});
	console.log('Stream obtained, type:', typeof stream);

	return new Response(createTokenStream(stream as ReadableStream), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
});

app.get('/:slug', async (c) => {
	const slug = c.req.param('slug');
	const url = await c.env.URLS.get(slug);
	if (url === null) {
		return c.status(404);
	}
	const cfProperties = c.req.raw.cf;
	if (cfProperties !== undefined) {
		if (c.env.TRACKER !== undefined) {
			c.env.TRACKER.writeDataPoint({
				blobs: [
					slug as string,
					url as string,
					cfProperties.city as string,
					cfProperties.country as string,
					cfProperties.continent as string,
					cfProperties.region as string,
					cfProperties.regionCode as string,
					cfProperties.timezone as string,
				],
				doubles: [cfProperties.metroCode as number, cfProperties.longitude as number, cfProperties.latitude as number],
				indexes: [slug as string],
			});
		} else {
			console.warn(`TRACKER not defined (does not work on local dev), passing through ${slug} to ${url}`);
		}
	}
	// Redirect
	return c.redirect(url);
});

export default app;
