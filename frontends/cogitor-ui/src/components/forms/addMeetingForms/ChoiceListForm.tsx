import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Form, Input, Space, Typography} from "antd";
import {FormListFieldData} from "antd/lib/form/FormList";
import React, {FC} from "react";

interface ChoiceListProps {
	field: FormListFieldData;
}

const ChoiceList: FC<ChoiceListProps> = (props) => {
	return (
		<Form.List
			name={[props.field.name, "choiceList"]}
			initialValue={[
				{variant: "Да"},
				{variant: "Нет"},
				{variant: "Воздержался"},
			]}
		>
			{(choiceList, {add, remove}, {errors}) => (
				<>
					<Typography.Paragraph style={{textAlign: "left"}}>
						{" "}
						Варианты
					</Typography.Paragraph>
					{choiceList.map((choice, index) => (
						<Form.Item
							key={[choice.name, "variant"].toString()}
							wrapperCol={{span: 24}}
						>
							<Form.Item
								{...choice}
								required={false}
								key={[choice.name, "variant"].toString()}
								name={[choice.name, "variant"]}
								fieldKey={[choice.fieldKey, "variant"]}
								validateTrigger={["onChange", "onBlur"]}
								rules={[
									{
										required: true,
										whitespace: true,
										message:
											"Пожалуйста, либо заполните поле, либо удалите его.",
									},
								]}
								noStyle
							>
								<Input
									placeholder="вариант"
									style={{width: "95%", marginLeft: 0}}
								/>
							</Form.Item>
							{choiceList.length > 1 ? (
								<MinusCircleOutlined
									style={{width: "5%", marginRight: 0}}
									className="dynamic-delete-button"
									onClick={() => remove(choice.name)}
								/>
							) : null}
						</Form.Item>
					))}

					<Form.Item wrapperCol={{span: 24}}>
						<Button
							style={{width: "100%"}}
							type="dashed"
							onClick={() => add()}
							icon={<PlusOutlined />}
						>
							Добавить вариант
						</Button>
						<Form.ErrorList errors={errors} />
					</Form.Item>
				</>
			)}
		</Form.List>
	);
};

export default ChoiceList;
