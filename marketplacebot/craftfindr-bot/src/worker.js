import { handleWebhook } from './handlers/webhookHandler.js';

export default {
	async fetch(request, env, context) {
		return await handleWebhook(request, env);
	},
};
