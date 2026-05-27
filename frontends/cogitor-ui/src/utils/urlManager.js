export function urlManager(address) {
    const string = address.split('/'); // Разделяем строку на слова
    const catalog = string[1]; // Получаем первое слово

    // Определяем перечень возможных слов и соответствующие им константы
    const constants = [
      'profile',
      'navigator',
      'billing',
      'story',
      'comments',
      'admin',
      'login',
      'sign-up',
      'sign-in',
    ]
  return (constants.includes(catalog))
}
