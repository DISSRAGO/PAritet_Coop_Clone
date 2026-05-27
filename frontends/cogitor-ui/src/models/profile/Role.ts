export type RoleType = "Customer" | "Producer" | "Distributor";

export type Role  = {
	/**
	 * id - идентификатор роли
	 */
	id: number;
	/**
	 * Название роли
	 */
	name: RoleType;
	/**
	 * ФИО пользователя
	 */
	value: string;
	/**
	 * Идентификатор пользователя
	 */
	userId: number;
}
