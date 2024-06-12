import { confirmOrCancelBooking, listOfArtisans, listOfSlots, listOfVendors } from '../keyboards.js';
import { listArtisansByDistance } from '../listArtisansByDistance.js';
import { sendMessage, sendMessageWithKeyboard, sendLocationRequest } from './messageSender.js';

import {
	TERMS_AND_CONDITIONS_LINK,
	ACCEPT_TERMS_THEN_BOOK,
	ACCEPT_TERMS_THEN_REGISTER,
	REGISTER_KRAFT,
	BOOK_A_KRAFT,
	LOCATION_ACCESS_GRANTED,
	LOCATION_ACCESS_DENIED,
	REJECT_TERMS,
	SET_UP_PROFILE,
} from '../constants.js';

import { checkIfUserHasAcceptedTerms, checkIfUserIsArtisan } from '../supabase/selectors.js';
import { acceptTermsAndConditions, storeLocationToDB, storeServiceToDB } from '../supabase/services.js';
import { listServicesToOffer } from '../listServicesToOffer.js';

var hasAcceptedTermsAndConditions = false;
var requestedArtisan = '';

export const handleTermsAndConditions = async (callbackData, chat, env) => {
	const chatId = chat.id;
	let terms_for_who = callbackData === REGISTER_KRAFT ? 'VENDOR' : 'CLIENT';
	const response = `For your own safety, please confirm that you have read and accepted our ${terms_for_who} Terms and Conditions ${TERMS_AND_CONDITIONS_LINK} before proceeding...`;

	var hasAccepted = await checkIfUserHasAcceptedTerms(chatId, env);
	const variation =
		callbackData === REGISTER_KRAFT ? 'has_accepted_vendor_terms_and_conditions' : 'has_accepted_client_terms_and_conditions';
	hasAccepted = hasAccepted[0][variation];
	console.log(`${variation}: `, hasAccepted);

	const keyboard = {
		inline_keyboard: [
			[
				{ text: 'Cancel', callback_data: REJECT_TERMS },
				{ text: 'Proceed', callback_data: `${callbackData === REGISTER_KRAFT ? ACCEPT_TERMS_THEN_REGISTER : ACCEPT_TERMS_THEN_BOOK}` },
			],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleBookArtisan = async (chatId, env) => {
	hasAcceptedTermsAndConditions = true;
	const response = "Great! Now, let's hook you up 👻 \nWhat kind of service do you need? ⚗️";
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfArtisans);
};

export const handleRegisterArtisan = async (acceptFor, chatId, env) => {
	await acceptTermsAndConditions(acceptFor, chatId, env);
	const response = "Awesome! Now let's quickly set up your profile 🦊\nThis will help clients find you easier.";
	const keyboard = {
		inline_keyboard: [[{ text: 'Proceed', callback_data: SET_UP_PROFILE }]],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleSetupArtisanProfile = async (chatId, env) => {
	const response =
		"What's your service handler? \n\nThis will be shown to potential clients searching for the service you offer. \ne.g  _JennyBeauty Salon. \n\n(Make sure to include the _)";
	await sendMessage(env.API_KEY, chatId, response);
};

export const confirmArtisanDisplayName = async (text, chatId, env) => {
	const username = text.split('_')[1];
	const response = `Are you sure you want to use ${username} as your display name?`;
	const keyboard = {
		inline_keyboard: [[{ text: 'Yes', callback_data: `${text}` }]],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const selectArtisanServicesToOffer = async (chatId, env) => {
	const response = 'What services do you offer among these?';
	const keyboard = await listServicesToOffer(env);
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleGetArtisanLocation = async (callbackData, chatId, env) => {
	const selectedService = callbackData.split('::')[1];
	await storeServiceToDB(selectedService, chatId, env);

	const response = "Nice, now we'll need your location to help clients find you easily 🗺️";
	const keyboard = {
		inline_keyboard: [
			[{ text: 'OK', callback_data: `${LOCATION_ACCESS_GRANTED}:` }],
			[{ text: 'Cancel', callback_data: LOCATION_ACCESS_DENIED }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleSelectedArtisan = async (callbackData, chatId, env) => {
	const artisan = callbackData.split(':')[1];
	const response = "We'll need your location access to find your nearest artisan 🗺️";
	const keyboard = {
		inline_keyboard: [
			[{ text: 'OK', callback_data: `${LOCATION_ACCESS_GRANTED}:${artisan}` }],
			[{ text: 'Cancel', callback_data: LOCATION_ACCESS_DENIED }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const requestUserLocation = async (callbackData, chatId, env) => {
	const response = 'Please share your location';
	requestedArtisan = callbackData.split(':')[1];
	const keyboard = {
		reply_markup: {
			keyboard: [[{ text: 'Share Location', request_location: true }]],
			one_time_keyboard: true,
			resize_keyboard: true,
		},
	};
	await sendLocationRequest(env.API_KEY, chatId, response, keyboard);
};

export const handleLocation = async (location, chatId, env) => {
	const { latitude, longitude } = location;
	const response = `Location Received 👾`;
	await sendMessage(env.API_KEY, chatId, response);
	await storeLocationToDB(latitude, longitude, chatId, env);
	await respondToLocationMessage(chatId, latitude, longitude, env);
};

export const respondToLocationMessage = async (chatId, latitude, longitude, env) => {
	const isArtisan = await checkIfUserIsArtisan(chatId, env);

	if (isArtisan) {
		await sendMessage(
			env.API_KEY,
			chatId,
			"You're now visible to clients looking for your service 🎉 \n\nPlease ensure your notifications for Telegram are turned on so we can ping you when you have an order.\n\nSee you soon👋"
		);
	} else {
		await handleGetArtisansNearMe(`location-${latitude}-${longitude}`, chatId, env);
	}
};

export const handleGetArtisansNearMe = async (callbackData, chatId, env) => {
	const lat = callbackData.split('-')[1];
	const long = callbackData.split('-')[2];
	let response = `These are the ${requestedArtisan}s closest to you (lat: ${lat}, long: ${long}) 👇`;

	// if (requestedArtisan === 'Others') {
	response = 'Still iterating on this feature... \nThis is coming soon!';
	//  🚧 \nYou can still book any of the below services🔻
	await sendMessageWithKeyboard(env.API_KEY, chatId, response);
	// } else {
	// 	const keyboard = listArtisansByDistance(requestedArtisan);
	// 	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
	// }
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
