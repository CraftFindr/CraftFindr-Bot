import { BOOKING_CANCELLED, BOOKING_CONFIRMED } from './handlers/messageHandlers';

export const listOfArtisans = {
	inline_keyboard: [
		[
			{ text: 'Hairdresser 💇‍♀️', callback_data: 'selectedArtisan:Hairdresser' },
			{ text: 'Plumber 🔧', callback_data: 'selectedArtisan:Plumber' },
		],
		[
			{ text: 'Chef 🧑‍🍳', callback_data: 'selectedArtisan:Chef' },
			{ text: 'Nanny 🤱', callback_data: 'selectedArtisan Nanny' },
		],
		[
			{ text: 'Makeup Artist 💄', callback_data: 'selectedArtisan:Makeup Artist' },
			{ text: 'Others ?', callback_data: 'selectedArtisan:Others' },
		],
	],
};

export const listOfSlots = {
	inline_keyboard: [
		[
			{ text: '9:00 AM', callback_data: 'selectedTimeSlot-9:00' },
			{ text: '10:00 AM', callback_data: 'selectedTimeSlot-10:00' },
		],
		[
			{ text: '11:00 AM', callback_data: 'selectedTimeSlot-11:00' },
			{ text: '12:00 PM', callback_data: 'selectedTimeSlot-12:00' },
		],
		[
			{ text: '1:00 PM', callback_data: 'selectedTimeSlot-13:00' },
			{ text: '2:00 PM', callback_data: 'selectedTimeSlot-14:00' },
		],
		[{ text: '3:00 PM', callback_data: 'selectedTimeSlot-15:00' }],
	],
};

export const confirmOrCancelBooking = {
	inline_keyboard: [
		[
			{ text: 'Confirm Booking', callback_data: BOOKING_CONFIRMED },
			{ text: 'Cancel Booking', callback_data: BOOKING_CANCELLED },
		],
	],
};
