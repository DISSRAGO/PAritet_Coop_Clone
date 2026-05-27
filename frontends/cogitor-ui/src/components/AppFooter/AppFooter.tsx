import {Button, Layout, message} from "antd";
import React, {FC, useEffect, useState} from "react";
import "./AppFooter.less";

const AppFooter: FC = () => {

	return (
		<Layout.Footer className="footer mt-auto">
			<div className="copyright">©2025 Создано компанией Аланов;</div>
			<div className="copyright">
				Контактные данные: +7(383)335-66-06, soc@paritet.club
			</div>
			<div className="links">
				<a href="http://paritet.club/" target="blank">
					Информация о проекте
				</a>
			</div>
		</Layout.Footer>
	);
};

export default AppFooter;
