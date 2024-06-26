import { createClient } from '@supabase/supabase-js';
import { errorResponse } from './responses';
import { getRequestedArtisan } from './supabase/selectors';

const getDistance = () => {};

export const listArtisansByDistance = async (requestedArtisan, lat, long, chatid, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		// Get chat_id of Vendors offering that service
		const { data: vendorsChatId, error: vendorsError } = await supabase
			.from('ArtisanServices')
			.select('artisan_offering_service_by_chat_id')
			.eq('service', requestedArtisan);

		if (vendorsError) {
			console.error('Error fetching Vendors offering that service: ', vendorsError);
			return errorResponse({ error: vendorsError.message });
		}

		if (!vendorsChatId || Object.keys(vendorsChatId).length === 0) {
			console.log('No vendors available for that service===', vendorsChatId);
			return errorResponse({ error: 'No vendors available' });
		}

		// Get chat_ids from vendorsChatId array
		const chatIds = vendorsChatId.map((vendor) => vendor.artisan_offering_service_by_chat_id);

		const { data: userData, error: userDataError } = await supabase
			.from('Users')
			.select('chat_id, username, phone_number')
			.in('chat_id', chatIds);

		if (userDataError) {
			console.error('Error fetching userdata: ', userDataError);
			return errorResponse({ error: userDataError.message });
		}

		console.log('User Data:', userData);
		const inlineKeyboard = [];

		// Generate inline keyboard layout
		for (let i = 0; i < userData.length; i += 2) {
			const row = [];

			row.push({
				text: userData[i].username,
				callback_data: `getVendorsFor:${userData[i]['username']}:${userData[i]['phone_number']}:${userData[i]['chat_id']}`,
			});

			if (i + 1 < userData.length) {
				row.push({
					text: userData[i + 1].username,
					callback_data: `getVendorsFor:${userData[i + 1]['username']}:${userData[i + 1]['phone_number']}:${userData[i + 1]['chat_id']}`,
				});
			}

			inlineKeyboard.push(row);
		}

		return {
			inline_keyboard: inlineKeyboard,
		};
	} catch (err) {
		console.error('Error generating requested_artisan keyboard:', err);
		return errorResponse({ error: err.message });
	}
};
