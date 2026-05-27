import {UsergroupAddOutlined} from "@ant-design/icons";
import {Button, Typography, Tooltip} from "antd";
import {DataNode, EventDataNode, Key} from "rc-tree/lib/interface";
import React, {FC, useEffect, useState} from "react";

import {useTypedSelector} from "../../hooks/useTypedSelector";
import {FetchStatus} from "../../store/types/fetchTypes";
import GroupSelectionModal from "../modals/GroupSelectionModal";

interface GroupSelectionInputProps {
	value?: number;
	onChange?(value: any): void;
}
const GroupSelectionInput: FC<GroupSelectionInputProps> = (props) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const myGroups = useTypedSelector((state) => state.group.myGroups);
	const [groupName, setGroupName] = useState("");
	useEffect(() => {
		if (myGroups.status == FetchStatus.SUCCESS) {
			for (let i = 0; i < myGroups.data.length; i += 1) {
				if (props.value?.toString() === myGroups.data[i].id) {
					setGroupName(
						`${myGroups.data[i].name} (общее количество человек ${myGroups.data[i].membersCount})`,
					);
				}
			}
		}
	}, [myGroups]);
	const onSelect = (
		selectedKeys: Key[],
		info: {
			event: "select";
			selected: boolean;
			node: EventDataNode;
			selectedNodes: DataNode[];
			nativeEvent: MouseEvent;
		},
	) => {
		setGroupName(info.node.title.toString());
		props.onChange(selectedKeys[0]);
	};
	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleOk = () => {
		setIsModalVisible(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};
	return (
		<>
			{groupName === "" ? (
				<Typography.Text className="ant-form-text" type="secondary">
					( <UsergroupAddOutlined /> Группа не выбрана)
				</Typography.Text>
			) : (
				<p>
					<span>{groupName}</span>
				</p>
			)}
			<Tooltip title="Выберите группу">
				<Button
					type="primary"
					onClick={showModal}
					icon={<UsergroupAddOutlined />}
				/>
			</Tooltip>

			<GroupSelectionModal
				isModalVisible={isModalVisible}
				onSelect={onSelect}
				handleOk={handleOk}
				handleCancel={handleCancel}
			/>
		</>
	);
};

export default GroupSelectionInput;
