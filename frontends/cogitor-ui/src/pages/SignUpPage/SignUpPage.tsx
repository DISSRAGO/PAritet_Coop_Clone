import {Button, Card, Form, Input, message, Row} from "antd";
import {FormFinishInfo} from "rc-field-form/lib/FormContext";
import React, {FC, useEffect, useState} from "react";
import history from "history";

import RegisterForm from "../../components/forms/RegisterForm";
import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {IRegistrationFormData} from "../../models/profile/IRegisterFormData";
import {ROUTE_NAMES} from "../../routes/AppRoutesSettings";
import {FetchStatus} from "../../store/types/fetchTypes";
import "./style.css";
import {useNavigate} from "react-router-dom";

const SignUpPage: FC = () => {
	const addressId = useTypedSelector((state) => state.address.addressId);
	const {signUp, validateEmail, validateLogin, validatePhone} = useActions();
	const signUpRequestStatus = useTypedSelector(
		(state) => state.auth.signUpRequestStatus,
	);
	const validateEmailRequestStatus = useTypedSelector(
		(state) => state.auth.validateEmailRequestStatus,
	);
	const validateLoginRequestStatus = useTypedSelector(
		(state) => state.auth.validateLoginRequestStatus,
	);
	const validatePhoneRequestStatus = useTypedSelector(
		(state) => state.auth.validatePhoneRequestStatus,
	);
	const navigate = useNavigate();
	useEffect(() => {
		if (signUpRequestStatus.status == FetchStatus.SUCCESS) {
			navigate(ROUTE_NAMES.CONFIRM_PAGE);
		}
		if (signUpRequestStatus.status == FetchStatus.FAIL) {
			message.error(signUpRequestStatus.error);
		}
	}, [signUpRequestStatus]);

	const [data, setData] = useState({});
	useEffect(() => {
		if (
			validatePhoneRequestStatus.status == FetchStatus.SUCCESS &&
			validateEmailRequestStatus.status == FetchStatus.SUCCESS &&
			validateLoginRequestStatus.status == FetchStatus.SUCCESS
		) {
			signUp(data);
		}
	}, [
		validateEmailRequestStatus,
		validatePhoneRequestStatus,
		validateLoginRequestStatus,
	]);
	useEffect(() => {
		if (validateEmailRequestStatus.status == FetchStatus.FAIL) {
			message.error(validateEmailRequestStatus.error, 10);
		}
	}, [validateEmailRequestStatus]);
	useEffect(() => {
		if (validateLoginRequestStatus.status == FetchStatus.FAIL) {
			message.error(validateLoginRequestStatus.error, 10);
		}
	}, [validateLoginRequestStatus]);
	useEffect(() => {
		if (validatePhoneRequestStatus.status == FetchStatus.FAIL) {
			message.error(validatePhoneRequestStatus.error, 10);
		}
	}, [validatePhoneRequestStatus]);
	const countries = useTypedSelector((state) => state.address.countries.data);
	const regions = useTypedSelector((state) => state.address.regions.data);
	const cities = useTypedSelector((state) => state.address.cities.data);
	const streets = useTypedSelector((state) => state.address.streets.data);
	const houses = useTypedSelector((state) => state.address.houses.data);
	const {
		getCountiesList,
		getRegionsList,
		getCitiesList,
		getStreetsList,
		getHousesList,
		getAddressId,
	} = useActions();
	const onFormFinish = (name: string, info: FormFinishInfo) => {
		const {dataForm, addressForm} = info.forms;
		const dataFormValues = dataForm.getFieldsValue();
		validateEmail(dataFormValues.email);
		validateLogin(dataFormValues.login);
		validatePhone(dataFormValues.phone);
		const data: IRegistrationFormData = {
			surname: dataFormValues.surname,
			firstName: dataFormValues.firstName,
			secondName: dataFormValues.secondName,
			phone: dataFormValues.phone,
			email: dataFormValues.email,
			login: dataFormValues.login,
			password: dataFormValues.password,
			restorePassword: dataFormValues.restorePassword,
			addressId: addressId.data,
		};
		setData(data);
	};
	return (
		<div className={"root"}>
			<Card className={"card"}>
				<RegisterForm
					onFormFinish={onFormFinish}
					isFormLoading={
						validatePhoneRequestStatus.status ==
							FetchStatus.LOADING ||
						validateEmailRequestStatus.status ==
							FetchStatus.LOADING ||
						validateLoginRequestStatus.status ==
							FetchStatus.LOADING ||
						signUpRequestStatus.status == FetchStatus.LOADING
					}
					addressId={addressId.data}
					countries={countries}
					regions={regions}
					cities={cities}
					streets={streets}
					houses={houses}
					getCountiesList={getCountiesList}
					getRegionsList={getRegionsList}
					getCitiesList={getCitiesList}
					getStreetsList={getStreetsList}
					getHousesList={getHousesList}
					getAddressId={getAddressId}
				/>
			</Card>
		</div>
	);
};

export default SignUpPage;
