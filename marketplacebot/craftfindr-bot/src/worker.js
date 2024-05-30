import { handleWebhook } from './handlers/messageHandlers.js';

export default {
	async fetch(request, env, context) {
		return await handleWebhook(request, env);
	},
};
