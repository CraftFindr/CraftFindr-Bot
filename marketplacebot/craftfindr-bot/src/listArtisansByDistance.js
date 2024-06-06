const getDistance = () => {
	// fetch lat and long of vendor from database and of client from telegram, then calculate and return the distance as a number
	return 5;
};

export const listArtisansByDistance = (artisan) => {
	const DISTANCE = getDistance();
	const vendor = [
		{ name: 'Iyanu', distance: `${DISTANCE}km` },
		{ name: 'Daniel', distance: `${DISTANCE}km` },
		{ name: 'Felix', distance: `${DISTANCE + 2}km` },
		{ name: 'Mariam', distance: `${DISTANCE + 3}km` },
		{ name: 'John', distance: `${DISTANCE + 6}km` },
	];
	const nestedNames = [];
	for (let i = 0; i < vendor.length; i += 2) {
		nestedNames.push(vendor.slice(i, i + 2));
	}

	const keyboard = {
		inline_keyboard: nestedNames.map((vendors) =>
			vendors.map((vendorDetails) => {
				return {
					text: `${vendorDetails.name}  (${vendorDetails.distance})`,
					callback_data: `artisanNearMe:${artisan}:${vendorDetails.name}`,
				};
			})
		),
	};

	return keyboard;
};
