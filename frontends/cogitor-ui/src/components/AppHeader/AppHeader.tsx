import {MenuOutlined} from "@ant-design/icons";
import {Drawer, Layout, Menu, Row} from "antd";
import React, {FC} from "react";

import HeaderMenuItems from "./HeaderMenuItems";
import {SITE,PATH} from "../../utils/url"
import { urlManager } from "../../utils/urlManager";

import { useEffect, useState } from "react";
import axios from "axios";

import { useLocation } from "react-router-dom";

const AppHeader: FC = () => {
	const isMobile = false;
	const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
	const showDrawer = () => {
		setMenuDrawerVisible(true);
	};
	const onClose = () => {
		setMenuDrawerVisible(false);
	};

	let location = useLocation()

	const [siteName, setSiteName] = useState('КОГИТЕКА')
	const [url, setUrl] = useState(SITE)

	useEffect(() => {
		if (!(urlManager(location.pathname) || location.pathname == "")) {
			let address = location.pathname.split('/')
			axios({
				method: "post",
				url: PATH + "site/site.php",
				//данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
				headers: { "content-type": "multipart/form-data" },
				data: {method: "getMain", Id: address[address.length-1]},
			}).then((result) => {
				setUrl(result.data.Main.Url != "" ? SITE+result.data.Main.Url : SITE+'sitepage/'+result.data.Main.ID)
				setSiteName(result.data.Main.Name)
			}).catch((error) => {
				
			})
		}
	},[])

	return (
		<>
			<Layout.Header
				style={{
					background: "white",
				}}
			>
				{isMobile ? (
					<Menu theme="light" mode="horizontal">
						<Menu.Item
							key="menu"
							onClick={showDrawer}
							icon={<MenuOutlined />}
						/>
					</Menu>
				) : (
					<Row justify="end">
						<HeaderMenuItems />
					</Row>
				)}
			</Layout.Header>
			{<a className="bigLink" href = {url}>{siteName}</a>}
			<Drawer
				key="menu"
				placement="right"
				closable={false}
				onClose={onClose}
				open={menuDrawerVisible}
			>
				<Menu theme="light" mode="vertical" style={{width: "100%"}}>
					<HeaderMenuItems />
				</Menu>
			</Drawer>
		</>
	);
};

export default AppHeader;
