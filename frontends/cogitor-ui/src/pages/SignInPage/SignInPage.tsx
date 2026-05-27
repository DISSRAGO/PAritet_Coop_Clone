import {Card, Row} from "antd";
import React, {FC} from "react";

import LoginForm from "../../components/forms/LoginForm/LoginForm";
import "./style.css";

const SignInPage: FC = () => {
	return (
		<div className={"root"}>
			<Card className={"card"}>
				<LoginForm />
			</Card>
		</div>
	);
};

export default SignInPage;
/*
* 	<Row justify="center" align="middle">
			<Card className={"card"}>
				<LoginForm />
			</Card>
		</Row>
* */
