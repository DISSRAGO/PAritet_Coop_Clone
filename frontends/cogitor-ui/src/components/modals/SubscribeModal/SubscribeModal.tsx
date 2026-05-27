import {Button, Form, Input, Modal} from "antd";
import {FormFinishInfo} from "rc-field-form/lib/FormContext";
import React, {FC} from "react";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import AddressForm from "../../forms/AddressForm";

interface SubscribeModalProps {
	title: string;
	isModalVisible: boolean;
	handleOk(email: string): void;
	handleCancel(): void;
}
const SubscribeModal: FC<SubscribeModalProps> = (props) => {
	const countries = useTypedSelector((state) => state.address.countries.data);
	const regions = useTypedSelector((state) => state.address.regions.data);
	const cities = useTypedSelector((state) => state.address.cities.data);
	const streets = useTypedSelector((state) => state.address.streets.data);
	const houses = useTypedSelector((state) => state.address.houses.data);
	const addressId = useTypedSelector((state) => state.address.addressId.data);
	const {
		getCountiesList,
		getRegionsList,
		getCitiesList,
		getStreetsList,
		getHousesList,
		getAddressId,
	} = useActions();
	return (
		<Modal
			title={props.title}
			visible={props.isModalVisible}
			okText={"подписаться"}
			destroyOnClose
			footer={null}
			onCancel={() => {
				props.handleCancel();
			}}
		>
			<Form.Provider
				onFormFinish={(name: string, info: FormFinishInfo) => {
					const {emailForm} = info.forms;
					props.handleOk(emailForm.getFieldValue("email"));
				}}
			>
				<Form name="emailForm">
					<Form.Item
						label="Почта"
						name={"email"}
						labelCol={{span: 5}}
						rules={[
							{
								required: true,
							},
						]}
					>
						<Input />
					</Form.Item>
				</Form>
				<AddressForm
					isShowFlatInput={false}
					addressId={addressId}
					countries={countries}
					regions={regions}
					cities={cities}
					streets={streets}
					houses={houses}
					getCountiesList={getCountiesList}
					getRegionsList={getRegionsList}
					getCitiesList={getCitiesList}
					getStreetsList={getStreetsList}
					getHousesList={getHousesList}
					getAddressId={getAddressId}
				/>
				<Form>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							Подписаться
						</Button>
					</Form.Item>
				</Form>
			</Form.Provider>
		</Modal>
	);
};

export default SubscribeModal;
