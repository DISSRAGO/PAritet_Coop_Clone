import {PlusOutlined} from "@ant-design/icons";
import {Button, DatePicker, Radio, Form, Input, Card, Space} from "antd";
import moment from "moment-timezone";
import React, {FC} from "react";

import TextEditor from "../../TextEditor";
import {IMeeting} from "../../../models/meetings/IMeeting";
import {htmlDecode} from "../../../utils/xml";
import ChoiceList from "./ChoiceListForm";

interface VotingListFormProps {
	currentMeeting: IMeeting;
	meetingDateBegin: moment.Moment;
	meetingDateEnd: moment.Moment;
}

const VotingListForm: FC<VotingListFormProps> = (props) => {
	function disabledDate(current: moment.Moment) {
		return (
			current &&
			(current < moment(props.meetingDateBegin) ||
				current > moment(props.currentMeeting.dateEnd))
		);
	}
	const initialValues = () => {
		const votings = [];
		for (let i = 0; i < props.currentMeeting.votingList.length; ++i) {
			const choiceList = [];
			for (
				let j = 0;
				j < props.currentMeeting.votingList[i].choiceList.length;
				++j
			) {
				const choice = {
					variant:
						props.currentMeeting.votingList[i].choiceList[j].name,
				};
				choiceList.push(choice);
			}
			const voting = {
				id: props.currentMeeting.votingList[i].id,
				name: props.currentMeeting.votingList[i].name,
				dateBegin: moment(props.currentMeeting.votingList[i].dateBegin),
				dateEnd: moment(props.currentMeeting.votingList[i].dateEnd),
				description: htmlDecode(
					props.currentMeeting.votingList[i].description,
				),
				isOpen: Boolean(props.currentMeeting.votingList[i].isOpen),
				isOpenResult: Boolean(
					props.currentMeeting.votingList[i].isOpenResult,
				),
				isPayed: props.currentMeeting.votingList[i].isPayed,
				choiceList: choiceList,
			};
			votings.push(voting);
		}
		return votings;
	};
	return (
		<Form
			name="votingsForm"
			layout="vertical"
			labelCol={{
				span: 24,
			}}
			wrapperCol={{
				span: 24,
			}}
		>
			<Form.List name="votings" initialValue={initialValues()}>
				{(fields, {add, remove}) => (
					<Space direction={"vertical"} style={{width: "100%"}}>
						{fields.map((field, index) => (
							<Card
								key={index}
								title={`Голосование № ${index + 1}`}
								headStyle={{
									borderBottom: "none",
								}}
								extra={
									fields.length > 1 ? (
										<Button
											type="link"
											onClick={() => remove(field.name)}
										>
											Удалить
										</Button>
									) : null
								}
							>
								<Form.Item key={field.key}>
									<Form.Item
										{...field}
										name={[field.name, "id"]}
									/>
									<Form.Item
										label="Название голосования"
										{...field}
										name={[field.name, "name"]}
										wrapperCol={{
											span: 14,
										}}
										rules={[
											{
												required: true,
												message:
													"Заполните название голосования!",
											},
										]}
									>
										<Input />
									</Form.Item>
									<Form.Item
										label="Описание голосования"
										{...field}
										name={[field.name, "description"]}
										fieldKey={[
											field.fieldKey,
											"description",
										]}
										rules={[
											{
												required: true,
												message:
													"Заполните описание голосования!",
											},
										]}
									>
										<TextEditor />
									</Form.Item>
									<Form.Item
										label="Сроки проведения Голосования"
										{...field}
										fieldKey={[field.fieldKey, "dateRange"]}
										style={{marginBottom: 0, marginLeft: 0}}
										wrapperCol={{
											span: 14,
										}}
										rules={[
											{
												required: true,
												message:
													"Заполните даты проведения голосования!",
											},
										]}
									>
										<Form.Item
											{...field}
											name={[field.name, "dateBegin"]}
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
										<span
											style={{
												display: "inline-block",
												width: "24px",
												lineHeight: "32px",
												textAlign: "center",
											}}
										>
											{" "}
											-
										</span>
										<Form.Item
											{...field}
											name={[field.name, "dateEnd"]}
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
									<Form.Item
										label="Вид голосования"
										{...field}
										name={[field.name, "isOpen"]}
										fieldKey={[field.fieldKey, "isOpen"]}
									>
										<Radio.Group
											style={{
												width: "100%",
												textAlign: "left",
											}}
										>
											<Space direction="vertical">
												<Radio value={false}>
													Тайное
												</Radio>
												<Radio value={true}>
													Открытое
												</Radio>
											</Space>
										</Radio.Group>
									</Form.Item>
									<Form.Item
										label="Можно ли видеть результаты голосования до его завершения?"
										{...field}
										name={[field.name, "isOpenResult"]}
										fieldKey={[
											field.fieldKey,
											"isOpenResult",
										]}
									>
										<Radio.Group
											style={{
												width: "100%",
												textAlign: "left",
											}}
										>
											<Space direction="vertical">
												<Radio value={true}>Да</Radio>
												<Radio value={false}>Нет</Radio>
											</Space>
										</Radio.Group>
									</Form.Item>
									<Form.Item
										label="Способ голосования"
										{...field}
										name={[field.name, "isPayed"]}
										fieldKey={[field.fieldKey, "isPayed"]}
									>
										<Radio.Group
											style={{
												width: "100%",
												textAlign: "left",
											}}
										>
											<Space direction="vertical">
												<Radio
													value="бесплатно"
													disabled
												>
													Бесплатно
												</Radio>
												<Radio value="паями">
													Паями
												</Radio>
												<Radio value="лептами">
													Лептами
												</Radio>
											</Space>
										</Radio.Group>
									</Form.Item>
									<ChoiceList field={field} />
								</Form.Item>
							</Card>
						))}

						<div style={{width: "100%", textAlign: "center"}}>
							<Button
								type="dashed"
								onClick={() =>
									add({
										dateBegin: props.meetingDateBegin,
										dateEnd: props.meetingDateEnd,
										isOpen: false,
										isOpenResult: true,
										isPayed: "паями",
									})
								}
								block
							>
								<PlusOutlined /> Добавить голосование
							</Button>
						</div>
					</Space>
				)}
			</Form.List>
		</Form>
	);
};

export default VotingListForm;
