import { createClient } from '@supabase/supabase-js';
import { isUserInDB } from './selectors'; // Adjust the import path as needed

export const addUserToDB = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const checkResponse = await isUserInDB(chatId, env);
		const responseData = await checkResponse.json();

		if (responseData.error) {
			const error = responseData.error;
			console.error('Error checking user in DB:', error);
			return new Response(JSON.stringify({ error: error.message }), {
				headers: { 'Content-Type': 'application/json' },
				status: 500,
			});
		}

		if (responseData.is_present) {
			return new Response(JSON.stringify({ message: 'User already exists in DB.' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 200,
			});
		}

		// If the user is not present, insert them into the database
		const { data, error } = await supabase.from('Users').insert({ chat_id: chatId }).single();

		if (error) {
			console.error('Error inserting user into DB:', error);
			return new Response(JSON.stringify({ error: error.message }), {
				headers: { 'Content-Type': 'application/json' },
				status: 500,
			});
		}

		console.log('Successfully added new telegram user to DB.');
		return new Response(JSON.stringify({ message: 'User has been successfully added to DB.' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 201,
		});
		//
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		});
	}
};
