import { handleWebhook } from './handlers/menuHandlers.js';

export default {
	async fetch(request, env, context) {
		return await handleWebhook(request, env);
	},
};
