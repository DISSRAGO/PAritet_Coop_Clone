import {ArrowsAltOutlined, ShrinkOutlined} from "@ant-design/icons";
import {Button, Space, Typography} from "antd";
import React, {FC, useState} from "react";

import {htmlDecode} from "../../utils/xml";

interface DescriptionWithExpandComponentProps {
	description: string;
}
const DescriptionWithExpandComponent: FC<DescriptionWithExpandComponentProps> =
	(props) => {
		const [expand, setExpand] = useState(false);
		return (
			<Space direction="horizontal" align="start">
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
							__html: htmlDecode(props.description) || "<div />",
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
		);
	};

export default DescriptionWithExpandComponent;
