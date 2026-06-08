import {Button, Form, Input, message} from "antd";
import React, {FC, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {FetchStatus} from "../../store/types/fetchTypes";

const ConfirmSignUp: FC = () => {
	const history = useNavigate();
	const {confirmSignUp} = useActions();
	const signUpRequestStatus = useTypedSelector(
		(state) => state.auth.signUpRequestStatus,
	);
	const confirmRequestStatus = useTypedSelector(
		(state) => state.auth.confirmRequestStatus,
	);
	useEffect(() => {
		if (confirmRequestStatus.status == FetchStatus.FAIL) {
			message.error(confirmRequestStatus.error);
		} else if (confirmRequestStatus.status == FetchStatus.SUCCESS) {
			history("/");
		}
	}, [confirmRequestStatus]);
	const onFinish = (values: any) => {
		// signUpRequestStatus.data — это ответ /api/auth/signUp:
		// { message, userId, login, email, phone }.
		// Бэк-схема ConfirmRequest ждёт поля в PascalCase
		// и обязательными считает только Login + ActivationCode.
		const signUpData: any = signUpRequestStatus.data || {};
		const confirmFormData = {
			Login: signUpData.login || "",
			ActivationCode: values.activationCode || "",
			Email: signUpData.email || "",
			Phone: signUpData.phone || "",
			// Остальные поля бэк игнорирует (extra="ignore"),
			// оставляем выравнивание с историческим контрактом пустыми строками.
			Password: "",
			Surname: "",
			FirstName: "",
			SecondName: "",
			address: "",
			ActivationRequestId: "",
		};
		confirmSignUp(confirmFormData);
	};

	return (
		<Form
			onFinish={onFinish}
			name="basic"
			labelCol={{span: 8}}
			wrapperCol={{span: 8}}
		>
			<Form.Item
				label="Код подтверждения"
				name="activationCode"
				rules={[
					{
						required: true,
						message: "Введите пожалуйста код подтверждения!",
					},
				]}
			>
				<Input autoFocus />
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					Подтвердить
				</Button>
			</Form.Item>
		</Form>
	);
};

export default ConfirmSignUp;
