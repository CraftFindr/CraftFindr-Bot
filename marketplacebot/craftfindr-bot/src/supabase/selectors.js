import { createClient } from '@supabase/supabase-js';
import { errorResponse, successResponse } from '../responses';

export const checkIfUserHasAcceptedTerms = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error } = await supabase
			.from('Users')
			.select('has_accepted_vendor_terms_and_conditions,has_accepted_client_terms_and_conditions')
			.eq('chat_id', chatId);

		if (error) {
			console.error('Error fetching data:', error);
			return errorResponse({ error: error.message });
		}

		return data;
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const isUserInDB = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { error, count } = await supabase.from('Users').select('chat_id', { count: 'exact' }).eq('chat_id', chatId);

		if (error) {
			console.log('Error reading from database: ', error);
			return errorResponse({ error: error.message });
		}

		if (count === 0) {
			return successResponse({ is_present: false });
		}

		return successResponse({ is_present: true });
	} catch (err) {
		console.error('Unexpected error:', err);
		return errorResponse({ error: err.message });
	}
};

export const getAllServices = async (env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { error, data } = await supabase.from('Services').select('service');

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

export const checkIfServiceAlreadyRegisteredToArtisan = async (chatId, service, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error } = await supabase
			.from('ArtisanServices')
			.select('artisan_offering_service_by_chat_id')
			.eq('artisan_offering_service_by_chat_id', chatId)
			.eq('service', service);

		if (error) {
			console.error('Error checking service registration:', error);
			throw new Error(error.message);
		}

		// If the data array is not empty, the service is already registered
		return data.length > 0;
	} catch (err) {
		console.error('Unexpected error:', err);
		throw new Error(err.message);
	}
};

export const checkIfUserIsArtisan = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error } = await supabase.from('Users').select('is_artisan').eq('chat_id', chatId).single();

		if (error) {
			console.error('Error checking user status:', error);
			throw new Error(error.message);
		}

		return data?.is_artisan ?? false;
	} catch (err) {
		console.error('Unexpected error:', err);
		throw new Error(err.message);
	}
};
