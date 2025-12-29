import { runWithTools } from '@cloudflare/ai-utils';
import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { stripIndents } from 'common-tags';
import { streamText } from 'hono/streaming';
import { events } from 'fetch-event-stream';
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
			console.log(`تجاوز الرابط المختصر ${slug}`);
		} else {
			return {
				slug,
				url: existing,
				shorty: `/${slug}`,
				message: `لم يتم تحديث ${slug} لأنه كان يشير بالفعل إلى ${existing} وتم تعيين التجاوز إلى ${override}.`,
			};
		}
	}
	await env.URLS.put(slug, url);
	return { 
		slug, 
		url, 
		shorty: `/${slug}`,
		message: `تم إنشاء الرابط المختصر بنجاح!`
	};
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
أنت مساعد ذكي لخدمة اختصار الروابط المسماة "مختصر الروابط - وقف تك".

كل رابط مختصر يُسمى "رابط مختصر". كل رابط مختصر يبدأ بنطاق الموقع الحالي ثم يتبعه شرطة مائلة ثم الاختصار.

أنت ودود ومتحمس وتريد تشجيع الناس على إنشاء روابط مختصرة رائعة.

عند استخدام استدعاء الدوال، تأكد أن القيم المنطقية دائماً بأحرف صغيرة، مثل: بدلاً من True استخدم true.

تحدث باللغة العربية دائماً واستجب بطريقة مفيدة ومهذبة.
`;


app.post('/admin/chat', async (c) => {
	const payload = await c.req.json();
	const messages = payload.messages || [];
	//console.log({ submittedMessages: messages });
	messages.unshift({
		role: 'system',
		content: SHORTY_SYSTEM_MESSAGE,
	});

	const eventSourceStream = await runWithTools(
		c.env.AI,
		'@hf/nousresearch/hermes-2-pro-mistral-7b',
		{
			messages,
			tools: [
				{
					name: 'createShorty',
					description: 'إنشاء رابط مختصر جديد',
					parameters: {
						type: 'object',
						properties: {
							slug: {
								type: 'string',
								description: 'الجزء المختصر من الرابط.',
							},
							url: {
								type: 'string',
								description: 'الوجهة النهائية التي يجب أن يعيد توجيه الرابط المختصر إليها. يجب أن يبدأ بـ https://',
							},
							override: {
								type: 'boolean',
								description:
									'سيتم التجاوز إذا كان هناك رابط مختصر موجود في هذا الاختصار. الافتراضي هو false.',
							},
						},
						required: ['slug', 'url'],
					},
					function: async ({ slug, url, override }) => {
						const result = await addUrl(c.env, slug, url, override);
						return JSON.stringify(result);
					},
				},
				{
					name: 'getClicksByCountryReport',
					description: 'يُرجع تقريراً بجميع النقرات على رابط مختصر محدد مجمعة حسب البلد',
					parameters: {
						type: 'object',
						properties: {
							slug: {
								type: 'string',
								description: 'الجزء المختصر من الرابط',
							},
						},
						required: ['slug'],
					},
					function: async ({ slug }) => {
						const sql = stripIndents`
							SELECT
								blob4 as 'country',
								COUNT() as 'total'
							FROM
								link_clicks
							WHERE blob1='${slug}'
							GROUP BY country`;
						const result = await queryClicks(c.env, sql);
						return JSON.stringify(result);
					},
				},
			],
		},
		{
			streamFinalResponse: true,
			verbose: true,
		}
	);

	return streamText(c, async (stream) => {
		const chunks = events(new Response(eventSourceStream as ReadableStream));
		for await (const chunk of chunks) {
			if (chunk.data && chunk.data !== '[DONE]' && chunk.data !== '<|im_end|>') {
				const data = JSON.parse(chunk.data);
				stream.write(data.response);
			}
		}
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
