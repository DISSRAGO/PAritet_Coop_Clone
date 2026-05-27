import {
	LogoutOutlined,
	HomeOutlined,
	WalletOutlined,
	UserOutlined,
	EyeOutlined,
	CommentOutlined,
	ToolOutlined,
} from "@ant-design/icons";
import {Avatar, Menu} from "antd";
import React, {FC, useContext, useEffect} from "react";
import {NavLink, Link, useLocation} from "react-router-dom";

import { useMediaQuery } from "react-responsive";

import {AuthContext} from "../../context/AuthContext";
import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {ROUTE_NAMES} from "../../routes/AppRoutesSettings";
import {FetchStatus} from "../../store/types/fetchTypes";
import {
	convertBinaryStringToFile,
	DEFAULT_AVATAR_URL,
} from "../../utils/avatar";
import {getAccessToken} from "../../utils/checkAuth";
import { urlManager } from "../../utils/urlManager";

const HeaderMenuItems: FC = () => {
	const {isAuth} = useContext(AuthContext);
	const headerInfo = useTypedSelector((state) => state.user.headerInfo);
	const logoutRequestStatus = useTypedSelector(
		(state) => state.auth.logoutRequestStatus,
	);
	const {logout, getHeaderInformation} = useActions();

	useEffect(() => {
		if (getAccessToken()) {
			getHeaderInformation();
		}
	}, []);
	useEffect(() => {
		if (logoutRequestStatus.status == FetchStatus.SUCCESS) {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			window.location.reload();
		}
	}, [logoutRequestStatus]);
	function getAvatar() {
		if (headerInfo?.data?.photoImage?.binaryContents) {
			return convertBinaryStringToFile(
				headerInfo?.data?.photoImage?.binaryContents ?? '',
				headerInfo?.data?.photoImage?.contentType ?? '',
			);
		}
		return DEFAULT_AVATAR_URL;
	}
	const handleLogout = () => {
		logout();
	};

	let location = useLocation()

	const authMenu = [
		{
			key: "icon",
			expandIcon: <Avatar src={getAvatar()} />,
			children: [
				{
					key: "profile",
					icon: <UserOutlined />,
					label: <a href={ROUTE_NAMES.PROFILE}>Профиль</a>
				},
				{
					key: "billing",
					icon: <WalletOutlined />,
					label: <a href={ROUTE_NAMES.BILLING}>Кошелёк</a>
				},
				{
					key: "story",
					icon: <EyeOutlined />,
					label: <a href={ROUTE_NAMES.STORY_PAGE}>Список просмотренных тханок</a>
				},
				{
					key: "announcements",
					icon: <HomeOutlined />,
					label: <a href={ROUTE_NAMES.HOME_PAGE}>На главную страницу</a>
				},
				{
					key: "comments",
					icon: <CommentOutlined />,
					label: <a href={ROUTE_NAMES.COMMENTS_PAGE}>Мои комментарии</a>
				},
				((sessionStorage.getItem("admin") === "1") &&
					{
						key: "admin",
						icon: <ToolOutlined />,
						label: <a href={ROUTE_NAMES.ADMIN}>Портал администратора</a>
					}
				),
				{
					key: "logout",
					icon: <LogoutOutlined />,
					label: <a>Выйти</a>,
					onClick: () => handleLogout()
				}
			]
		}	
	]

	const isTinyScreen = useMediaQuery({query : '(max-width: 640px)'});

	return (
		<>
		<div className="navLinks">
			{ isAuth && !isTinyScreen &&  
				<a href = {ROUTE_NAMES.PROFILE}>Профиль</a> 
			}
			{ !isAuth && 
				<a href={ROUTE_NAMES.SIGN_IN_PAGE}>Войти</a>
			}
			{ !isAuth && urlManager(location.pathname) &&
				<a href={ROUTE_NAMES.SIGN_UP}>Регистрация</a>
			}
			{ !isTinyScreen && 
				<a href = {ROUTE_NAMES.HOME_PAGE}>Главная</a>
			}
		</div>
		{isAuth && 
			<Menu theme="light" mode="vertical" items={authMenu} />
		}
		
	</>
	);
};

export default HeaderMenuItems;
