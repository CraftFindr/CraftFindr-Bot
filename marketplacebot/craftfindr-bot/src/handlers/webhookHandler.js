// Constants
import {
	ACCEPT_TERMS_THEN_BOOK,
	ACCEPT_TERMS_THEN_REGISTER,
	REGISTER_KRAFT,
	BOOK_A_KRAFT,
	HAS_SELECTED_A_SERVICE_TO_OFFER,
	BOOKING_CONFIRMED,
	BOOKING_CANCELLED,
	LOCATION_ACCESS_DENIED,
	LOCATION_ACCESS_GRANTED,
	ARTISAN_NEAR_ME,
	SELECTED_ARTISAN,
	SELECTED_TIME_SLOT,
	REJECT_TERMS,
	SET_UP_PROFILE,
} from '../constants.js';
import { addUserToDB, registerArtisanDisplayName, storePhoneNumberToDB } from '../supabase/services.js';

// Messaging Functions
import { sendMessageWithKeyboard, sendMessage } from './messageSender.js';

// Query Handlers
import {
	handleTermsAndConditions,
	handleBookArtisan,
	handleRegisterArtisan,
	handleSetupArtisanProfile,
	confirmArtisanDisplayName,
	handleGetArtisanContact,
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

	if ('text' in message) {
		const text = message.text;
		const username = message.from.username;
		if (text.includes('_')) {
			await confirmArtisanDisplayName(text, chatId, env);
			console.log('Username saved: ', username);
			return new Response('OK');
		}
	}

	if ('contact' in message) {
		const phone_number = message.contact.phone_number;
		console.log('Contact is:', phone_number);
		await storePhoneNumberToDB(phone_number, chatId, env);
		await requestUserLocation(chatId, env);
		return new Response('OK');
	}

	if ('location' in message) {
		const location = message.location;
		await handleLocation(location, chatId, env);
		return new Response('OK');
	}

	return handleMessage(message, env);
}

async function handleMessage(message, env) {
	const chatId = message.chat.id;
	const input = String(message.text);
	const username = message.from.username;

	switch (input) {
		case '/help':
			await sendHelpMessage(chatId, env);
			break;
		case '/start':
			await sendStartMessage(chatId, username, env);
			break;
		case '/register':
			await handleTermsAndConditions(REGISTER_KRAFT, message.chat, env);
			break;
		case '/book':
			await handleTermsAndConditions(BOOK_A_KRAFT, message.chat, env);
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

async function sendStartMessage(chatId, username, env) {
	const response = 'Welcome, traveller! 🪃 \nHow can we help you today?';
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Register your Service 🏷️', callback_data: REGISTER_KRAFT }],
			[{ text: 'Book a Service 🔗', callback_data: BOOK_A_KRAFT }],
		],
	};

	await addUserToDB(chatId, username, env);
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
}

async function sendDefaultMessage(message, env) {
	const userFirstname = String(message.from.first_name);
	const response = `Hi, ${userFirstname} click /start to get started`;
	await sendMessage(env.API_KEY, message.chat.id, response);
}

async function handleCallbackQuery(query, env) {
	const chat = query.message.chat;
	const chatId = query.message.chat.id;
	const callbackData = String(query.data);
	const username = query.from.username;

	if (callbackData.includes('_')) {
		await registerArtisanDisplayName(callbackData, chatId, env);
	}
	if (callbackData === REGISTER_KRAFT || callbackData === BOOK_A_KRAFT) {
		await handleTermsAndConditions(callbackData, chat, env);
	} else if (callbackData === REJECT_TERMS) {
		await sendStartMessage(chatId, username, env);
	} else if (callbackData === ACCEPT_TERMS_THEN_BOOK) {
		await handleBookArtisan('CLIENT', chatId, env);
	} else if (callbackData === ACCEPT_TERMS_THEN_REGISTER) {
		await handleRegisterArtisan('ARTISAN', chatId, env);
	} else if (callbackData === SET_UP_PROFILE) {
		await handleSetupArtisanProfile(chatId, env);
	} else if (callbackData === BOOKING_CONFIRMED) {
		await handleBookingConfirmed(chatId, env);
	} else if (callbackData === BOOKING_CANCELLED) {
		await handleBookingCancelled(chatId, env);
	} else if (callbackData.includes(SELECTED_ARTISAN)) {
		await handleSelectedArtisan(callbackData, chatId, env);
	} else if (callbackData.includes(HAS_SELECTED_A_SERVICE_TO_OFFER)) {
		await handleGetArtisanContact(callbackData, chatId, env);
	} else if (callbackData.includes(LOCATION_ACCESS_GRANTED)) {
		await requestUserLocation(chatId, env);
	} else if (callbackData.includes(LOCATION_ACCESS_DENIED)) {
		await handleLocationAccessDenied(chatId, env);
	} else if (callbackData.includes(ARTISAN_NEAR_ME)) {
		await listSelectedArtisanTimeSlots(callbackData, chatId, env);
	} else if (callbackData.includes(SELECTED_TIME_SLOT)) {
		await handleConfirmOrCancelBooking(callbackData, chatId, env);
	}

	return new Response('OK');
}
