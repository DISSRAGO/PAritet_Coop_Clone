import {
	DatePicker,
	Card,
	Col,
	Row,
	Space,
	Button,
	Descriptions,
	Table,
	Typography,
} from "antd";
import moment, {Moment} from "moment-timezone";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {FetchStatus} from "../../store/types/fetchTypes";
import {AccountReplenishmentModal} from "./AccountReplenishmentModal";
import "./BillingPage.less";
import {MoneyTransferModal} from "./MoneyTransferModal";

const {RangePicker} = DatePicker;

const dateFormat = "YYYY-MM-DD";
const columns = [
	{
		title: "Дата",
		dataIndex: "date",
		key: "Date",
	},
	{
		title: "Откуда",
		dataIndex: "from",
		key: "Date",
	},
	{
		title: "Куда",
		dataIndex: "to",
		key: "Date",
	},
	{
		title: "Описание",
		dataIndex: "description",
		key: "Date",
	},
	{
		title: "Тип документа",
		dataIndex: "type",
		key: "Date",
	},
	{
		title: "Сумма",
		dataIndex: "value",
		key: "Date",
	},
	{
		title: "Ip-адрес",
		dataIndex: "IP",
		key: "Date",
	},
];
const BillingPage: FC = () => {
	const [dates, setDates] = useState<[Moment, Moment]>([
		moment(moment(), dateFormat).subtract(1, "day"),
		moment(moment(), dateFormat),
	]);
	const {getOperationHistoryByAccount, getAccount} = useActions();
	const account = useTypedSelector((state) => state.user.account);
	const operationHistory = useTypedSelector(
		(state) => state.user.operationHistory,
	);
	useEffect(() => {
		getAccount();
		//pay();
	}, []);
	useEffect(() => {
		if (account.status == FetchStatus.SUCCESS) {
			console.log(account.data);
			if (account.data.id) {
				getOperationHistoryByAccount(
					account.data.id.toString(),
					dates[0].format(dateFormat),
					dates[1].format(dateFormat),
				);
			}
		}
	}, [account]);
	useEffect(() => {
		if (account.status == FetchStatus.SUCCESS) {
			if (account.data.id) {
				getOperationHistoryByAccount(
					account.data.id.toString(),
					dates[0].format(dateFormat),
					dates[1].format(dateFormat),
				);
			}
		}
	}, [account]);
	const showOperationsOnClick = () => {
		if (account.data.id) {
			getOperationHistoryByAccount(
				account.data.id.toString(),
				dates[0].format(dateFormat),
				dates[1].format(dateFormat),
			);
		}
	};
	const {pay_step1} = useActions();
	const [
		isAccountReplenishmentModalVisible,
		setAccountReplenishmentModalVisible,
	] = useState(false);
	const [isMoneyTransferModalVisible, setMoneyTransferModalVisible] =
		useState(false);
	return (
		<>
			<Space direction={"vertical"} style={{width: "100%"}}>
				<Row justify="space-around" gutter={[16, 48]}>
					<Col
						span={18}
						xxl={18}
						xl={18}
						lg={18}
						md={24}
						sm={24}
						xs={24}
					>
						<Card>
							<Descriptions
								title={
									<Typography.Title level={5}>
										Информация о состоянии счёта на период с{" "}
										{dates[0].format(dateFormat)} по{" "}
										{dates[1].format(dateFormat)}
									</Typography.Title>
								}
								bordered
								column={{
									xxl: 2,
									xl: 2,
									lg: 2,
									md: 1,
									sm: 1,
									xs: 1,
								}}
							>
								<Descriptions.Item label="Остаток на начало периода">
									{operationHistory.balanceBegin}{" "}
									{account.data?.currency?.name}
								</Descriptions.Item>
								<Descriptions.Item label="Итого приход за период">
									{operationHistory.totalCredit}{" "}
									{account.data?.currency?.name}
								</Descriptions.Item>
								<Descriptions.Item label="Итого расход за период">
									{operationHistory.totalDebit}{" "}
									{account.data?.currency?.name}
								</Descriptions.Item>

								<Descriptions.Item label="Остаток на конец периода">
									{operationHistory.balanceEnd}{" "}
									{account.data?.currency?.name}
								</Descriptions.Item>
							</Descriptions>
						</Card>
					</Col>
					<Col span={6} xxl={6} xl={6} lg={6} md={24} sm={24} xs={24}>
						<Card>
							<Typography.Title>Операции</Typography.Title>
							<Typography.Paragraph copyable>
								Номер счёта {account?.data?.fullNumber}
							</Typography.Paragraph>
							<Space direction="horizontal">
								<Button
									onClick={() =>
										setAccountReplenishmentModalVisible(
											true,
										)
									}
								>
									Пополнить
								</Button>
								<Button
									onClick={() => {
										pay_step1();
										setMoneyTransferModalVisible(true);
									}}
								>
									Перевести
								</Button>
							</Space>
						</Card>
					</Col>
				</Row>
				<Row justify="space-around" gutter={[16, 48]}>
					<Col
						span={24}
						xxl={24}
						xl={24}
						lg={24}
						md={24}
						sm={24}
						xs={24}
					>
						<Card title=" История переводов">
							<Space direction="vertical" style={{width: "100%"}}>
								<Space direction="horizontal" size={12}>
									<RangePicker
										defaultValue={[
											moment(
												moment(),
												dateFormat,
											).subtract(1, "day"),
											moment(moment(), dateFormat),
										]}
										value={dates}
										onChange={(val: any) => setDates(val)}
									/>
									<Button onClick={showOperationsOnClick}>
										Показать историю операций
									</Button>
								</Space>
								<Table
									columns={columns}
									dataSource={
										operationHistory.operationList ?? []
									}
								/>
							</Space>
						</Card>
					</Col>
				</Row>
			</Space>
			<AccountReplenishmentModal
				isModalVisible={isAccountReplenishmentModalVisible}
				setIsModalVisible={setAccountReplenishmentModalVisible}
			/>
			<MoneyTransferModal
				isModalVisible={isMoneyTransferModalVisible}
				setIsModalVisible={setMoneyTransferModalVisible}
			/>
		</>
	);
};

export default BillingPage;

/**
 * const [dates, setDates] = useState<[Moment, Moment]>([
 *        moment(moment(), dateFormat).subtract(1, "day"),
 *        moment(moment(), dateFormat),
 *    ]);
 *    const {getOperationHistoryByAccount, getAccount} = useActions();
 *    const account = useTypedSelector((state) => state.user.account);
 *    const operationHistory = useTypedSelector(
 *        (state) => state.user.operationHistory,
 *    );
 *    useEffect(() => {
 * 		getAccount();
 * 		//pay();
 * 	}, []);
 *    useEffect(() => {
 * 		if (account.status == FetchStatus.SUCCESS) {
 * 			if (account.data.id) {
 * 				getOperationHistoryByAccount(
 * 					account.data.id,
 * 					dates[0].format(dateFormat),
 * 					dates[1].format(dateFormat),
 * 				);
 * 			}
 * 		}
 * 	}, [account]);
 *    const showOperationsOnClick = () => {
 * 		getOperationHistoryByAccount(
 * 			account?.data?.id,
 * 			dates[0].format(dateFormat),
 * 			dates[1].format(dateFormat),
 * 		);
 * 	};
 *    const {pay_step1} = useActions();
 *    const [
 *        isAccountReplenishmentModalVisible,
 *        setAccountReplenishmentModalVisible,
 *    ] = useState(false);
 *    const [isMoneyTransferModalVisible, setMoneyTransferModalVisible] =
 *        useState(false);
 *        <Space direction={"vertical"} style={{width: "100%"}}>
 *                <Row justify="space-around" gutter={[16, 48]}>
 *                    <Col
 *                        span={18}
 *                        xxl={18}
 *                        xl={18}
 *                        lg={18}
 *                        md={24}
 *                        sm={24}
 *                        xs={24}
 *                    >
 *                        <Card>
 *                            <Descriptions
 *                                title={
 * 									<Typography.Title level={5}>
 * 										Информация о состоянии счёта на период с{" "}
 * 										{dates[0].format(dateFormat)} по{" "}
 * 										{dates[1].format(dateFormat)}
 * 									</Typography.Title>
 * 								}
 *                                bordered
 *                                column={{
 * 									xxl: 2,
 * 									xl: 2,
 * 									lg: 2,
 * 									md: 1,
 * 									sm: 1,
 * 									xs: 1,
 * 								}}
 *                            >
 *                                <Descriptions.Item label="Остаток на начало периода">
 *                                    {operationHistory.BalanceBegin}{" "}
 *                                    {account.data.currency.name}
 *                                </Descriptions.Item>
 *                                <Descriptions.Item label="Итого приход за период">
 *                                    {operationHistory.TotalCredit}{" "}
 *                                    {account.data.currency.name}
 *                                </Descriptions.Item>
 *                                <Descriptions.Item label="Итого расход за период">
 *                                    {operationHistory.TotalDebit}{" "}
 *                                    {account.data.currency.name}
 *                                </Descriptions.Item>
 *
 *                                <Descriptions.Item label="Остаток на конец периода">
 *                                    {operationHistory.BalanceEnd}{" "}
 *                                    {account.data.currency.name}
 *                                </Descriptions.Item>
 *                            </Descriptions>
 *                        </Card>
 *                    </Col>
 *                    <Col span={6} xxl={6} xl={6} lg={6} md={24} sm={24} xs={24}>
 *                        <Card>
 *                            <Typography.Title>Операции</Typography.Title>
 *                            <Typography.Paragraph copyable>
 *                                Номер счёта {account?.data.fullNumber}
 *                            </Typography.Paragraph>
 *                            <Space direction="horizontal">
 *                                <Button
 *                                    onClick={() =>
 * 										setAccountReplenishmentModalVisible(
 * 											true,
 * 										)
 * 									}
 *                                >
 *                                    Пополнить
 *                                </Button>
 *                                <Button
 *                                    onClick={() => {
 * 										pay_step1();
 * 										setMoneyTransferModalVisible(true);
 * 									}}
 *                                >
 *                                    Перевести
 *                                </Button>
 *                            </Space>
 *                        </Card>
 *                    </Col>
 *                </Row>
 *                <Row justify="space-around" gutter={[16, 48]}>
 *                    <Col
 *                        span={24}
 *                        xxl={24}
 *                        xl={24}
 *                        lg={24}
 *                        md={24}
 *                        sm={24}
 *                        xs={24}
 *                    >
 *                        <Card title=" История переводов">
 *                            <Space direction="vertical" style={{width: "100%"}}>
 *                                <Space direction="horizontal" size={12}>
 *                                    <RangePicker
 *                                        defaultValue={[
 * 											moment(
 * 												moment(),
 * 												dateFormat,
 * 											).subtract(1, "day"),
 * 											moment(moment(), dateFormat),
 * 										]}
 *                                        value={dates}
 *                                        onChange={(val: any) => setDates(val)}
 *                                    />
 *                                    <Button onClick={showOperationsOnClick}>
 *                                        Показать историю операций
 *                                    </Button>
 *                                </Space>
 *                                <Table
 *                                    columns={columns}
 *                                    dataSource={
 * 										operationHistory.OperationList
 * 											?.AccountOperation ?? []
 * 									}
 *                                />
 *                            </Space>
 *                        </Card>
 *                    </Col>
 *                </Row>
 *            </Space>
 *            <AccountReplenishmentModal
 *                isModalVisible={isAccountReplenishmentModalVisible}
 *                setIsModalVisible={setAccountReplenishmentModalVisible}
 *            />
 *            <MoneyTransferModal
 *                isModalVisible={isMoneyTransferModalVisible}
 *                setIsModalVisible={setMoneyTransferModalVisible}
 *            />
 */
