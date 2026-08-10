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
		const img = userProfile?.data.photoImage;

		if (img?.binaryContents && img?.contentType) {
			const { binaryContents, contentType } = img; // тут TS уже знает, что это string
			return convertBinaryStringToFile(binaryContents, contentType);
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
