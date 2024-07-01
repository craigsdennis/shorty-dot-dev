app.post('/chat', async (c) => {
	const payload = await c.req.json();
	const messages = payload.messages || [];
	//console.log({ submittedMessages: messages });
	messages.unshift({
		role: 'system',
		content: SHORTY_SYSTEM_MESSAGE,
	});
	let result: AiTextGenerationOutput = await c.env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
		messages,
		tools,
	});
	while (result.tool_calls !== undefined) {
		for (const tool_call of result.tool_calls) {
			console.log('Tool Call', JSON.stringify(tool_call));
			let fnResponse;
			switch (tool_call.name) {
				case 'createShorty':
					const override = tool_call.parameters?.override || false;
					fnResponse = await addUrl(c.env, tool_call.arguments.slug, tool_call.arguments.url, override);
					break;
				case 'getClicksByCountryReport':
					const slug = tool_call.arguments.slug;
					const sql = `SELECT
						blob4 as 'country',
						COUNT() as 'total'
					FROM
						link_clicks
					WHERE blob1='${slug}'
					GROUP BY country`;
					fnResponse = await queryClicks(c.env, sql);
					break;
				default:
					messages.push({ role: 'tool', name: tool_call.name, content: `ERROR: Tool not found "${tool_call.name}"` });
					break;
			}
			if (fnResponse !== undefined) {
				messages.push({ role: 'tool', name: tool_call.name, content: JSON.stringify(fnResponse) });
				result = await c.env.AI.run('@hf/nousresearch/hermes-2-pro-mistral-7b', {
					messages,
					tools,
				});
				if (result.response !== null) {
					messages.push({ role: 'assistant', content: result.response });
				}
			}
		}
	}
	const finalMessage = messages[messages.length - 1];
	console.log({ finalMessage });
	if (finalMessage.role !== 'assistant') {
		messages.push({ role: 'assistant', content: result.response });
	}
	// Remove the system message
	messages.splice(0, 1);
	return c.json({ messages });
});
