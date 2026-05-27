import React, {useEffect} from "react";
import {message} from 'antd';

export function SystemMessage(props) {

    const {messageText, setMessageText, status, setStatus} = props
    const [messageApi, contextHolder] = message.useMessage();

    const messagePopUp = () => {
        messageApi.open({
        type: status,
        content: messageText,
        });
    };

    useEffect(() => {
        if (status != "none" && messageText != "") {
            messagePopUp()
            setMessageText("")
            setStatus("none")
        }
    },[messageText,status])

    return (
        <>
            {contextHolder}
        </>
    );
};
