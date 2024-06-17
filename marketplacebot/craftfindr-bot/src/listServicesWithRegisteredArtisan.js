import { createClient } from '@supabase/supabase-js';
import { errorResponse } from './responses';

export const getServicesWithRegisteredArtisan = async (env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { error, data } = await supabase.from('Services').select('service').eq('has_registered_artisan', 'TRUE');

		if (error) {
			console.log('Error reading from database: ', error);
			return errorResponse({ error: error.message });
		}
		return data;
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const listServicesWithRegisteredArtisan = async (env) => {
	try {
		const services = await getServicesWithRegisteredArtisan(env);

		console.log('----services with registered artisan: ', services);

		if (!services || services.length === 0) {
			return errorResponse({ error: 'No services available' });
		}

		const inlineKeyboard = [];

		// Generate inline keyboard layout
		for (let i = 0; i < services.length; i += 2) {
			const row = [];

			row.push({
				text: services[i].service,
				callback_data: `selectedArtisan:${services[i].service}`,
			});

			if (i + 1 < services.length) {
				row.push({
					text: services[i + 1].service,
					callback_data: `selectedArtisan:${services[i + 1].service}`,
				});
			}

			inlineKeyboard.push(row);
		}

		return {
			inline_keyboard: inlineKeyboard,
		};
	} catch (err) {
		console.error('Error generating services keyboard:', err);
		return errorResponse({ error: err.message });
	}
};
