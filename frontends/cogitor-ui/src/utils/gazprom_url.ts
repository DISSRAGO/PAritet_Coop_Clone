// 'https://lt.pga.gazprombank.ru/pages/?lang_code=RU&merch_id=EFBE3CA61D7B800D486B&back_url_s=%%success_url%%&back_url_f=%%failure_url%%&notify_email=&o.account=1000060
// &o.amount=40000&o.type=4&o.service=30&o.gpbaccountid=47673384C676491E0170&o.orderid=
export const checkGazpromUrl = (
	pattern: string,
	successURL: string,
	failureURL: string,
	amount: string,
): string => {
	let payLink = pattern.replace(/%%success_url%%/gi, successURL);
	payLink = payLink.replace(/%%failure_url%%/gi, failureURL);
	amount = (parseFloat(amount.replace(",", ".")) * 100).toString();
	amount = `o.amount=${amount}&`;

	payLink = payLink.replace(/o\.amount\=(.+?)\&/, amount);
	return payLink;
};
