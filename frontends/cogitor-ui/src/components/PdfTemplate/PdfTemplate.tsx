import moment from "moment-timezone";

import {IVoting} from "../../models/meetings/IVoting";
import {IVotingChoice} from "../../models/meetings/IVotingChoice";
import { IMeeting } from "../../models/meetings/IMeeting";

function calcVoteStatistic(choiceList: Array<IVotingChoice>) {
	const voteStatistic = {
		numberOfAllVoters: 0,
		result: [] as IVotingChoice[],
	};
	for (let i = 0; i < choiceList.length; i += 1) {
		voteStatistic.numberOfAllVoters += choiceList[i].count;
	}
	choiceList.sort((a, b) => a.count - b.count);
	const lastElement = choiceList[choiceList.length - 1];
	voteStatistic.result = choiceList.filter(
		(item) => item.count >= lastElement.count,
	);
	return voteStatistic;
}
function votingRender(votingList: Array<IVoting>) {
	if (votingList.length > 0) {
		const voteStatistic = calcVoteStatistic(votingList[0].choiceList);
		return `    <table>
        <tr>
            <td class="left-title">
                Голосование:
            </td>
            <td >
               ${votingList[0].name}
            </td>
        </tr>
        <tr>
            <td class="left-title">
                Описание:
            </td>
            <td>
              ${votingList[0].description}
            </td>
        </tr>
        <tr>
            <td class="left-title">
                Даты проведения голосования (по новосибирскому времени):
            </td>
            <td>
            ${moment(votingList[0].dateBegin).format("DD.MM.YYYY")}
              -
              ${moment(votingList[0].dateEnd).format("DD.MM.YYYY")}
            </td>
        </tr>
        <tr class="heading">
            <td>Вариант</td>

            <td>Количество проголосовавших</td>
        </tr>

        ${votingList[0].choiceList.map(
			(item) =>
				`<tr class="item">\n<td>${item.name}</td>\n\n<td>${item.count}</td></tr>\n`,
		)}
        <tr>
           <td> Всего проголосвавших:</td>
            <td>${voteStatistic.numberOfAllVoters}</td>
        </tr>
        <tr class="total">
            <td>Итоговые варианты:</td>
            <td>${voteStatistic.result.map((item) => `${item.name} `)}</td>
        </tr>
    </table>`;
	}

	return ``;
}
const PdfTemplate = (meetingInfo: IMeeting): string => {
	return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <title>Отчёт по голосованию</title>

    <style>
        .report-box table tr td.left-title {
            font-weight: bold;
            width: 200px;
        }
        .report-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }

        .report-box table tr.details td {
            padding-bottom: 20px;
        }

        .report-box table tr.item td {
            border-bottom: 1px solid #eee;
        }

        .report-box table tr.item.last td {
            border-bottom: none;
        }

        .report-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        .report-title {
            text-align: center;
        }
    </style>
</head>

<body>
<div class="report-box">
    <h1 class="report-title">
        Отчёт
    </h1>
    <table>
        <tr>
            <td class="left-title">
                Мероприятие:
            </td>
            <td>
                ${meetingInfo.name}
            </td>
        </tr>
        <tr>
            <td class="left-title">
                Описание:
            </td>
            <td>
            ${meetingInfo.description}} 
        </tr>
        <tr>
            <td class="left-title">
                Даты проведения мероприятия (по новосибирскому времени):
            </td>
            <td>
                ${moment(meetingInfo.dateBegin).format(
					"DD.MM.YYYY",
				)} - ${moment(meetingInfo.dateEnd).format("DD.MM.YYYY")}
            </td>
        </tr>
         ${votingRender(meetingInfo?.votingList ?? [])}
    </table>
  
</div>
</body>
</html>`;
};
export default PdfTemplate;
