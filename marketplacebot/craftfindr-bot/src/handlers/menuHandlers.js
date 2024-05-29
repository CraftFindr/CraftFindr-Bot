import { sendMessageWithKeyboard, sendMessage } from '../handlers/messageSender.js';

export async function handleWebhook(request, env) {
	if (request.method === 'GET') {
		return new Response('This is the CraftFindr Webhook');
	}
	
	if (request.method === 'POST') {
		const payload = await request.json();
		if ('message' in payload) {
			const chatId = payload.message.chat.id;
			const input = String(payload.message.text);
			const userFirstname = String(payload.message.from.first_name);

			if (input === '/help') {
				const response = "I'm a simple bot. I help you find service workers near you 🧑‍🔧. \n We're still in development🧰 though.";
				await sendMessage(env.API_KEY, chatId, response);
				return new Response('OK');
			}

			if (input === '/start') {
				const response = 'What kind of service worker do you need? 💭';
				const keyboard = {
					inline_keyboard: [
						[
							{ text: 'Hairdresser 💇‍♀️', callback_data: 'Hairdresser' },
							{ text: 'Plumber 🔧', callback_data: 'Plumber' },
						],

						[
							{ text: 'Chef 🧑‍🍳', callback_data: 'Cooking Services' },
							{ text: 'Nanny 🤱', callback_data: 'Nanny' },
						],
						[{ text: 'Makeup Artist 💄', callback_data: 'Makeup Artist' }],
					],
				};

				await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
				return new Response('OK');
			}
			const response = `${userFirstname} said ${input}`;
			await sendMessage(env.API_KEY, chatId, response);
		}

		if ('callback_query' in payload) {
			// Echo callback queries for now
			const query = payload.callback_query;
			const chatId = query.message.chat.id;
			const callbackData = query.data;

			await sendMessage(env.API_KEY, chatId, `You selected: ${callbackData}`);
			return new Response('OK');
		}
	}

	return new Response('OK');
}
