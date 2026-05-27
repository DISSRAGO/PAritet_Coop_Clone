import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Button, Form, Input} from "antd";
import React, {FC, useEffect, useState} from "react";
import history from "history";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import {FetchStatus} from "../../../store/types/fetchTypes";
import {rules} from "../../../utils/rules";
import {useNavigate} from "react-router-dom";

const LoginForm: FC = () => {
	const signInRequestStatus = useTypedSelector(
		(state) => state.auth.signInRequestStatus,
	);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const {login} = useActions();
	const navigate = useNavigate();
	useEffect(() => {
		if (signInRequestStatus.status == FetchStatus.SUCCESS) {
			navigate(String(sessionStorage.getItem('address')));
			window.location.reload();
		}
	}, [signInRequestStatus]);
	const submit = () => {
		login(username, password);
	};

	return (
		<Form
			onFinish={submit}
			labelCol={{
				span: 4,
			}}
			wrapperCol={{
				span: 20,
			}}
			style={{maxWidth: "300px"}}
		>
			{signInRequestStatus.error && (
				<div style={{color: "red"}}>{signInRequestStatus.error}</div>
			)}
			<Form.Item
				label="Логин"
				name="username"
				rules={[rules.required("Пожалуйста введите имя пользователя!")]}
			>
				<Input
					value={username}
					disabled={signInRequestStatus.status == FetchStatus.LOADING}
					onChange={(e) => setUsername(e.target.value)}
					prefix={<UserOutlined />}
					style={{color: "rgba(0,0,0,.25)"}}
				/>
			</Form.Item>
			<Form.Item
				label="Пароль"
				name="password"
				rules={[rules.required("Пожалуйста введите пароль")]}
			>
				<Input.Password
					disabled={signInRequestStatus.status == FetchStatus.LOADING}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					prefix={<LockOutlined />}
					style={{color: "rgba(0,0,0,.25)"}}
				/>
			</Form.Item>
			<Form.Item
				wrapperCol={{
					offset: 4,
					span: 20,
				}}
			>
				<Button
					type="primary"
					htmlType="submit"
					loading={signInRequestStatus.status == FetchStatus.LOADING}
				>
					Войти
				</Button>
			</Form.Item>
		</Form>
	);
};

export default LoginForm;
