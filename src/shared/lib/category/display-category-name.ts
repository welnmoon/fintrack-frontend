const TRANSLATIONS: Record<string, string> = {
  Salary: "Зарплата",
  Freelance: "Фриланс",
  Bonus: "Бонус",
  Refund: "Возврат",
  "Investment income": "Инвест. доход",
  Groceries: "Продукты",
  "Coffee & snacks": "Кофе и снеки",
  Transport: "Транспорт",
  "Dining out": "Кафе и рестораны",
  Shopping: "Покупки",
  Entertainment: "Развлечения",
  Bills: "Счета",
  Subscriptions: "Подписки",
  Health: "Здоровье",
  Travel: "Путешествия",
  Home: "Дом",
  Education: "Образование",
  Other: "Другое",
};

export function displayCategoryName(name: string): string {
  return TRANSLATIONS[name] ?? name;
}

export function localizeText(text: string): string {
  let result = text;
  for (const [en, ru] of Object.entries(TRANSLATIONS)) {
    result = result.split(`«${en}»`).join(`«${ru}»`);
  }
  return result;
}
