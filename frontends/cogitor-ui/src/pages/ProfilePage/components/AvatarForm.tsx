import {EditOutlined, LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Form, Upload} from "antd";
import ImgCrop from "antd-img-crop";
import React, {FC, useState} from "react";

import {beforeUpload, getBase64} from "../../../utils/avatar";

interface AvatarViewInterface {
	avatarSrc: any;
}

const AvatarForm: FC<AvatarViewInterface> = (props) => {
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState(props.avatarSrc);
	const handleChange = (info: any) => {
		if (info.file.status === "uploading") {
			setLoading(true);
			return;
		}
		if (info.file.status === "done") {
			// Get this url from response in real world.
			getBase64(info.file.originFileObj, (url: any) => {
				setLoading(false);
				setImageUrl(url);
			});
			console.log(imageUrl);
		}
	};
	const onPreview = async (file: any) => {
		let src = file.url;
		if (!src) {
			src = await new Promise((resolve) => {
				const reader = new FileReader();
				reader.readAsDataURL(file.originFileObj);
				reader.onload = () => resolve(reader.result);
			});
		}
		const image = new Image();
		image.src = src;
		const imgWindow = window.open(src);
		imgWindow.document.write(image.outerHTML);
	};
	return (
		<Form name="avatarForm">
			<Form.Item label="Аватар" name="avatar" labelCol={{span: 10}}>
				<ImgCrop
					key="1"
					quality={1}
					modalTitle="Изменить изображение"
					minZoom={0.5}
					maxZoom={5}
				>
					<Upload
						beforeUpload={beforeUpload}
						action="http://localhost:3000/user/avatar"
					>
						<EditOutlined />
					</Upload>
				</ImgCrop>
			</Form.Item>
		</Form>
	);
};
export default AvatarForm;

/**
 * 	<Upload
 * 					name="avatar"
 * 					action="https://dev.myta.teka.ru/"
 * 					listType="picture-card"
 * 					className="avatar-uploader"
 * 					showUploadList={false}
 * 					beforeUpload={beforeUpload}
 * 					onPreview={onPreview}
 * 					onChange={handleChange}
 * 				>
 * 					{imageUrl ? (
 * 						<img
 * 							src={imageUrl}
 * 							alt="avatar"
 * 							style={{width: "100%"}}
 * 						/>
 * 					) : (
 * 						<div>
 * 							{loading ? <LoadingOutlined /> : <PlusOutlined />}
 * 							<div style={{marginTop: 8}}>Upload</div>
 * 						</div>
 * 					)}
 * 				</Upload>
 * */
/*

const AvatarForm: FC<AvatarViewInterface> = (props) => {
	const [loading, setLoading] = useState(false);
	

	const handleChange = (info) => {
		if (info.file.status === "uploading") {
			setLoading(true)
			return;
		}
		//if (info.file.status === "done") {
			// Get this url from response in real world.
			//getBase64(info.file.originFileObj, (imageUrl) =>
			//	setLoading(false);
			//		this.setState({
				//	imageUrl,
				//	loading: false,
			//	}),
		//	);
		}
	};

	return (
		<>
			<div className="avatar_title">Аватар</div>
			<Upload
				name="avatar"
				listType="picture-card"
				className="avatar-uploader"
				showUploadList={false}
				action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
				beforeUpload={beforeUpload}
				onChange={handleChange}
			>
				{props.avatarSrc ? (
					<img src={props.avatarSrc} alt="avatar" style={{width: "100%"}} />
				) : (
					<div>
						{loading ? <LoadingOutlined /> : <PlusOutlined />}
						<div style={{marginTop: 8}}>Upload</div>
					</div>
				)}
			</Upload>
		</>
	);
};

* <>
			<div className="avatar_title">Аватар</div>
			<div className="avatar">
				<img alt="avatar" src={props.avatarSrc} />
				<Upload {...props}>
					<Button icon={<UploadOutlined />} />
				</Upload>
			</div>
		</>
* */
