import {List, Switch} from "antd";
import React, {FC} from "react";

const ProfileNotifications: FC = () => {
	function getData() {
		const Action = <Switch defaultChecked />;
		return [
			{
				title: "Системные настройки",
				description: "Уведомлять о новых событиях?",
				actions: [Action],
			},
			{
				title: "Настройки аккаунта",
				description: "Уведомлять о смене пароля?",
				actions: [Action],
			},
		];
	}
	return (
		<>
			<List
				itemLayout="horizontal"
				dataSource={getData()}
				renderItem={(item) => (
					<List.Item actions={item.actions}>
						<List.Item.Meta
							title={item.title}
							description={item.description}
						/>
					</List.Item>
				)}
			/>
		</>
	);
};

export default ProfileNotifications;
