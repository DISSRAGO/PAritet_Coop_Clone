import {TeamOutlined} from "@ant-design/icons";
import {Button, Divider, Input, Modal, Space, Tree} from "antd";
import {DataNode, EventDataNode, Key} from "rc-tree/lib/interface";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../../hooks/useActions";
import {useTypedSelector} from "../../../hooks/useTypedSelector";
import {FetchStatus} from "../../../store/types/fetchTypes";

interface GroupSelectionModalProps {
	isModalVisible: boolean;
	handleOk(): void;
	handleCancel(): void;
	onSelect(
		selectedKeys: Key[],
		info: {
			event: "select";
			selected: boolean;
			node: EventDataNode;
			selectedNodes: DataNode[];
			nativeEvent: MouseEvent;
		},
	): void;
}
const GroupSelectionModal: FC<GroupSelectionModalProps> = (props) => {
	const {isModalVisible, handleOk, handleCancel} = props;
	const [isCreateGroupInputShow, setIsCreateGroupInputShow] = useState(false);
	const [groupName, setGroupName] = useState("");
	const {createGroup, getMyGroups} = useActions();
	const myGroups = useTypedSelector((state) => state.group.myGroups);
	const createGroupRequestStatus = useTypedSelector(
		(state) => state.group.createGroupRequestStatus,
	);
	const [treeData, setTreeData] = useState([]);
	useEffect(() => {
		if (
			createGroupRequestStatus.status == FetchStatus.IDLE ||
			createGroupRequestStatus.status == FetchStatus.SUCCESS
		) {
			getMyGroups();
			setIsCreateGroupInputShow(false);
		}
	}, [createGroupRequestStatus]);
	useEffect(() => {
		if (myGroups && myGroups.data.length > 0) {
			const treeDataTmp = [];
			// let keyIndex = 1;
			for (let i = 0; i < myGroups.data.length; i += 1) {
				const item = {
					icon: <TeamOutlined />,
					key: myGroups.data[i].id,
					title: `${myGroups.data[i].name} (общее количество человек ${myGroups.data[i].membersCount})`,
				};
				/*for (
					let j = 0;
					j < groupsWithMemberList[i].members.length;
					j += 1
				) {
					const member = {
						key: keyIndex,
						title: groupsWithMemberList[i].members[j].login,
						disabled: true,
					};
					item.children.push(member);
					keyIndex += 1;
				}*/
				treeDataTmp.push(item);
			}
			setTreeData(treeDataTmp);
		}
	}, [myGroups]);
	const showNameGroupInput = () => {
		setIsCreateGroupInputShow(true);
	};
	const saveGroupName = () => {
		createGroup(groupName);
	};
	return (
		<Modal
			title="Список групп"
			visible={isModalVisible}
			onOk={handleOk}
			onCancel={handleCancel}
		>
			<Tree
				treeData={treeData}
				showIcon={true}
				onSelect={props.onSelect}
			/>
			<Divider />
			<p>Если здесь нет нужной группы, вы можете её создать</p>
			<Space direction={"vertical"}>
				<Button onClick={showNameGroupInput}>Создать</Button>
				{isCreateGroupInputShow ? (
					<>
						<Input
							value={groupName}
							onChange={(e) => {
								setGroupName(e.target.value);
							}}
						/>
						<Button onClick={saveGroupName}>
							Сохранить группу с данным названием
						</Button>
					</>
				) : (
					<></>
				)}
			</Space>
		</Modal>
	);
};

export default GroupSelectionModal;
