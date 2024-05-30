import { confirmOrCancelBooking, listOfArtisans, listOfSlots } from '../keyboards.js';
import { listArtisansByDistance } from '../listArtisansByDistance.js';
import { sendMessage, sendMessageWithKeyboard } from './messageSender.js';
import { TERMS_AND_CONDITIONS_LINK, ACCEPT_TERMS_THEN_BOOK, ACCEPT_TERMS_THEN_REGISTER, REGISTER_KRAFT } from './messageHandlers.js';

var hasAcceptedTermsAndConditions = false;

export const handleTermsAndConditions = async (callbackData, chatId, env) => {
	const response = `For your own safety, please confirm that you have read and accepted our Terms and Conditions ${TERMS_AND_CONDITIONS_LINK} before proceeding`;
	const keyboard = {
		inline_keyboard: [
			[{ text: 'Proceed', callback_data: callbackData === REGISTER_KRAFT ? ACCEPT_TERMS_THEN_REGISTER : ACCEPT_TERMS_THEN_BOOK }],
		],
	};
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
};

export const handleBookArtisan = async (chatId, env) => {
	hasAcceptedTermsAndConditions = true;
	const response = "Thanks for accepting those. \nNow, let's hook you up 👻 \nWhat kind of service do you need? ⚗️";
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfArtisans);
};

export const handleRegisterArtisan = async (chatId, env) => {
	hasAcceptedTermsAndConditions = true;
	const response = 'Thanks for accepting those. \nThis is when we would set up your profile 👻 \nThat feature is coming soon!';
	await sendMessage(env.API_KEY, chatId, response);
};

export const handleSelectedArtisan = async (callbackData, chatId, env) => {
	const selected = callbackData.split(':')[1];
	let response = `These are the ${selected}s near you 👇`;

	if (selected === 'Others') {
		response = 'This feature is coming soon! 🚧 \nYou can still book any of the below services🔻';
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfArtisans);
	} else {
		const keyboard = listArtisansByDistance(selected);
		await sendMessageWithKeyboard(env.API_KEY, chatId, response, keyboard);
	}
};

export const handleSelectedArtisanNearMe = async (callbackData, chatId, env) => {
	const person = callbackData.split(':')[2];
	const response = `These are ${person}'s open slots. \nPick what time works for you 📩`;
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, listOfSlots);
};

export const handleSelectedTimeSlot = async (callbackData, chatId, env) => {
	const response = `Almost there ⏳ \nTheir price starts at N2000 for this service. \nPlease note that this price is subject to change depending on any additional costs post booking 📬`;
	console.log('sending keyboard...');
	await sendMessageWithKeyboard(env.API_KEY, chatId, response, confirmOrCancelBooking);
	console.log('keyboard sent after receiving callBack: ', callbackData);
};
