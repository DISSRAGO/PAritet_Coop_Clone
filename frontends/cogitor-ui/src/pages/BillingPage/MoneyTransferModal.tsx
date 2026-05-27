import {Form, Input, Mentions, Modal, Select} from "antd";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {FetchStatus} from "../../store/types/fetchTypes";

interface MoneyTransferModalModalProps {
	isModalVisible: boolean;
	setIsModalVisible(value: boolean): void;
}
export const MoneyTransferModal: FC<MoneyTransferModalModalProps> = (props) => {
	const [form] = Form.useForm();
	const {pay_step2, pay_step3} = useActions();
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [login, setLogin] = useState("");
	const [contractFrom, setContractFrom] = useState("");
	const [typeTo, setTypeTo] = useState("");
	const paymentOptions = useTypedSelector(
		(state) => state.payment.paymentOptions,
	);
	const activationCodeStatus = useTypedSelector(
		(state) => state.payment.activationCodeStatus,
	);
	const paymentStatus = useTypedSelector(
		(state) => state.payment.paymentStatus,
	);
	useEffect(() => {
		if (activationCodeStatus.status == FetchStatus.SUCCESS) {
			pay_step3(
				activationCodeStatus.data.ActivationRequestId,
				activationCodeStatus.data.ActivationCode,
				contractFrom,
				amount,
				typeTo,
				login,
				description,
			);
		}
	}, [activationCodeStatus]);
	useEffect(() => {
		if (paymentStatus.status == FetchStatus.SUCCESS) {
		}
	}, [paymentStatus]);
	const handleOk = () => {
		form.validateFields()
			.then((values) => {
				setAmount(values.amount);
				setDescription(values.description);
				setLogin(values.login);
				setContractFrom(values.contractFrom);
				setTypeTo(values.typeTo);
				pay_step2(values.amount, values.description, values.login);
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
				<Form.Item label="Способ перевода" name="typeTo">
					<Select>
						{paymentOptions.data.typeTo.map((item, index) => (
							<Select.Option key={index} value={item.value}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="Номер счёта" name="contractFrom">
					<Select>
						{paymentOptions.data.contractFrom.map((item, index) => (
							<Select.Option key={index} value={item.value}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="Описание" name="description">
					<Input placeholder="введите описание" />
				</Form.Item>
				<Form.Item label="Логин" name="login">
					<Input placeholder="введите логин пользователя" />
				</Form.Item>
			</Form>
		</Modal>
	);
};
