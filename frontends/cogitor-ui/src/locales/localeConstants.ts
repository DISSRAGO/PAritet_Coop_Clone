import {En_US} from "./en_US";
import {Ru_RU} from "./ru_RU";

export const ENGLISH = {
	code: "en-US",
	language: "english",
};

export const RUSSIAN = {
	code: "ru-RU",
	language: "русский",
};
export const Locales = [ENGLISH, RUSSIAN];
export const Messages = {
	[RUSSIAN.code]: Ru_RU,
	[ENGLISH.code]: En_US,
};
