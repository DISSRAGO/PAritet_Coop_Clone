import {Button, Form, Spin} from "antd";
import {FormFinishInfo} from "rc-field-form/lib/FormContext";
import React, {FC} from "react";

import AddressForm from "../../../components/forms/AddressForm";
import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import {IUserProfile} from "../../../models/profile/IUserProfile";
import {FetchStatus} from "../../../store/types/fetchTypes";

const ProfileAddress: FC = () => {
	const {saveProfileAddress} = useActions();
	const userProfile = useTypedSelector((state) => state.user.userProfile);
	const saveProfileAddressStatus = useTypedSelector(
		(state) => state.user.saveProfileAddressStatus,
	);
	const addressId = useTypedSelector((state) => state.address.addressId.data);
	const parseSelectedValue = (value: string) => {
		return {
			id: Number(value.split(" ", 1).toString()),
			name: value.split(" ").slice(1).join(" "),
		}
	};

	const onFormFinish = (name: string, info: FormFinishInfo) => {
		const {addressForm} = info.forms;
		const addressValues = addressForm.getFieldsValue();
		const outputProfile: IUserProfile = {
			id: userProfile.data.id,
			livingAddress: {
				id: addressId,
				country: parseSelectedValue(addressValues.country),
				region: parseSelectedValue(addressValues.region),
				city: parseSelectedValue(addressValues.city),
				street: parseSelectedValue(addressValues.street),
				house: parseSelectedValue(addressValues.house),
				flat: {
					id: -1,
					name: addressValues?.flat ?? "",
				}
			},
		};
		saveProfileAddress(outputProfile);
	};
	return (
		<Spin spinning={userProfile.status == FetchStatus.LOADING}>
			<Form.Provider onFormFinish={onFormFinish}>
				<AddressForm
					defaultAddress={userProfile.data.livingAddress}
					isShowFlatInput={true}
				/>
				<Form>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={
								saveProfileAddressStatus.status ==
								FetchStatus.LOADING
							}
						>
							Обновить
						</Button>
					</Form.Item>
				</Form>
			</Form.Provider>
		</Spin>
	);
};

export default ProfileAddress;
