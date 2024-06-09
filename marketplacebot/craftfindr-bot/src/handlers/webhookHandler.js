// Constants
import {
	ACCEPT_TERMS_THEN_BOOK,
	ACCEPT_TERMS_THEN_REGISTER,
	REGISTER_KRAFT,
	BOOK_A_KRAFT,
	BOOKING_CONFIRMED,
	BOOKING_CANCELLED,
	LOCATION_ACCESS_DENIED,
	LOCATION_ACCESS_GRANTED,
	ARTISAN_NEAR_ME,
	SELECTED_ARTISAN,
	SELECTED_TIME_SLOT,
	REJECT_TERMS,
} from '../constants.js';
import { storeMessage } from '../supabase/storeMessage.js';
import { addUserToDB } from '../supabase/services.js';

// Message Sending Functions
import { sendMessageWithKeyboard, sendMessage } from './messageSender.js';

// Query Handlers
import {
	handleTermsAndConditions,
	handleBookArtisan,
	handleRegisterArtisan,
	handleSelectedArtisan,
	handleConfirmOrCancelBooking,
	handleBookingConfirmed,
	handleBookingCancelled,
	handleLocationAccessDenied,
	listSelectedArtisanTimeSlots,
	requestUserLocation,
	handleLocation,
} from './queryHandlers.js';

export async function handleWebhook(request, env) {
	if (request.method === 'GET') {
		return new Response('This is the CraftFindr Webhook');
	}

	if (request.method === 'POST') {
		const payload = await request.json();

		if ('callback_query' in payload) {
			return handleCallbackQuery(payload.callback_query, env);
		}

		if ('message' in payload) {
			return handleIncomingMessage(payload.message, env);
		}
	}

	return new Response('OK');
}
async function handleIncomingMessage(message, env) {
	const chatId = message.chat.id;

	if ('location' in message) {
		const location = message.location;
		console.log('Location is:', location);
		await handleLocation(location, chatId, env);
		return new Response('OK');
	}

	return handleMessage(message, env);
}

async function handleMessage(message, env) {
	const chat = message.chat;
	const input = String(message.text);

	switch (input) {
		case '/help':
			await sendHelpMessage(chat.id, env);
			break;
		case '/start':
			await sendStartMessage(chat.id, env);
			break;
		default:
			await sendDefaultMessage(message, env);
			break;
	}

	return new Response('OK');
}

async function sendHelpMessage(chatId, env) {
	const response = "I'm a simple bot. I help you find service workers near you 🧑‍🔧 \nClick /start to get started.";
	await sendMessage(env.API_KEY, chatId, response);
}

async function sendStartMessage(chatId, env) {
	const response = 'Welcome, traveller! 🪃 \n How can we help you today?';
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Register your Service 🏷️', callback_data: REGISTER_KRAFT }],
			[{ text: 'Book a Service 🔗', callback_data: BOOK_A_KRAFT }],
		],
	};

	await addUserToDB(chatId, env);
	// await addUserToDB(chatId, env)
	// 	.then(async (res) => {
	// 		const result = await res.json();
	// 		if (result.already_exists) {
	// 			console.log('THE USER IS THEREEEE ALREADY', result.message);
	// 		} else {
	// 			console.log('USER NOT THERE', result.message);
	// 		}
	// 	})
	// 	.catch((err) => {
	// 		console.error('Error: ', err);
	// 	});
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
}

async function sendDefaultMessage(message, env) {
	const userFirstname = String(message.from.first_name);
	const response = `Hi, ${userFirstname} click /start to get started`;
	await storeMessage(message, env);
	await sendMessage(env.API_KEY, message.chat.id, response);
}

async function handleCallbackQuery(query, env) {
	const chat = query.message.chat;
	const chatId = query.message.chat.id;
	const callbackData = String(query.data);

	if (callbackData === REGISTER_KRAFT || callbackData === BOOK_A_KRAFT) {
		await handleTermsAndConditions(callbackData, chat, env);
	} else if (callbackData === REJECT_TERMS) {
		await sendStartMessage(chatId, env);
	} else if (callbackData === ACCEPT_TERMS_THEN_BOOK) {
		await handleBookArtisan(chatId, env);
	} else if (callbackData === ACCEPT_TERMS_THEN_REGISTER) {
		await handleRegisterArtisan(chatId, env);
	} else if (callbackData === BOOKING_CONFIRMED) {
		await handleBookingConfirmed(chatId, env);
	} else if (callbackData === BOOKING_CANCELLED) {
		await handleBookingCancelled(chatId, env);
	} else if (callbackData.includes(SELECTED_ARTISAN)) {
		await handleSelectedArtisan(callbackData, chatId, env);
	} else if (callbackData.includes(LOCATION_ACCESS_GRANTED)) {
		await requestUserLocation(callbackData, chatId, env);
	} else if (callbackData.includes(LOCATION_ACCESS_DENIED)) {
		await handleLocationAccessDenied(chatId, env);
	} else if (callbackData.includes(ARTISAN_NEAR_ME)) {
		await listSelectedArtisanTimeSlots(callbackData, chatId, env);
	} else if (callbackData.includes(SELECTED_TIME_SLOT)) {
		await handleConfirmOrCancelBooking(callbackData, chatId, env);
	}

	return new Response('OK');
}
