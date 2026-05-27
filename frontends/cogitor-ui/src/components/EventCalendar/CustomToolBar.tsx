import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {Button, Row, Col} from "antd";
import moment from "moment-timezone";
import React, {FC} from "react";

import {getStartAndEndDatesOfThisMonth} from "../../utils/date";

const CustomToolBar: FC = (toolbar: any) => {
	const goToBack = () => {
		toolbar.date.setMonth(toolbar.date.getMonth() - 1);
		toolbar.onNavigate("prev");
	};

	const goToNext = () => {
		toolbar.date.setMonth(toolbar.date.getMonth() + 1);
		toolbar.onNavigate("next");
	};
	const goToCurrent = () => {
		const now = new Date();
		toolbar.date.setMonth(now.getMonth());
		toolbar.date.setYear(now.getFullYear());
		toolbar.onNavigate("current");
	};

	const label = () => {
		const date = moment(toolbar.date);
		return (
			<div>
				<b>{date.format("MMMM")}</b>
				<span> {date.format("YYYY")}</span>
			</div>
		);
	};

	const goToMonth = () => {
		getStartAndEndDatesOfThisMonth();
		toolbar.onView("month");
	};
	const goToWeek = () => {
		toolbar.onView("week");
	};
	const goToDay = () => {
		toolbar.onView("day");
	};

	return (
		<>
			<Row gutter={[16, 16]}>
				<Col span={24} style={{textAlign: "center"}}>
					{label()}
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToBack} icon={<LeftOutlined />} />
				</Col>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToCurrent}>Сегодня</Button>
				</Col>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToNext} icon={<RightOutlined />} />
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col span={24} style={{textAlign: "center"}}></Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToMonth}>Месяц</Button>
				</Col>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToWeek}>Неделя</Button>
				</Col>
				<Col span={8} style={{textAlign: "center"}}>
					<Button onClick={goToDay}>День</Button>
				</Col>
			</Row>
		</>
	);
};

export default CustomToolBar;
