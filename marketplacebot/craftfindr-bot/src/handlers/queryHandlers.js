import { confirmOrCancelBooking, listOfSlots } from '../keyboards.js';
import { sendMessage, sendMessageWithKeyboard, sendLocationRequest, sendContactRequest } from './messageSender.js';

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

import { checkIfUserHasAcceptedTerms, checkIfUserIsArtisan, checkIsBooking, getRequestedArtisan } from '../supabase/selectors.js';
import {
	acceptTermsAndConditions,
	setIsBookingFalse,
	setIsBookingTrue,
	storeLocationToDB,
	storeRequestedArtisan,
	storeServiceToDB,
} from '../supabase/services.js';
import { listServicesToOffer } from '../listServicesToOffer.js';
import { listServicesWithRegisteredArtisan } from '../listServicesWithRegisteredArtisan.js';
import { listArtisansByDistance } from '../listArtisansByDistance.js';

export const handleTermsAndConditions = async (callbackData, chat, env) => {
	const chatId = chat.id;
	let terms_for_who = callbackData === REGISTER_KRAFT ? 'VENDOR' : 'CLIENT';
	const response = `There's one little thing...\n \nFor your own safety, please confirm that you have read and accepted our ${terms_for_who} Terms and Conditions ${TERMS_AND_CONDITIONS_LINK} before proceeding...`;

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

export const handleBookArtisan = async (acceptFor, chatId, env) => {
	await acceptTermsAndConditions(acceptFor, chatId, env);
	await setIsBookingTrue(chatId, env);
	const response = "Great! Now, let's hook you up 👻 \nWhat kind of service do you need? ⚗️";
	const keyboard = await listServicesWithRegisteredArtisan(env);

	if (Object.keys(keyboard).length === 0) {
		return await sendMessage(
			env.API_KEY,
			chatId,
			"Sorry, we currently don't have any services available right now ;) \nPlease try again later."
		);
	}

	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleRegisterArtisan = async (acceptFor, chatId, env) => {
	await acceptTermsAndConditions(acceptFor, chatId, env);
	await setIsBookingFalse(chatId, env);

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
	const response = `Are you sure you want to use \n\'${username}\' as your display name?`;
	const keyboard = {
		inline_keyboard: [
			[
				{ text: 'Yes', callback_data: `${text}` },
				{ text: 'Try again', callback_data: SET_UP_PROFILE },
			],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const selectArtisanServicesToOffer = async (chatId, env) => {
	const response = 'What services do you offer among these?';
	const keyboard = await listServicesToOffer(env);
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleGetArtisanContact = async (callbackData, chatId, env) => {
	const selectedService = callbackData.split('::')[1];
	await storeServiceToDB(selectedService, chatId, env);
	await requestUserContact(chatId, env);
};

export const handleGetArtisanLocation = async (chatId, env) => {
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
	await storeRequestedArtisan(artisan, chatId, env);

	const response = "We'll need your location access to find your nearest artisan 🗺️";
	const keyboard = {
		inline_keyboard: [
			[{ text: 'OK', callback_data: `${LOCATION_ACCESS_GRANTED}` }],
			[{ text: 'Cancel', callback_data: LOCATION_ACCESS_DENIED }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const requestUserLocation = async (chatId, env) => {
	const response = 'Click the Share Location button';
	const keyboard = {
		reply_markup: {
			keyboard: [[{ text: 'Share Location', request_location: true }]],
			one_time_keyboard: true,
			resize_keyboard: true,
		},
	};
	await sendLocationRequest(env.API_KEY, chatId, response, keyboard);
};

export const requestUserContact = async (chatId, env) => {
	const response = 'How should we contact you? 😊';
	const keyboard = {
		reply_markup: {
			keyboard: [[{ text: 'Share Contact', request_contact: true }]],
			one_time_keyboard: true,
			resize_keyboard: true,
		},
	};
	await sendContactRequest(env.API_KEY, chatId, response, keyboard);
};

export const handleLocation = async (location, chatId, env) => {
	const { latitude, longitude } = location;
	const response = `Location Received 👾`;
	await sendMessage(env.API_KEY, chatId, response);
	const isBooking = await checkIsBooking(chatId, env);

	if (isBooking) {
		await storeLocationToDB(latitude, longitude, chatId, env);
		await handleGetArtisansNearMe(`location-${latitude}-${longitude}`, chatId, env);
		return;
	}

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

	const requestedArtisan = await getRequestedArtisan(chatId, env);

	const response = `These are the ${requestedArtisan}s closest to you 👇`;

	const keyboard = await listArtisansByDistance(requestedArtisan, lat, long, chatId, env);

	if (Object.keys(keyboard).length === 0) {
		await sendMessage(env.API_KEY, chatId, `Sorry, there's no ${requestedArtisan}s available right now. Please try again later`);
	} else {
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
	}
};

export const handleLocationAccessDenied = async (chatId, env) => {
	const response = "We understand 😊 \nIf there's anything else we can assist you with, please let us know. Ciao.";
	await sendMessage(env.API_KEY, chatId, response);
};

export const listSelectedArtisanTimeSlots = async (callbackData, chatId, env) => {
	const person = callbackData.split(':')[2];
	const response = `These are ${person}'s open slots. \nPick what time works for you 📩`;
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfSlots);
};

const formatPhoneNumber = (phoneNumber) => {
	if (phoneNumber.startsWith('234')) {
		return '0' + phoneNumber.slice(3);
	}
	return phoneNumber;
};

export const alertVendorOfNewBooking = async (callBackData, chatId, env) => {
	const vendor_username = callBackData.split(':')[1];
	const vendor_phone = formatPhoneNumber(callBackData.split(':')[2]);
	const vendor_chatId = formatPhoneNumber(callBackData.split(':')[3]);

	let response = `We have received your booking request.\n${vendor_username} will be in touch shortly.`;
	let response_to_vendor = `Congratulations! You just got Booked!. \nThe customer will message you shortly.`;

	if (vendor_phone) {
		response += ` \n\nYou can reach them on ${vendor_phone}`;
	} else {
		response += ` \n\nUnfortunately, we do not have the contact number for ${vendor_username} at the moment, but they've gotten your order.`;
	}

	await sendMessage(env.API_KEY, chatId, response);
	await sendMessage(env.API_KEY, vendor_chatId, response_to_vendor);
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
