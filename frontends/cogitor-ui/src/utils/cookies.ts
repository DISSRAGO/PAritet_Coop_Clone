export interface BasketItem {
	goodId: number;
  goodName: string;
  distributorId: string;
	tvtId: number;
  tvtName: string;
	count: number;
}
class Options {
	path?: string;
	expires?: string | Date;
	"max-age"?: number;
}
export function getCookie(name: string) {
	const matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" +
				name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") +
				"=([^;]*)",
		),
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function getBasketCookie(name: string): Array<BasketItem> {
	const matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" +
				name.replace(/([.$?*|{}()[]\\\/\+^])/g, "\\$1") +
				"=([^;]*)",
		),
	);
	return matches ? JSON.parse(decodeURIComponent(matches[1])) : [];
}

export function setCookie(name: string, value: string, options: Options = {}) {
	options = {
		path: "/",
		// при необходимости добавьте другие значения по умолчанию
		...options,
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (const optionKey in options) {
		updatedCookie += "; " + optionKey;
		const optionValue: any = options[optionKey  as keyof typeof options];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

export function setArrayCookie(
	name: string,
	value: Array<BasketItem>,
	options: Options = {},
) {
	options = {
		path: "/",
		// при необходимости добавьте другие значения по умолчанию
		...options,
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) +
		"=" +
		encodeURIComponent(JSON.stringify(value));

	for (const optionKey in options) {
		updatedCookie += "; " + optionKey;
		const optionValue: any = options[optionKey  as keyof typeof options];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

/**
 * ример использования:
 * setCookie('user', 'John', {secure: true, 'max-age': 3600});
 */

export function deleteCookie(name: string) {
	setCookie(name, "", {
		"max-age": -1,
	});
}
