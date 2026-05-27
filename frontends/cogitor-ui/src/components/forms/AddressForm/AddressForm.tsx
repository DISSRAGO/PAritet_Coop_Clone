import {Form, Input, Select} from "antd";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../../hooks/useActions";
import {Address} from "../../../models/address/Address";
import {useTypedSelector} from "../../../hooks/useTypedSelector";

interface AddressFormProps {
	defaultAddress?: Address;
	isShowFlatInput: boolean;
}

const AddressForm: FC<AddressFormProps> = (props) => {
	const [form] = Form.useForm();
	const countries = useTypedSelector((state) => state.address.countries.data);
	const regions = useTypedSelector((state) => state.address.regions.data);
	const cities = useTypedSelector((state) => state.address.cities.data);
	const streets = useTypedSelector((state) => state.address.streets.data);
	const houses = useTypedSelector((state) => state.address.houses.data);
	const addressId = useTypedSelector((state) => state.address.addressId.data);
	const {getCountiesList, getCitiesList, getRegionsList, getStreetsList, getHousesList, getAddressId} = useActions();
	const [isDisabledRegion, setIsDisabledRegion] = useState(true);
	const [isDisabledCity, setIsDisabledCity] = useState(true);
	const [isDisabledStreet, setIsDisabledStreet] = useState(true);
	const [isDisabledHouse, setIsDisabledHouse] = useState(true);
	const [currentAddress, setCurrentAddress] = useState<Address>(
		props?.defaultAddress ?? {
			id: -1,
			country: {
				id: -1,
				name: "",
			},
			region: {
				id: -1,
				name: "",
			},
			city: {
				id: -1,
				name: "",
			},
			street: {
				id: -1,
				name: "",
			},
			house: {
				id: -1,
				name: "",
			},
			flat: {
				id: -1,
				name: "",
			},
		}
	);

	useEffect(() => {
		getCountiesList("");
		if (props.defaultAddress?.region.id != -1) {
			getRegionsList("", props.defaultAddress?.country);
			setIsDisabledRegion(false);
		}
		if (props.defaultAddress?.city.id != -1) {
			getCitiesList(
				"",
				props.defaultAddress?.country,
				props.defaultAddress?.region,
			);
			setIsDisabledCity(false);
		}
		if (props.defaultAddress?.street.id != -1) {
			getStreetsList(
				"",
				props.defaultAddress?.country,
				props.defaultAddress?.region,
				props.defaultAddress?.city,
			);
			setIsDisabledStreet(false);
		}
		if (props.defaultAddress?.house.id != -1) {
			getHousesList(
				"",
				props.defaultAddress?.country,
				props.defaultAddress?.region,
				props.defaultAddress?.city,
				props.defaultAddress?.street,
			);
			setIsDisabledHouse(false);
		}
	}, []);
	useEffect(() => {
		setCurrentAddress({
			...currentAddress,
			id: addressId,
		});
	}, [addressId]);
	const parseSelectedValue = (value: string) => {
		return {
			id: Number(value.split(" ", 1).toString()),
			name: value.split(" ").slice(1).join(" "),
		};
	};

	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
	const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
	const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

	const onSelectCountry = (value: string) => {
		setSelectedCountry(value);
		form.resetFields(["region", "city", "street", "house"]);

		setIsDisabledRegion(false);
		setIsDisabledCity(true);
		setIsDisabledStreet(true);
		setIsDisabledHouse(true);
		const country = parseSelectedValue(value);
		setCurrentAddress({
			id: -1,
			country: country,
			region: {
				id: -1,
				name: "",
			},
			city: {
				id: -1,
				name: "",
			},
			street: {
				id: -1,
				name: "",
			},
			house: {
				id: -1,
				name: "",
			},
			flat: {
				id: -1,
				name: "",
			},
		});
		getRegionsList("", country);
	};

	const onSelectRegion = (value: string) => {
		setSelectedRegion(value);
		form.resetFields(["city", "street", "house"]);

		setIsDisabledCity(false);
		setIsDisabledStreet(true);
		setIsDisabledHouse(true);
		const region = parseSelectedValue(value);
		setCurrentAddress({
			...currentAddress,
			region: region,
			city: {
				id: -1,
				name: "",
			},
			street: {
				id: -1,
				name: "",
			},
			house: {
				id: -1,
				name: "",
			},
		});
		if (currentAddress.country) {
			getCitiesList("", currentAddress.country, region);
		}
	};
	const onSelectCity = (value: string) => {
		setSelectedCity(value);
		form.resetFields(["street", "house"]);

		setIsDisabledStreet(false);
		setIsDisabledHouse(true);
		const city = parseSelectedValue(value);
		setCurrentAddress({
			...currentAddress,
			city: city,
			street: {
				id: -1,
				name: "",
			},
			house: {
				id: -1,
				name: "",
			},
		});
		if (currentAddress.country && currentAddress.region) {
			getStreetsList(
				"",
				currentAddress.country,
				currentAddress.region,
				city,
			);
		}
	};
	const onSelectStreet = (value: string) => {
		setSelectedStreet(value);
		form.resetFields(["house"]);

		setIsDisabledHouse(false);

		const street = parseSelectedValue(value);
		setCurrentAddress({
			...currentAddress,
			street: street,
			house: {
				id: -1,
				name: "",
			},
		});
		if (
			currentAddress.country &&
			currentAddress.region &&
			currentAddress.city
		) {
			getHousesList(
				"",
				currentAddress.country,
				currentAddress.region,
				currentAddress.city,
				street,
			);
		}
	};

	const onSelectHouse = (value: string) => {
		setSelectedHouse(value);
		const house = parseSelectedValue(value);
		setCurrentAddress({
			...currentAddress,
			house: house,
		});
		if (
			currentAddress.country &&
			currentAddress.region &&
			currentAddress.city &&
			currentAddress.street
		) {
			getAddressId(
				"",
				currentAddress.country,
				currentAddress.region,
				currentAddress.city,
				currentAddress.street,
				house,
			);
		}
	};

	return (
		<Form
			form={form}
			name={"addressForm"}
			layout="vertical"
			initialValues={{
				country: `${props.defaultAddress?.country?.name ?? ""}`,
				region: `${props.defaultAddress?.region?.name ?? ""}`,
				city: `${props.defaultAddress?.city?.name ?? ""}`,
				street: `${props.defaultAddress?.street?.name ?? ""}`,
				house: `${props.defaultAddress?.house?.name ?? ""}`,
				flat: `${props.defaultAddress?.flat?.name ?? ""}`,
			}}
		>
			<Form.Item
				label="Страна"
				name="country"
				rules={[
					{
						required: true,
					},
				]}
			>
				<Select
					showSearch
					placeholder="Выберите страну"
					optionFilterProp="children"
					value={selectedCountry}
					onSelect={onSelectCountry}
				>
					{countries.map((country) => (
						<Select.Option
							key={country.id}
							value={`${country.id} ${country.name}`}
						>
							{country.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item
				label="Регион"
				name="region"
				rules={[
					{
						required: true,
					},
				]}
			>
				<Select
					showSearch
					placeholder="Выберите регион"
					optionFilterProp="children"
					disabled={isDisabledRegion}
					value={selectedRegion}
					onSelect={onSelectRegion}
				>
					{regions.map((region) => (
						<Select.Option
							key={region.id}
							value={`${region.id} ${region.name}`}
						>
							{region.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item
				label="Город"
				name="city"
				rules={[
					{
						required: true,
					},
				]}
			>
				<Select
					showSearch
					disabled={isDisabledCity}
					placeholder="Выберите город"
					optionFilterProp="children"
					value={selectedCity}
					onSelect={onSelectCity}
				>
					{cities.map((city) => (
						<Select.Option
							key={city.id}
							value={`${city.id} ${city.name}`}
						>
							{city.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item
				label="Улица"
				name="street"
				rules={[
					{
						required: true,
					},
				]}
			>
				<Select
					showSearch
					disabled={isDisabledStreet}
					placeholder="Выберите улицу"
					optionFilterProp="children"
					value={selectedStreet}
					onSelect={onSelectStreet}
				>
					{streets.map((street) => (
						<Select.Option
							key={street.id}
							value={`${street.id} ${street.name}`}
						>
							{street.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item
				label="Дом"
				name="house"
				rules={[
					{
						required: true,
					},
				]}
			>
				<Select
					showSearch
					disabled={isDisabledHouse}
					placeholder="Выберите дом"
					optionFilterProp="children"
					onSelect={onSelectHouse}
					value={selectedHouse}
				>
					{houses.map((house) => (
						<Select.Option
							key={house.id}
							value={`${house.id} ${house.name}`}
						>
							{house.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			{props.isShowFlatInput && (
				<Form.Item label="Квартира" name="flat">
					<Input />
				</Form.Item>
			)}
		</Form>
	);
};

export default AddressForm;
