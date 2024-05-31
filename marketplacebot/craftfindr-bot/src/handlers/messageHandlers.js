import { sendMessageWithKeyboard, sendMessage } from './messageSender.js';
import {
	handleTermsAndConditions,
	handleBookArtisan,
	handleRegisterArtisan,
	handleSelectedArtisan,
	handleSelectedArtisanNearMe,
	handleSelectedTimeSlot,
	handleBookingConfirmed,
	handleBookingCancelled,
} from './queryHandlers.js';

export const TERMS_AND_CONDITIONS_LINK = '{insert_link}';
export const ACCEPT_TERMS_THEN_BOOK = 'hasAcceptedTermsAndConditionsToBook';
export const ACCEPT_TERMS_THEN_REGISTER = 'hasAcceptedTermsAndConditionsToRegister';
export const REGISTER_KRAFT = 'RegisterKraft';
export const BOOK_A_KRAFT = 'BookAKraft';
export const BOOKING_CONFIRMED = 'BookingConfirmed';
export const BOOKING_CANCELLED = 'BookingCancelled';
export const BOOKING_FAILED = 'BookingFailed';
export const BOOKING_REJECTED = 'BookingRejected';

export async function handleWebhook(request, env) {
	if (request.method === 'GET') {
		return new Response('This is the CraftFindr Webhook');
	}

	if (request.method === 'POST') {
		const payload = await request.json();
		if ('message' in payload) {
			return handleMessage(payload.message, env);
		}

		if ('callback_query' in payload) {
			return handleCallbackQuery(payload.callback_query, env);
		}
	}

	return new Response('OK');
}

async function handleMessage(message, env) {
	const chatId = message.chat.id;
	const input = String(message.text);
	const userFirstname = String(message.from.first_name);

	if (input === '/help') {
		const response = "I'm a simple bot. I help you find service workers near you 🧑‍🔧. Type /start to get started.";
		await sendMessage(env.API_KEY, chatId, response);
		return new Response('OK');
	}

	if (input === '/start') {
		const response = 'Welcome to Krafta 🪃 \n How can we help you today?';
		const keyboard = {
			inline_keyboard: [
				[{ text: 'Register your Kraft 🏷️', callback_data: REGISTER_KRAFT }],
				[{ text: 'Book a Kraft 🔗', callback_data: BOOK_A_KRAFT }],
			],
		};
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
		return new Response('OK');
	}

	const response = `Hi, ${userFirstname} click /start to get started`;
	await sendMessage(env.API_KEY, chatId, response);
	return new Response('OK');
}

async function handleCallbackQuery(query, env) {
	const chatId = query.message.chat.id;
	const callbackData = String(query.data);

	switch (callbackData) {
		case REGISTER_KRAFT:
		case BOOK_A_KRAFT:
			await handleTermsAndConditions(callbackData, chatId, env);
			break;
		case ACCEPT_TERMS_THEN_BOOK:
			await handleBookArtisan(chatId, env);
			break;
		case ACCEPT_TERMS_THEN_REGISTER:
			await handleRegisterArtisan(chatId, env);
			break;
		case BOOKING_CONFIRMED:
			await handleBookingConfirmed(chatId, env);
			break;
		case BOOKING_CANCELLED:
			await handleBookingCancelled(chatId, env);
		default:
			if (callbackData.includes('selectedArtisan')) {
				await handleSelectedArtisan(callbackData, chatId, env);
			}
			if (callbackData.includes('artisanNearMe')) {
				await handleSelectedArtisanNearMe(callbackData, chatId, env);
			}
			if (callbackData.includes('selectedTimeSlot')) {
				await handleSelectedTimeSlot(callbackData, chatId, env);
			}
			break;
	}
	return new Response('OK');
}
