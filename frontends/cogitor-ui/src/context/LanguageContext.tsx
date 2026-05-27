import {ConfigProvider} from "antd";
import enUS from "antd/lib/locale/en_US";
import ruRU from "antd/lib/locale/ru_RU";
import React, {FC, useState, useEffect} from "react";
import {IntlProvider} from "react-intl";

import {Locales, RUSSIAN, Messages} from "../locales/localeConstants";

const CACHE_KEY = "currentLanguage";

export interface LangType {
	code: string;
	language: string;
}

export interface LanguageState {
	selectedLanguage: LangType;
	setSelectedLanguage: (langObject: LangType) => void;
}

const LanguageContext = React.createContext({
	selectedLanguage: RUSSIAN,
	setSelectedLanguage: () => undefined,
} as LanguageState);

const LanguageContextProvider: FC<any> = ({children}) => {
	const [selectedLanguage, setSelectedLanguage] = useState<any>(RUSSIAN);
	const [selectedAntdLanguage, setSelectedAntdLanguage] = useState<any>(ruRU);
	const getStoredLang = (storedLangCode: string) =>
		Locales.filter((language) => language.code === storedLangCode)[0];

	useEffect(() => {
		const storedLangCode = localStorage.getItem(CACHE_KEY);
		if (storedLangCode) {
			const storedLang = getStoredLang(storedLangCode);
			setSelectedLanguage(storedLang);
			if (storedLang.code === RUSSIAN.code) {
				setSelectedAntdLanguage(ruRU);
			} else {
				setSelectedLanguage(enUS);
			}
		} else {
			setSelectedLanguage(RUSSIAN);
			setSelectedAntdLanguage(ruRU);
		}
	}, []);

	const handleLanguageSelect = (langObject: LangType) => {
		setSelectedLanguage(langObject);
		localStorage.setItem(CACHE_KEY, langObject.code);
	};

	return (
		<LanguageContext.Provider
			value={{
				selectedLanguage,
				setSelectedLanguage: handleLanguageSelect,
			}}
		>
			<ConfigProvider locale={selectedAntdLanguage}>
				<IntlProvider
					messages={Messages[selectedLanguage.code]}
					locale={selectedLanguage.code}
					defaultLocale={RUSSIAN.code}
				>
					{children}
				</IntlProvider>
			</ConfigProvider>
		</LanguageContext.Provider>
	);
};

export {LanguageContext, LanguageContextProvider};
