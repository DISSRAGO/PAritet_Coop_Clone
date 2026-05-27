import {Form, Input, Modal} from "antd";
import React, {FC} from "react";

import {useTypedSelector} from "../../hooks/useTypedSelector";
import {checkGazpromUrl} from "../../utils/gazprom_url";

interface AccountReplenishmentModalProps {
	isModalVisible: boolean;
	setIsModalVisible(value: boolean): void;
}
export const AccountReplenishmentModal: FC<AccountReplenishmentModalProps> = (
	props,
) => {
	const [form] = Form.useForm();
	const payLink = useTypedSelector((state) => state.user.payLink);
	const handleOk = () => {
		form.validateFields()
			.then((values) => {
				const url = checkGazpromUrl(
					payLink,
					"https://golos.nsk.ru/",
					"https://golos.nsk.ru/",
					values.amount,
				);
				const win = window.open(url, "_blank");
				win?.focus();
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
	};

	const handleCancel = () => {
		props.setIsModalVisible(false);
	};
	return (
		<Modal
			title="Укажите сумму"
			visible={props.isModalVisible}
			okText="Пополнить счёт"
			onOk={handleOk}
			onCancel={handleCancel}
		>
			<Form name="amount" form={form}>
				<Form.Item label="Сумма" name="amount">
					<Input placeholder="введите сумму" />
				</Form.Item>
			</Form>
		</Modal>
	);
};
