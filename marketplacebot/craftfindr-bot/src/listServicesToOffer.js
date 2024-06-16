import { getAllServices } from './supabase/selectors';
import { errorResponse } from './responses';

export const listServicesToOffer = async (env) => {
	try {
		const services = await getAllServices(env);

		console.log('----services list: ', services);

		if (!services || services.length === 0) {
			return errorResponse({ error: 'No services available' });
		}

		const inlineKeyboard = [];

		// Generate inline keyboard layout
		for (let i = 0; i < services.length; i += 2) {
			const row = [];

			row.push({
				text: services[i].service,
				callback_data: `selectedService::${services[i].service}`,
			});

			if (i + 1 < services.length) {
				row.push({
					text: services[i + 1].service,
					callback_data: `selectedService::${services[i + 1].service}`,
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
