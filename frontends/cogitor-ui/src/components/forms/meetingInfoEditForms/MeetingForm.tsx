import {Card, DatePicker, Form, Input} from "antd";
import moment from "moment-timezone";
import React, {FC} from "react";

import GroupSelectionInput from "../../GroupSelectionInput";
import TextEditor from "../../TextEditor";
import {Meeting} from "../../../models/meetings/Meeting";
import {htmlDecode} from "../../../utils/xml";

interface MeetingFormProps {
	currentMeeting: Meeting;
}
const MeetingForm: FC<MeetingFormProps> = (props) => {
	function disabledDate(current: moment.Moment) {
		return current && current < moment(props.currentMeeting.DateBegin);
	}
	return (
		<Card
			title="Мероприятие"
			headStyle={{
				borderBottom: "none",
			}}
		>
			<Form
				name="meetingForm"
				layout="vertical"
				labelCol={{
					span: 24,
				}}
				wrapperCol={{
					span: 24,
				}}
				initialValues={{
					name: props.currentMeeting.Name,
					description: htmlDecode(props.currentMeeting.Description),
					dateBegin: moment(props.currentMeeting.DateBegin),
					dateEnd: moment(props.currentMeeting.DateEnd),
					groupId: props.currentMeeting.Group,
				}}
			>
				<Form.Item
					label="Название мероприятия"
					wrapperCol={{
						span: 14,
					}}
					name="name"
					tooltip="Название мероприятия"
					rules={[
						{
							required: true,
							message: "Заполните название мероприятия!",
						},
					]}
				>
					<Input autoFocus />
				</Form.Item>
				<Form.Item
					label="Описание мероприятия"
					name="description"
					tooltip="Описание мероприятия"
					rules={[
						{
							required: true,
							message: "Заполните название мероприятия!",
						},
					]}
				>
					<TextEditor />
				</Form.Item>
				<Form.Item
					label="Сроки проведения мероприятия"
					tooltip="Сроки проведения мероприятия"
					rules={[
						{
							required: true,
							message: "Заполните даты мероприятия!",
						},
					]}
					wrapperCol={{
						span: 14,
					}}
					style={{marginBottom: 0, marginLeft: 0}}
				>
					<Form.Item
						name="dateBegin"
						style={{
							display: "inline-block",
							width: "calc(50% - 12px)",
						}}
					>
						<DatePicker
							style={{width: "100%"}}
							format={"DD.MM.YYYY"}
						/>
					</Form.Item>
					<span
						style={{
							display: "inline-block",
							width: "24px",
							lineHeight: "32px",
							textAlign: "center",
						}}
					>
						-
					</span>
					<Form.Item
						name="dateEnd"
						style={{
							display: "inline-block",
							width: "calc(50% - 12px)",
						}}
					>
						<DatePicker
							disabledDate={disabledDate}
							style={{width: "100%"}}
							format={"DD.MM.YYYY"}
						/>
					</Form.Item>
				</Form.Item>
				<Form.Item label="Группа" name="groupId">
					<GroupSelectionInput />
				</Form.Item>
			</Form>
		</Card>
	);
};

export default MeetingForm;
