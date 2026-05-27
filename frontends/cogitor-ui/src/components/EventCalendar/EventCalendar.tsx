import moment from "moment-timezone";
import "moment/locale/ru";
import React, {FC} from "react";
import {
	Calendar,
	Views,
	momentLocalizer,
	stringOrDate,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {useHistory} from "react-router-dom";

import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import CustomToolBar from "./CustomToolBar";

const localizer = momentLocalizer(moment);

/**
 * Календарь событий
 * */
const EventCalendar: FC = () => {
	const {getMeetingList} = useActions();
	const history = useHistory();

	const events = useTypedSelector((state) => {
		const events = [];
		for (let i = 0; i < state.meeting.meetings.data.length; ++i) {
			const event = {
				id: state.meeting.meetings.data[i].id,
				dateBegin: moment(
					state.meeting.meetings.data[i].dateBegin,
				).toDate(),
				dateEnd: moment(
					state.meeting.meetings.data[i].dateEnd,
				).toDate(),
				name: state.meeting.meetings.data[i].name,
			};
			events.push(event);
		}
		return events;
	});
	const onRangeChange = (
		range: Date[] | {start: stringOrDate; end: stringOrDate},
	) => {
		if (Array.isArray(range)) {
			getMeetingList({
				From: moment(range[0]).toISOString(),
				To: moment(range[0]).toISOString(),
			});
		} else {
			getMeetingList({
				From: moment(range.start).toISOString(),
				To: moment(range.end).toISOString(),
			});
		}
	};

	const onSelectEvent = (id: string | undefined) => {
		if (id != undefined) {
			history.push(`/info/${id}`);
		}
	};
	return (
		<div style={{height: 500, width: "100%"}}>
			<Calendar
				events={events}
				components={{
					toolbar: CustomToolBar,
				}}
				titleAccessor="name"
				startAccessor="dateBegin"
				endAccessor="dateEnd"
				views={[Views.MONTH, Views.WEEK, Views.DAY]}
				step={60}
				defaultDate={new Date()}
				selectable
				localizer={localizer}
				onRangeChange={onRangeChange}
				onSelectEvent={(e) => onSelectEvent(e.id)}
				messages={{
					next: "Следующий",
					previous: "Предыдущий",
					today: "Сегодня",
					month: "Месяц",
					week: "Неделя",
					day: "День",
					work_week: "Рабочая неделя",
					allDay: "Весь день",
					yesterday: "Вчера",
					tomorrow: "Завтра",
					agenda: "Повестка дня",
					noEventsInRange:
						"Не найдено никаких мероприятий в текущем периоде.",
					showMore: function showMore(total) {
						return `+${total}событий`;
					},
				}}
			/>
		</div>
	);
};

export default EventCalendar;
