import {Form, Input, message, Modal} from "antd";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import {FetchStatus} from "../../../store/types/fetchTypes";

interface AddMembersToGroupModalProps {
	id: string;
	isModalVisible: boolean;
	setIsModalVisible(value: boolean): void;
}
const AddMembersToGroupModal: FC<AddMembersToGroupModalProps> = (
	props: AddMembersToGroupModalProps,
) => {
	const [form] = Form.useForm();

	const {invitePersonToGroup} = useActions();
	const invitePersonRequestStatus = useTypedSelector(
		(state) => state.group.invitePersonRequestStatus,
	);
	const [confirmLoading, setConfirmLoading] = useState(false);

	useEffect(() => {
		if (invitePersonRequestStatus.status == FetchStatus.SUCCESS) {
			setConfirmLoading(false);
			props.setIsModalVisible(false);
			message.success(
				"Приглашение новому пользователю отправлено. Он появится в списке, когда примет приглашение",
			);
		}
		if (invitePersonRequestStatus.status == FetchStatus.FAIL) {
			setConfirmLoading(false);
			message.error("Не удалось добавить пользователя.");
		}
	}, [invitePersonRequestStatus]);

	return (
		<Modal
			title="Добавление участника"
			visible={props.isModalVisible}
			okText="Пригласить"
			onOk={() => {
				form.validateFields()
					.then((values) => {
						setConfirmLoading(true);
						invitePersonToGroup(values.email, props.id);
						form.resetFields();
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
			confirmLoading={confirmLoading}
			onCancel={() => {
				props.setIsModalVisible(false);
			}}
		>
			<Form name="invitePerson" form={form}>
				<Form.Item label="Почта нового участника" name="email">
					<Input placeholder="почта..." disabled={confirmLoading} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AddMembersToGroupModal;
