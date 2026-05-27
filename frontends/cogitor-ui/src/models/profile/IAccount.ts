/**
 * Валюта
 */
export interface ICurrency {
	/**
	 * Идентификатор валюты
	 */
	id: string;
	/**
	 * Название валюты
	 */
	name: string;
	/**
	 * Тип валюты
	 */
  currencyType: string;
}

export interface IAccount {
	id?: number;
	number?: number;
	fullNumber?: string;
  amount?: number;
	currency?: ICurrency;
}
