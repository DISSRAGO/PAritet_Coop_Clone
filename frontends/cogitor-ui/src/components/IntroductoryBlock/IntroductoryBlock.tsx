import {ArrowsAltOutlined, ShrinkOutlined} from "@ant-design/icons";
import {Button, Card, Space, Typography} from "antd";
import React, {FC, useEffect, useState} from "react";

import {useActions} from "../../hooks/useActions";
import {useTypedSelector} from "../../hooks/useTypedSelector";
import IntroductoryEditor from "../IntroductoryEditor";

const IntroductoryBlock: FC = () => {
	const {getIntroductoryText} = useActions();
	useEffect(() => {
		getIntroductoryText();
	}, []);
	const introductoryText = useTypedSelector(
		(state) => state.introductoryText.introductoryText,
	);
	const userStatus = 1;
	const minStatusForEdit = 2;
	const [expand, setExpand] = useState(false);
	return (
		<Card>
			{userStatus < minStatusForEdit ? (
				<Space
					direction="horizontal"
					align="start"
					style={{width: "100%"}}
				>
					<Typography.Paragraph
						ellipsis={
							!expand
								? {
										rows: 5,
								  }
								: undefined
						}
					>
						<p
							dangerouslySetInnerHTML={{
								__html: introductoryText || "<div />",
							}}
						/>
					</Typography.Paragraph>
					{expand ? (
						<Button
							icon={<ArrowsAltOutlined />}
							key={0}
							onClick={() => setExpand(false)}
						/>
					) : (
						<Button
							icon={<ShrinkOutlined />}
							key={0}
							onClick={() => setExpand(true)}
						/>
					)}
				</Space>
			) : (
				<>
					<IntroductoryEditor />
				</>
			)}
		</Card>
	);
};

export default IntroductoryBlock;
