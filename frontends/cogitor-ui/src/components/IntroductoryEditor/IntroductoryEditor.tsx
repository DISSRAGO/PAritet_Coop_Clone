import {EditOutlined, SaveOutlined} from "@ant-design/icons";
import {Button, Row, Col, Space} from "antd";
import JoditEditor from "jodit-react";
import React, {FC, useEffect, useRef, useState} from "react";

import {useTypedSelector} from "../../hooks/useTypedSelector";

const IntroductoryEditor: FC = ({}) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const introductoryText = useTypedSelector(
		(state) => state.introductoryText.introductoryText,
	);
	const [content, setContent] = useState("");

	useEffect(() => {
		if (introductoryText) {
			setContent(content);
		}
	}, [introductoryText]);
	const editor = useRef(null);
	const config = {
		readonly: !isEditMode,
		disabled: !isEditMode,
		language: "ru",
		askBeforePasteFromWord: false,
		askBeforePasteHTML: false,
		uploader: {
			insertImageAsBase64URI: true,
		},
		sizeLG: 900,
		sizeMD: 700,
		sizeSM: 400,
	};
	const handleTurnOfEditMode = () => {
		setIsEditMode(false);
	};

	const handleTurnOnEditMode = () => {
		setIsEditMode(true);
	};

	return (
		<Space direction="vertical" style={{minWidth: "80%"}}>
			<Row>
				<Col span={24}>
					<JoditEditor
						ref={editor}
						value={content}
						config={config}
						onBlur={(newContent) => {
							setContent(newContent);
						}}
					/>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					{isEditMode ? (
						<Button
							onClick={handleTurnOfEditMode}
							shape="circle"
							icon={<SaveOutlined />}
							size="large"
						/>
					) : (
						<Button
							onClick={handleTurnOnEditMode}
							shape="circle"
							icon={<EditOutlined />}
							size="large"
						/>
					)}
				</Col>
			</Row>
		</Space>
	);
};

export default IntroductoryEditor;
