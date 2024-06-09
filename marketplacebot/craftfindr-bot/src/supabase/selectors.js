import { createClient } from '@supabase/supabase-js';

export const checkAcceptedTerms = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

		const { data, error } = await supabase.from('Users').select('has_accepted_vendor_terms_and_conditions').eq('chat_id', chatId).single();

		if (error) {
			console.error('Error fetching data:', error);
			return new Response(JSON.stringify({ error: error.message }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}

		return new Response(JSON.stringify({ has_accepted_terms: data.has_accepted_terms }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 200,
		});
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 500,
		});
	}
};

export const isUserInDB = async (chatId, env) => {
	try {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error, count } = await supabase.from('Users').select('chat_id', { count: 'exact' }).eq('chat_id', chatId);

		if (error) {
			console.log('Error reading from database: ', error);
			return new Response(JSON.stringify({ error: error.message }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}

		if (count === 0) {
			return new Response(JSON.stringify({ is_present: false }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			});
		}

		return new Response(JSON.stringify({ is_present: true }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 200,
		});
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 500,
		});
	}
};
