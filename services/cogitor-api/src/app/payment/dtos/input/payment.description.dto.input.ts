export class PaymentDescriptionDtoInput {
  amount: string;
  typeTo: string;
  description: string;
  login: string;
}

/**
 * @param token{string} - токен пользователя
 * @param amount{string} - сумма перевода
 * @param typeTo{string} - форма перевода
 * @param description{string} - описание перевода
 * @param login{string} - логин пользователя, которому перевожу деньги
 */
