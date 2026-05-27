import {Card, List, Space, Typography} from "antd";
import moment from "moment-timezone";
import React, {FC} from "react";
import {useHistory} from "react-router-dom";

import {useTypedSelector} from "../../hooks/useTypedSelector";
import {htmlDecode} from "../../utils/xml";

interface EventListProps {}
const EventList: FC<EventListProps> = (props: EventListProps) => {
	const history = useHistory();
	const meetings = useTypedSelector((state) => state.meeting.meetings);
	function convertDateToFormatDate(date: string) {
		return moment(new Date(date)).format("DD.MM.YYYY");
	}
	const onSelectEvent = (id: string | undefined) => {
		if (id != undefined) {
			history.push(`/info/${id}`);
		}
	};

	return (
		<div>
			<List
				bordered={false}
				header={
					<Typography.Title level={3} style={{textAlign: "center"}}>
						Список текущих мероприятий
					</Typography.Title>
				}
				grid={{gutter: 16, column: 1}}
				itemLayout="vertical"
				size="large"
				pagination={{
					size: "small",
				}}
				dataSource={meetings.data}
				renderItem={(item) => (
					<List.Item
						className="list-item"
						style={{
							cursor: "pointer",
						}}
					>
						<Card
							title={
								<Typography.Title
									level={5}
									style={{textAlign: "center"}}
								>
									{item.name}
								</Typography.Title>
							}
							onClick={(event) => {
								onSelectEvent(item.id);
							}}
							style={{minWidth: "300px"}}
						>
							<Space direction="vertical">
								<Typography.Text type="secondary">
									Автор: {item.author?.name}
								</Typography.Text>
								<Typography.Text type="secondary">{`Даты проведения мероприятия: c 
                    ${convertDateToFormatDate(
						item?.dateBegin || "",
					)} по ${convertDateToFormatDate(
									item?.dateEnd || "",
								)}`}</Typography.Text>

								<Typography.Paragraph ellipsis={{rows: 5}}>
									<p
										className="description"
										dangerouslySetInnerHTML={{
											__html:
												htmlDecode(item?.description) ||
												"<div></div>",
										}}
									/>
								</Typography.Paragraph>
							</Space>
						</Card>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default EventList;
