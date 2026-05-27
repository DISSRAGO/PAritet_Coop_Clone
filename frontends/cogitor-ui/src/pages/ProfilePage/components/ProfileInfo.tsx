import {Button, Card, DatePicker, Form, Input, Space, Spin} from "antd";
import {FormFinishInfo} from "rc-field-form/lib/FormContext";
import React, {FC, useEffect} from "react";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import {FetchStatus} from "../../../store/types/fetchTypes";
import {
	convertBinaryStringToFile,
	DEFAULT_AVATAR_URL,
} from "../../../utils/avatar";
import AvatarForm from "./AvatarForm";
import "./ProfileInfo.less";

const ProfileInfo: FC = () => {
	const {saveProfileAddress} = useActions();
	const userProfile = useTypedSelector((state) => state.user.userProfile);
	const addressId = useTypedSelector((state) => state.address.addressId.data);
	const parseSelectedValue = (value: string) => {
		return {
			attributes: {
				Id: Number(value.split(" ", 1).toString()),
				Name: value.split(" ").slice(1).join(" "),
			},
		};
	};

	function getAvatar() {
		if (userProfile?.data.PhotoImage?.BinaryContents) {
			return convertBinaryStringToFile(
				userProfile?.data.PhotoImage?.BinaryContents,
				userProfile?.data.PhotoImage?.ContentType,
			);
		}
		return DEFAULT_AVATAR_URL;
	}
	const onFormFinish = (name: string, info: FormFinishInfo) => {
		const {profileForm, avatarForm} = info.forms;
		const profileValues = profileForm.getFieldsValue();
		const avatarValues = avatarForm.getFieldsValue();
		console.log(profileValues);
		console.log(avatarValues);
	};
	return (
		<div className="baseView">
			<Spin spinning={userProfile.status == FetchStatus.LOADING}>
				{userProfile.status == FetchStatus.SUCCESS ? (
					<Form.Provider onFormFinish={onFormFinish}>
						<AvatarForm avatarSrc={getAvatar()} />
						<Form
							name="profileForm"
							initialValues={{
								login: userProfile.data.login,
								email: userProfile.data.email,
								fio: userProfile.data.name,
							}}
							labelCol={{span: 10}}
						>
							<Form.Item label="Логин" name="login">
								<Input />
							</Form.Item>
							<Form.Item label="Почта" name="email">
								<Input />
							</Form.Item>
							<Form.Item label="ФИО" name="fio">
								<Input />
							</Form.Item>
						</Form>
						<Form>
							<Form.Item>
								<Button
									type="primary"
									htmlType="submit"
								>
									Обновить
								</Button>
							</Form.Item>
						</Form>
					</Form.Provider>
				) : (
					<></>
				)}
			</Spin>
		</div>
	);

};

export default ProfileInfo;

/**
 const ProfileInfo: FC = () => {
	const {getProfile, saveProfile} = useActions();
	const userProfile = useTypedSelector((state) => state.user.userProfile);
	useEffect(() => {
		getProfile();
	}, []);

	function getAvatar() {
		if (userProfile?.data.PhotoImage?.BinaryContents) {
			return convertBinaryStringToFile(
				userProfile?.data.PhotoImage?.BinaryContents,
				userProfile?.data.PhotoImage?.ContentType,
			);
		}
		return DEFAULT_AVATAR_URL;
	}
	const addressId = useTypedSelector((state) => state.address.addressId.data);
	const parseSelectedValue = (value: string) => {
		return {
			attributes: {
				Id: Number(value.split(" ", 1).toString()),
				Name: value.split(" ").slice(1).join(" "),
			},
		};
	};
	const onFormFinish = (name: string, info: FormFinishInfo) => {
		const {avatarForm, addressForm, profileForm} = info.addMeetingForms;
		const avatarValues = avatarForm.getFieldsValue();
		const profileValues = profileForm.getFieldsValue();
		const addressValues = addressForm.getFieldsValue();
		const outputProfile: IUserProfile = {
			Id: userProfile.data.Id,
			Login: profileValues?.login ?? "",
			EMail: profileValues?.email ?? "",
			Name: profileValues?.fio ?? "",
			BirthDate: profileValues?.birthDate?.format("DD.MM.YYYY") ?? "",
			LivingAddress: {
				id: addressId,
				country: parseSelectedValue(addressValues.country),
				region: parseSelectedValue(addressValues.region),
				city: parseSelectedValue(addressValues.city),
				street: parseSelectedValue(addressValues.street),
				house: parseSelectedValue(addressValues.house),
				flat: {
					attributes: {
						Id: -1,
						Name: addressValues?.flat ?? "",
					},
				},
			},
			PhotoImage: {
				FileName: avatarValues?.avatar?.file?.name ?? "",
				Description: "аватар",
				ContentType: avatarValues?.avatar?.file?.type ?? "",
			},
		};
		console.log(avatarValues.avatar.file);
		console.log(
			arrayBufferToBase64(
				avatarValues.avatar.file.originFileObj?.arrayBuffer(),
			),
		);
		saveProfile(outputProfile);
	};
	return (
		<div className="baseView">
			{userProfile.status == FetchStatus.SUCCESS ? (
				<Form.Provider onFormFinish={onFormFinish}>
					<div className="right">
						<AvatarForm avatarSrc={getAvatar()} />
					</div>
					<div className="left">
						<Form
							name="profileForm"
							initialValues={{
								login: userProfile.data.Login,
								email: userProfile.data.EMail,
								fio: userProfile.data.Name,
							}}
							labelCol={{span: 5}}
						>
							<Form.Item label="Логин" name="login">
								<Input />
							</Form.Item>
							<Form.Item label="Почта" name="email">
								<Input />
							</Form.Item>
							<Form.Item label="ФИО" name="fio">
								<Input />
							</Form.Item>
							<Form.Item label="Дата рождения" name="birthDate">
								<DatePicker />
							</Form.Item>
						</Form>
						<AddressForm
							defaultAddress={userProfile.data.LivingAddress}
							isShowFlatInput={true}
						/>
						<Form>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									Обновить
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Form.Provider>
			) : (
				<></>
			)}
		</div>
	);
};

export default ProfileInfo;

 * */
