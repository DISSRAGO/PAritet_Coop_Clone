import {Form, Modal} from "antd";
import React, {FC} from "react";
import {useParams} from "react-router-dom";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import TextEditor from "../../TextEditor";

interface MailEditorProps {
	indexForNotify: number;
	isModalVisible: boolean;
	onCreate: (text: string) => void;
	onCancel: () => void;
}
export const MailEditorModal: FC<MailEditorProps> = (
	props: MailEditorProps,
) => {
	const {id} = useParams<{id?: string}>();
	const {notify} = useActions();

	const notifyStatus = ["before", "during", "after"];
	const notifyRequestStatus = useTypedSelector(
		(state) => state.notify.notifyRequestStatus,
	);
	const handleNotify = () => {
		notify(id, notifyStatus[props.indexForNotify]);
	};
	const [form] = Form.useForm();

	return (
		<Modal
			visible={props.isModalVisible}
			okText="Отправить письмо"
			cancelText="Отмена"
			onCancel={props.onCancel}
			onOk={() => {
				form.validateFields()
					.then((values) => {
						props.onCreate(values.text);
						handleNotify();
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
		>
			<Form form={form}>
				<Form.Item name="text">
					<TextEditor />
				</Form.Item>
			</Form>
		</Modal>
	);
};
