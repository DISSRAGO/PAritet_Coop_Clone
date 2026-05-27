import {
	IdcardOutlined,
	LockOutlined,
	MailOutlined,
	PhoneOutlined,
	UserOutlined,
} from "@ant-design/icons";
import {Button, Form, Input} from "antd";
import {FormFinishInfo} from "rc-field-form/lib/FormContext";
import React from "react";

import {ICity} from "../../../models/address/ICity";
import {ICountry} from "../../../models/address/ICountry";
import {IHouse} from "../../../models/address/IHouse";
import {IRegion} from "../../../models/address/IRegion";
import {IStreet} from "../../../models/address/IStreet";
import {FetchStatus} from "../../../store/types/fetchTypes";
import AddressForm from "../AddressForm";

interface RegisterFormProps {
	onFormFinish: (name: string, info: FormFinishInfo) => void;
	isFormLoading: boolean;
	countries: ICountry[];
	regions: IRegion[];
	cities: ICity[];
	streets: IStreet[];
	houses: IHouse[];
	addressId: number;
	getCountiesList: (filter: string) => void;
	getRegionsList: (filter: string, country: ICountry) => void;
	getCitiesList: (filter: string, country: ICountry, city: IRegion) => void;
	getStreetsList: (
		filter: string,
		country: ICountry,
		city: IRegion,
		streets: ICity,
	) => void;
	getHousesList: (
		filter: string,
		country: ICountry,
		city: IRegion,
		streets: ICity,
		house: IHouse,
	) => void;
	getAddressId: (
		filter: string,
		country: ICountry,
		region: IRegion,
		city: ICity,
		street: IStreet,
		house: IHouse,
	) => void;
}
export const RegisterForm = (props: RegisterFormProps) => {
	return (
		<Form.Provider onFormFinish={props.onFormFinish}>
			<Form name="dataForm" layout="vertical" style={{maxWidth: "500px"}}>
				<Form.Item
					label="Фамилия"
					name="surname"
					rules={[
						{
							required: true,
							message: "Введите фамилию!",
						},
					]}
				>
					<Input
						autoFocus
						prefix={<IdcardOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Имя"
					name="firstName"
					rules={[
						{
							required: true,
							message: "Введите имя!",
						},
					]}
				>
					<Input
						prefix={<IdcardOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Отчество"
					name="secondName"
					rules={[
						{
							required: true,
							message: "Введите отчество!",
						},
					]}
				>
					<Input
						prefix={<IdcardOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Телефон"
					name="phone"
					rules={[
						{
							required: true,
							message: "Введите телефон!",
						},
					]}
				>
					<Input
						prefix={<PhoneOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Почта"
					name="email"
					rules={[
						{
							type: "email",
							message: "Введите валидную почту",
						},
						{required: true, message: "Введите почту!"},
					]}
				>
					<Input
						prefix={<MailOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Логин"
					name="login"
					rules={[{required: true, message: "Введите логин!"}]}
				>
					<Input
						prefix={<UserOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>

				<Form.Item
					label="Пароль"
					name="password"
					rules={[{required: true, message: "Введите пароль!"}]}
				>
					<Input.Password
						prefix={<LockOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
				<Form.Item
					label="Подтверждение пароля"
					name="restorePassword"
					rules={[
						{
							required: true,
							message: "Подтвердите пароль!",
						},
					]}
				>
					<Input.Password
						prefix={<LockOutlined />}
						style={{color: "rgba(0,0,0,.25)"}}
					/>
				</Form.Item>
			</Form>
			{/*	<AddressForm
				isShowFlatInput={false}
				addressId={props.addressId}
				countries={props.countries}
				regions={props.regions}
				cities={props.cities}
				streets={props.streets}
				houses={props.houses}
				getCountiesList={props.getCountiesList}
				getRegionsList={props.getRegionsList}
				getCitiesList={props.getCitiesList}
				getStreetsList={props.getStreetsList}
				getHousesList={props.getHousesList}
				getAddressId={props.getAddressId}
				/>*/}
			<Form>
				<Form.Item wrapperCol={{offset: 8, span: 16}}>
					<Button
						loading={props.isFormLoading}
						type="primary"
						htmlType="submit"
					>
						Зарегистрироваться
					</Button>
				</Form.Item>
			</Form>
		</Form.Provider>
	);
};
