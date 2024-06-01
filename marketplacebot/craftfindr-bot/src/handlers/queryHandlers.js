import { confirmOrCancelBooking, listOfArtisans, listOfSlots, listOfVendors } from '../keyboards.js';
import { listArtisansByDistance } from '../listArtisansByDistance.js';
import { sendMessage, sendMessageWithKeyboard } from './messageSender.js';
import {
	TERMS_AND_CONDITIONS_LINK,
	ACCEPT_TERMS_THEN_BOOK,
	ACCEPT_TERMS_THEN_REGISTER,
	REGISTER_KRAFT,
	BOOK_A_KRAFT,
	LOCATION_ACCESS_GRANTED,
	LOCATION_ACCESS_DENIED,
} from './messageHandlers.js';

var hasAcceptedTermsAndConditions = false;

export const handleTermsAndConditions = async (callbackData, chatId, env) => {
	const response = `For your own safety, please confirm that you have read and accepted our ${
		callbackData === REGISTER_KRAFT ? 'VENDOR' : 'CLIENT'
	} Terms and Conditions ${TERMS_AND_CONDITIONS_LINK} before proceeding`;
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Proceed', callback_data: callbackData === REGISTER_KRAFT ? ACCEPT_TERMS_THEN_REGISTER : ACCEPT_TERMS_THEN_BOOK }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleBookArtisan = async (chatId, env) => {
	hasAcceptedTermsAndConditions = true;
	const response = "Great! Now, let's hook you up 👻 \nWhat kind of service do you need? ⚗️";
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfArtisans);
};

export const handleRegisterArtisan = async (chatId, env) => {
	hasAcceptedTermsAndConditions = true;
	const response = "Awesome! This is right when we would set up your profile 👻 but for now why don't you try booking a service?🦊";
	const keyboard = {
		inline_keyboard: [[{ text: 'Book a Kraft 🔗', callback_data: BOOK_A_KRAFT }]],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleSelectedArtisan = async (callbackData, chatId, env) => {
	const artisan = callbackData.split(':')[1];
	const response = "We'll need your location access to find your nearest artisan 🗺️";
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Cancel', callback_data: LOCATION_ACCESS_DENIED }],
			[{ text: 'OK', callback_data: `${LOCATION_ACCESS_GRANTED}:${artisan}` }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleGetArtisansNearMe = async (callbackData, chatId, env) => {
	const selected = callbackData.split(':')[1];
	let response = `These are the ${selected}s closest to you 👇`;

	if (selected === 'Others') {
		response = 'This feature is coming soon! 🚧 \nYou can still book any of the below services🔻';
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfArtisans);
	} else {
		const keyboard = listArtisansByDistance(selected);
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
	}
};

export const handleLocationAccessDenied = async (chatId, env) => {
	const response = 'We understand 😊 \nHere are some artisans anyway, you can find out more details after contacting them.';
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfVendors);
};

export const listSelectedArtisanTimeSlots = async (callbackData, chatId, env) => {
	const person = callbackData.split(':')[2];
	const response = `These are ${person}'s open slots. \nPick what time works for you 📩`;
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfSlots);
};

export const handleConfirmOrCancelBooking = async (callbackData, chatId, env) => {
	const response = `Almost there ⏳ \nPlease confirm your booking for ${callbackData.split('-')[1]} and we'll notify them immediately 📬`;
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, confirmOrCancelBooking);
};

export const handleBookingConfirmed = async (chatId, env) => {
	await sendMessage(env.API_KEY, chatId, 'Booking Confirmed 😋 \nThanks for using CraftFindr. The vendor will be with you shortly.');
};

export const handleBookingCancelled = async (chatId, env) => {
	const response = 'Booking Cancelled 🥲 \nWhat else can I do for you?';
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Register your Kraft 🏷️', callback_data: REGISTER_KRAFT }],
			[{ text: 'Book a Kraft 🔗', callback_data: BOOK_A_KRAFT }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};
