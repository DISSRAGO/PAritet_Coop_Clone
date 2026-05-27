import React, {FC, useCallback, useEffect, useState} from "react";
import {useMediaQuery} from "react-responsive";

enum screens {
	xs = "xs",
	sm = "sm",
	md = "md",
	lg = "lg",
	xl = "xl",
	xxl = "xxl",
}

export interface MediaState {
	isMobile: boolean;
	currentScreenSize: string;
	setCurrentScreenSize: (string: string) => void;
}

const MediaContext = React.createContext({
	isMobile: false,
	currentScreenSize: screens.lg,
	setCurrentScreenSize: () => undefined,
} as MediaState);

export const MediaContextProvider: FC<any> = ({children}) => {
	const [currentScreenSize, setCurrentScreenSize] = useState<string>(
		screens.lg,
	);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	// phone
	const xs = useMediaQuery({
		maxWidth: "575px",
	});
	// landscape phone
	const sm = useMediaQuery({
		minWidth: "576px",
		maxWidth: "767px",
	});
	// tablet
	const md = useMediaQuery({
		minWidth: "768px",
		maxWidth: "991px",
	});
	//
	const lg = useMediaQuery({
		minWidth: "992px",
		maxWidth: "1199px",
	});
	// large
	const xl = useMediaQuery({
		minWidth: "1200px",
		maxWidth: "1599px",
	});

	const xxl = useMediaQuery({
		minWidth: "1600px",
	});
	const setCurrentSize = useCallback(() => {
		if (xs) {
			setCurrentScreenSize(screens.xs);
			setIsMobile(true);
			console.log(screens.xs);
		} else if (sm) {
			setCurrentScreenSize(screens.sm);
			setIsMobile(true);
			console.log(screens.sm);
		} else if (md) {
			setCurrentScreenSize(screens.md);
			setIsMobile(true);
			console.log(screens.md);
		} else if (lg) {
			setCurrentScreenSize(screens.lg);
			setIsMobile(false);
			console.log(screens.lg);
		} else if (xl) {
			setCurrentScreenSize(screens.xl);
			setIsMobile(false);
			console.log(screens.xl);
		} else if (xxl) {
			setCurrentScreenSize(screens.xxl);
			setIsMobile(false);
			console.log(screens.xxl);
		}
	}, [lg, md, sm, xl, xs, xxl]);
	/*useEffect(() => {
		setCurrentSize()
	})*/
	useEffect(() => {
		setCurrentSize();
	}, [xs, sm, md, lg, xl, xxl, setCurrentSize]);
	return (
		<MediaContext.Provider
			value={{isMobile, currentScreenSize, setCurrentScreenSize}}
		>
			{children}
		</MediaContext.Provider>
	);
};
