import {Menu} from "antd";
import React, {FC, useEffect} from "react";
import {useState} from "react";

import {useActions} from "../../hooks/useActions";
import "./ProfilePage.less";
import ProfileAddress from "./components/ProfileAddress";
import ProfileInfo from "./components/ProfileInfo";
import NotificationPage from "./components/ProfileNotifications";

const ProfilePage: FC = () => {
	const {getProfile, saveProfileAddress} = useActions();
	const menuTitle = ["Профиль", "Адрес", "Уведомления"];
	const [selectedKey, setSelectedKey] = useState(0);
	useEffect(() => {
		getProfile();
	}, []);
	const selectKey = (key: any) => {
		if (key.key === "Профиль") {
			setSelectedKey(0);
		} else if (key.key === "Адрес") {
			setSelectedKey(1);
		} else {
			setSelectedKey(2);
		}
	};
	function renderRightMenu() {
		if (menuTitle[selectedKey] === "Профиль") {
			return <ProfileInfo />;
		} else if (menuTitle[selectedKey] === "Адрес") {
			return <ProfileAddress />;
		} else {
			return <NotificationPage />;
		}
	}
	return (
		<div className="main">
			<div className="leftmenu">
				<Menu
					mode="inline"
					selectedKeys={[menuTitle[selectedKey]]}
					onClick={selectKey}
				>
					<Menu.Item key={menuTitle[0]}>{menuTitle[0]}</Menu.Item>
					<Menu.Item key={menuTitle[1]}>{menuTitle[1]}</Menu.Item>
					<Menu.Item key={menuTitle[2]}>{menuTitle[2]}</Menu.Item>
				</Menu>
			</div>
			<div className="right">
				<div className="title">{menuTitle[selectedKey]}</div>
				{renderRightMenu()}
			</div>
		</div>
	);
};

export default ProfilePage;
