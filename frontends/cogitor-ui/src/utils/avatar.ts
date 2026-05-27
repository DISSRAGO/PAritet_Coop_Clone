import {message} from "antd";

export const convertBinaryStringToFile = (
    binaryContent: string,
    contentType: string,
): string => {

    const binary = window.atob(binaryContent);
    const array = [];
    for (let i = 0; i < binary.length; i += 1) {
        array.push(binary.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
        type: contentType,
    });
    return URL.createObjectURL(file);
};

/**
 * url картинки, которая подставляется как аватар пользователся, если у него нет аватара
 * @constant
 * @type {string}
 * */
export const DEFAULT_AVATAR_URL =
    "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png";

export const getBase64 = (img: Blob, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
};

export const beforeUpload = (file: any) => {
    /*const newAvatar = file; //fileList[0].originFileObj;

    const uploadImage = (file) => {
        Avatars.find({userId: currentUser._id}).remove();

        const upload = Avatars.insert(
            {
                file,
                streams: "dynamic",
                chunkSize: "dynamic",
                meta: {userId: currentUser._id},
            },
            false,
        );

        upload.on("end", function (error, fileObj) {
            if (error) {
                message.error(`Fehler beim Upload: ${error}`);
            } else {
                //console.log(`File successfully uploaded`, fileObj);
            }
        });

        upload.start();
    };

    //uploadImage(newAvatar);
    new Compressor(newAvatar, {
        maxWidth: 128,
        quality: 0.8,
        success(compressedImage) {
            uploadImage(compressedImage);
        },
        error(err) {
            console.log("compressor-err:", err);
        },
    });

    return false;*/
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
};
