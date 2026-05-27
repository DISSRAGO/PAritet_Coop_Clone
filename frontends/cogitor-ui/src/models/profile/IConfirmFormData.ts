/**
 * Информация о подтверждении данных о подтверждении
 */
export interface IConfirmFormData {
	/**
	 *
	 */
	Description?: string;
	/**
	 *
	 */
	RepeatDescription?: string;
	/**
	 *
	 */
	ActivationRequestId?: string;
	/**
	 *
	 */
	ActivationCode?: string;
	/**
	 *
	 */
	SpamWarning?: string;
	/**
	 * Пароль
	 */
	Email?: string;
	/**
	 * Логин
	 */
	Login?: string;
	/**
	 * Телефон
	 */
	Phone?: string;
	/**
	 * Пароля
	 */
	Password?: string;
	/**
	 * Повтор пароля
	 */
	RestorePassword?: string;
	/**
	 * Имя
	 */
	FirstName?: string;
	/**
	 * Отчество
	 */
	SecondName?: string;
	/**
	 * Фамилия
	 */
	Surname?: string;
	/**
	 * Идентификатор адреса
	 */
	AddressId?: string;
}
