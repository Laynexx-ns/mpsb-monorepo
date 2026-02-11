import {
	defineI18n,
	type LanguageMap,
	type ShouldFollowLanguage,
} from "@gramio/i18n";
import { format } from "gramio";

export const AVAILABLE_LOCALISATIONS = {
	RU: "ru",
	EN: "en",
} as const;

export type DerivedI18n = ReturnType<typeof createI18n>;
export const createI18n = () => {
	const i18n = defineI18n({
		primaryLanguage: "en",
		languages: {
			// en,
			en,
		},
	});

	return i18n.t;
};

// TODO export to another layer
const ru = {
	greeting: (name: string) =>
		format`Hello, ${name}. Firstly I need your real full name! Please send your full name, example: Ivanov Ivan Ivanovich`,
	alreadyRegistered:
		"You have been already registered. Enjoy using the bot and don't forget to do your homework!",
	somethingWentWrong: "Something went wrong",
	idIsNotValid: "🛠️ Id of user is not valid. Pls report a bug",
	requestAcceptedTextForAdmin: "✅ User succesfully accepted",
	requestAcceptedTextForUser:
		"✅ Admin accepted your request. Congratulations!",
	smthWentWrong: "Something went wrong",
	approve: "✅ Approve",
	disapprove: "🚫 Reject",
	textCantBeEmpty: "Text can't be empty",
	incorrectNameFormat: "Incorrect format. Example: Ivanov Ivan Ivanovich",
	enterClassNumber: "Enter your class. Example: 8T, 8A, 8B",
} satisfies ShouldFollowLanguage<typeof en>;

const en = {
	greeting: (name: string) =>
		format`Привет${name ? `, ${name}` : ""}! Введи свое полное имя, пример: Иванов Иван Иванович`,
	alreadyRegistered:
		"Вы уже зарегистрированы. Наслаждайтесь использованием бота и не забывайте делать домашки!",
	somethingWentWrong: "we",
	idIsNotValid: "🛠️ Айди пользователя невалидно, бейте разраба",
	requestAcceptedTextForAdmin: "✅ Заявка успешно принята",
	requestAcceptedTextForUser: "✅ Администратор одобрил вашу заявку, ура!",
	smthWentWrong: "Что-то пошло не так",
	approve: "✅ Принять",
	disapprove: "🚫 Отклонить",
	textCantBeEmpty: "Текст не может быть пустым",
	incorrectNameFormat: "Неправильный формат. Пример: Иванов Иван Иванович",
	incorrectClassNumberFormat: "Неправильный формат. Пример: 3, 8, 11",
	incorrectClassNumberValue: "Неправильный формат. 1 <= Класс <= 11",
	enterClassNumber:
		"Введите НОМЕР вашего класса (1, 2, 8, 5) или выберите репетиторство",

	wrongClassLetterFormat:
		"Должна быть только одна буква русского алфавита или МАТОЛ",
	enterClassLetter: "Введите букву вашего класса (А, Б, В...)",
} satisfies LanguageMap;

// Strict will show error on missing keys
// satisfies ShouldFollowLanguageStrict<typeof en>;
