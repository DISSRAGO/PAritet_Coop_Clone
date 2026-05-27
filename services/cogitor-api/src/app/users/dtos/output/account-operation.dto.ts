/**
 * Операция на счёте
 */
export class AccountOperationDto {
  /**
   * остаток после выполнения операции
   */
  rest?: string;
  /**
   * Дата проведения операции
   */
  date?: string;
  /**
   * От кого проведена операция
   */
  from?: string;
  /**
   * кто получатель
   */
  to?: string;
  /**
   * Описание операции, если есть
   */
  description?: string;
  /**
   * Тип операции, если есть
   */
  type?: string;
  /**
   * Сколько перевели
   */
  value?: string;
  /**
   * С какого IP произошёл
   */
  IP?: string;
}
