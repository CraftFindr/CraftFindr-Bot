export const successResponse = (body, status = 200) => {
	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json',
		},
		status,
	});
};

export const errorResponse = (body, status = 500) => {
	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json',
		},
		status,
	});
};
