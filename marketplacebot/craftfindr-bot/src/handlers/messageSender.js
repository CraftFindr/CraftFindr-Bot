export async function sendMessage(apiKey, chatId, text) {
	const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
	const data = await fetch(url).then((resp) => resp.json());
}

export async function sendMessageWithKeyboard(apiKey, chatId, text, keyboard) {
	const url = `https://api.telegram.org/bot${apiKey}/sendMessage`;
	const payload = {
		chat_id: chatId,
		text: text,
		reply_markup: JSON.stringify(keyboard),
	};
	const options = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	};
	const response = await fetch(url, options);
	return response.json();
}

export const sendLocationRequest = async (apiKey, chatId, text, keyboard) => {
	const url = `https://api.telegram.org/bot${apiKey}/sendMessage`;
	await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chat_id: chatId, text, reply_markup: keyboard.reply_markup }),
	});
};
