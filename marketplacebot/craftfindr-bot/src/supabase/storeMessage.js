import { createClient } from '@supabase/supabase-js';

export const storeMessage = async (message, env) => {
	const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
	const { data, error } = await supabase
		.from('Users')
		.insert([{ chat_id: message.chat.id, is_artisan: false, username: message.from.username, message_sent: message.text }])
		.select();
	if (error) throw error;
	return new Response(JSON.stringify(data), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
