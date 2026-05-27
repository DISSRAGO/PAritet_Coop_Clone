export const escapeXml = (unsafeXml: string): string => {
	return unsafeXml.replace(/[<>&'"]/g, (c: string) => {
		switch (c) {
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case "&":
				return "&amp;";
			case "'":
				return "&apos;";
			case '"':
				return "&quot;";
			default:
				return "";
		}
	});
};

export const htmlDecode = (input: string): string | null => {
	const doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
};
