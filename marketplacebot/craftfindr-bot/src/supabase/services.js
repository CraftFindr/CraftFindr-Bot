import { createClient } from '@supabase/supabase-js';
import { isUserInDB, checkIfServiceAlreadyRegisteredToArtisan } from './selectors';
import { errorResponse, successResponse } from '../responses';
import { selectArtisanServicesToOffer } from '../handlers/queryHandlers';

export const addUserToDB = async (chatId, username, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const checkResponse = await isUserInDB(chatId, env);
		const responseData = await checkResponse.json();

		if (responseData.error) {
			const error = responseData.error;
			console.error('Error checking user in DB:', error);
			return errorResponse({ error: error.message });
		}

		if (responseData.is_present) {
			return successResponse({ message: 'User already exists in DB.' });
		}

		// If the user is not present, insert them into the database
		const { error } = await supabase.from('Users').insert({ chat_id: chatId, username: username }).single();

		if (error) {
			console.error('Error inserting user into DB:', error);
			return errorResponse({ error: error.message });
		}

		console.log('Successfully added new telegram user to DB.');
		return successResponse({ message: 'User has been successfully added to DB.' });
		//
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const acceptTermsAndConditions = async (acceptFor, chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

		if (acceptFor == 'ARTISAN') {
			const { error } = await supabase.from('Users').update({ accepted_vendor_terms_and_conditions: true }).eq('chat_id', chatId).select();

			if (error) {
				console.error('Error updating artisan TERMS AND CONDITIONS status in DB:', error);
				return errorResponse({ error: error.message });
			}
		} else {
			const { error } = await supabase.from('Users').update({ accepted_terms_and_conditions: true }).eq('chat_id', chatId).select();
			if (error) {
				console.error('Error updating client TERMS AND CONDITIONS status in DB:', error);
				return errorResponse({ error: error.message });
			}
		}
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const registerArtisanDisplayName = async (callbackData, chatId, env) => {
	const username = String(callbackData.slice(1));
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { error } = await supabase.from('Users').update({ username: username, is_artisan: true }).eq('chat_id', chatId).select();

		if (error) {
			console.error('Error updating username in DB:', error);
			return errorResponse({ error: error.message });
		}

		console.log('Successfully updated user in DB.');
		await selectArtisanServicesToOffer(chatId, env);
		return successResponse({ message: 'User has been successfully updated in DB.' });
		//
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const storeServiceToDB = async (service, chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const isServiceAlreadyRegisteredToArtisan = await checkIfServiceAlreadyRegisteredToArtisan(chatId, service, env);

		if (isServiceAlreadyRegisteredToArtisan) {
			console.log('Service is already registered to artisan.');
			return successResponse({ message: 'Service is already registered to artisan.' });
		}

		console.log('Registering service to artisan...');
		const { error } = await supabase.from('ArtisanServices').insert({ service: service, artisan_offering_service_by_chat_id: chatId });
		console.log('New service has been registered to artisan on the Services table.');

		if (error) {
			console.error('Error inserting service into DB:', error);
			return errorResponse({ error: error.message });
		}
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const storeLocationToDB = async (latitude, longitude, chatId, env) => {
	try {
		const location = `${latitude},${longitude}`;
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { error } = supabase.from('Users').update({ location: location }).eq('chat_id', chatId);

		if (error) {
			console.error('Error updating location in DB:', error);
			return errorResponse({ error: error.message });
		}

		console.log('Successfully updated user location in DB.');
		return successResponse({ message: 'User location has been successfully updated in DB.' });
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};
