/**
 * Данные из регистрационной формы
 */
export interface IRegistrationFormData {
	/**
	 * Фамилия
	 */
	surname?: string;
	/**
	 * Имя
	 */
	firstName?: string;
	/**
	 * Отчество
	 */
	secondName?: string;
	/**
	 * Телефон
	 */
	phone?: string;
	/**
	 * Почта
	 */
	email?: string;
	/**
	 * Логин
	 */
	login?: string;
	/**
	 * Пароль
	 */
	password?: string;
	/**
	 * Повтор пароля
	 */
	restorePassword?: string;
	/**
	 * Идентификатор адреса
	 */
	addressId?: number;
}
