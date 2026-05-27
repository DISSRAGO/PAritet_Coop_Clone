import {Layout} from "antd";
import React, {FC} from "react";


import { useLocation } from "react-router-dom";

import AppFooter from "../../components/AppFooter";
import AppHeader from "../../components/AppHeader/AppHeader";



import "./MainLayout.less";

type MainLayoutProps = {
	children: React.ReactNode;
}
const MainLayout: FC<MainLayoutProps> = (props) => {
	const {children} = props;

	let location = useLocation()

	return (
		<>
		{location.search == "?lite=true" ?
			<Layout className="container">
				<Layout.Content className="content">
					{children}
				</Layout.Content>
			</Layout>
		: 
			<Layout className="container">
				<AppHeader />
				<Layout.Content className="content">
					{children}
				</Layout.Content>
				<AppFooter />
			</Layout>
		}
		</>
	);
};

export default MainLayout;
