import React, {useState, FC} from "react";

const CACHE_KEY = "IS_DARK";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ThemeContext = React.createContext({isDark: null, toggleTheme: () => {}});

const ThemeContextProvider: FC<any> = ({children}) => {
	const [isDark, setIsDark] = useState(() => {
		const isDarkUserSetting = localStorage.getItem(CACHE_KEY);
		return isDarkUserSetting ? JSON.parse(isDarkUserSetting) : false;
	});

	const toggleTheme = () => {
		setIsDark((prevState: any) => {
			localStorage.setItem(CACHE_KEY, JSON.stringify(!prevState));
			return !prevState;
		});
	};

	return (
		<ThemeContext.Provider value={{isDark, toggleTheme}}>
			{children}
		</ThemeContext.Provider>
	);
};

export {ThemeContext, ThemeContextProvider};
