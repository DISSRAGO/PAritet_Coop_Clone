import React, { useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { PATH, SITE } from "../../utils/url.js";
import axios from 'axios';
import "../../style/thanka.css"

import {Menu, Alert} from "antd";

import { DatabaseOutlined, MenuOutlined, PieChartOutlined, EyeOutlined, PartitionOutlined} from "@ant-design/icons"

import { russianTypes, dateMonthWord, onlyDate } from '../../utils/language_ru.js';

import { useActions } from '../../hooks/useActions.ts';

import TextEditorJD from "../../components/TextEditor/Jodit.jsx"

import check from "../../../src/icons/check.png"

import adminhelp from "../../../src/icons/adminhelp.png"

import add from '../../icons/add.png';
import edit from '../../icons/edit.png';
import collection from '../../icons/collection.png';
import link from '../../icons/link.png';
import remove from '../../icons/remove.png';
import move from '../../icons/move.png';
import versions from '../../icons/versions.png';
import eye from '../../icons/eyeopen.png';

import add_catalog from "../../icons/add_catalog.png"

import { Input } from 'antd';

const { TextArea } = Input;
import widget from "../../../src/icons/widget.png"

import { SystemMessage } from './SystemMessage.jsx';

export function Notification(props) {

    const [array, setArray] = useState(props.notifications);

    function setSeen(id, i) {
        axios({
            method: "post",
            url: PATH + 'community/community.php',
            headers: { "content-type": "multipart/form-data" },
            data: { Id: id, method: "setNotificationSeen" },
        })
            .then((result) => {
                let arr = array.slice()
                arr[i].Seen = true;
                setTimeout(1000)
                arr.splice(i,1)
                setArray(arr);
            })
            .catch((error) => {
            })
        return array;
    }

    return (
        <div id='systemMessage'>
            <table>
                <tbody>
                {array != undefined && array.map((notification, i) => (
                    <tr>
                        <td>
                            <p dangerouslySetInnerHTML={{ __html: notification.Annotation }} /><a href={SITE + 'navigator/' + notification.Thanka}>{notification.Name}</a>
                        </td>
                        <td>
                            <input type="image" src={check} onClick={setSeen.bind(this, notification.ID, i)} title={'Пометить прочитанным'} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export function CreateSite(props) {
    const { data } = props

    return (
        <div className='button-menu'>
            <Link to={{ pathname: "/createsite", state: { data: data } }}>
                <button >Создать сайт</button>
            </Link>
        </div>
    )
}

export function ThankaHeader(props) {

    const { data, isLite } = props;

    let privacy = "";
    switch (data.Thanka.Privacy) {
        case 0: { privacy = "Всем"; break; }
        case 1: { privacy = "Только авторизованные пользователи"; break; }
        case 2: { privacy = "Только я"; break; }
        case 3: { privacy = "Только подписчики"; break; }
        default: break;
    }

    let meta = russianTypes(data.SectorLink != undefined && data.Object.Type != 'repost' ? "link" : data.Object.Type) + " " + dateMonthWord(data.Thanka.DateCreate,false)

    return (
        <div id='thankaname'>
            <div id="thankaName">
                { isLite ?
                    <a href = {SITE + 'navigator/' + data.Id} target='_blank'>№{data.Id}:<h2> {data.Thanka.Name}</h2></a> 
                    :
                    <>№{data.Id}:<h2> {data.Thanka.Name}</h2></>
                }
            </div>

            <div className='thankameta'>
                {meta}
                {data.Thanka.Author != undefined &&
                    <a id="thankaAuthor" href={SITE + 'navigator/' + data.Thanka.Author}> {data.Thanka.AuthorName} </a>
                }
                <img src={eye} width={15} />{data.Thanka.ViewNum}
                {data.PrivacyLevel >= 4 && <> видна {privacy}</>}
            </div>
            
            {data.Object.VersionStamp == '1' && data.SectorLink == undefined && <h3>Тханка запечатана</h3>}

        </div>
    );
}

export function FunctionalButtons(props) {

    const { data, auth, setInterfaceType } = props;

    const { getTableData } = useActions();

    const [type, setType] = useState(data.SectorLink != undefined ? "link" : data.Object.Type)

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const thankaDelete = (e) => {
        const confirmBox = window.confirm(
            'Удалить текущую тханку? Ее нельзя будет восстановить'
        );
        if (confirmBox === true) {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'thanka/thanka.php',
                headers: { "content-type": "multipart/form-data" },
                data: { Id: data.Id /*id: auth.data.id, login: auth.data.login*/, method: "removeThanka" }
            }).then((result) => {
                window.location.assign(SITE + 'navigator/' + data.Thanka.ParentId);
                setSystemMessageText("");
                setSystemMessageType("none")
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
        }
    }

    const getCollection = (e) => {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: { Login: auth.data.login, UserId: auth.data.id, method: "getCollections" },
        })
            .then((result) => {
                getTableData(result.data.List);
                setInterfaceType('tableCollection')
                setSystemMessageText("");
                setSystemMessageType("none")
            })
            .catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
    }

    const getAllVersions = (e) => {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: { Id: data.Id, Login: auth.data.login, UserId: auth.data.id, method: "getAllVersions" },
        })
            .then((result) => {
                getTableData(result.data.List);
                setInterfaceType('tableVersion')
                setSystemMessageText("");
                setSystemMessageType("none")
            })
            .catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
    }

    const onClickCatalog = (e) => {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { 
                "content-type": "multipart/form-data",
            },
            data: {UserId: auth.data.id, Login: auth.data.login, method: "getMyThanka"},
        })
        .then((result) => {
            getTableData(result.data.List);
            setInterfaceType('tableList')
        })
        .catch((error) => {
            //setMessage("Ошибка");
        })
    }     

    return (
        <>
        <div className='button-group'>
            {data.PrivacyLevel > 2 && data.PrivacyLevel != 4 && type != 'hashtag' && (data.Thanka.DocumentPart == undefined ||
                (data.Thanka.DocumentPart == true && type == 'document')) && //авторизованный может создавать потомков
                <Link to={{ pathname: "/create", state: { data: data } }}>
                    <input title={'Создать новую тханку'} type='image' src={add} />
                </Link>
            }
            {data.PrivacyLevel == 6 && //владелец
                <>
                    <Link to={{ pathname: "/edit", state: { data: data } }}>
                        <input title={'Редактировать тханку'} type='image' src={edit} />
                    </Link>

                    {type !== 'cabinet' &&
                        <input onClick={(e) => setInterfaceType('tableLink')} title={'Добавить ссылку'} type='image' src={link} />
                    }
                    {type == "article" && data.Thanka.ThankaLink == undefined &&
                        <input onClick={getAllVersions} title={'Просмотреть версии'} type='image' src={versions} />
                    }
                </>
            }
            {data.PrivacyLevel >= 4 &&  //админ и владелец
                type !== 'cabinet' &&
                (type !== 'avatar' || (type == 'avatar' && data.MyThankaList == null && data.AvatarList.length > 1 && data.Children == null)) &&
                type !== 'hashtag' && type != 'site' &&
                <>
                    <input onClick={thankaDelete} title={'Удалить тханку'} type='image' src={remove} />
                    {data.Thanka.DocumentPart != true && type !== 'cabinet' &&  data.PrivacyLevel == 6 && 
                        <input onClick={(e) => setInterfaceType('tableMove')} title={'Переместить'} type='image' src={move} />
                    }
                </>
            }
            {data.PrivacyLevel > 1 && type !== 'cabinet' && //авторизованный
                <>
                    <input onClick={getCollection} title={'Добавить в коллекцию'} type='image' src={collection} />
                </>
            }
            {data.PrivacyLevel >= 2 && type == 'catalog' &&
                <>
                    <input onClick={onClickCatalog} title={'Добавить в каталог'} type='image' src={add_catalog} />
                </>
            }
        </div>
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} Type = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    );
}

export function LeftButtons(props) {

    const {interfaceType, setInterfaceType, isTinyScreen, isHidden, onClickEye, buttonName} = props

    const lilMenu = [
        {
            key: "burger",
            icon: <MenuOutlined style = {{fontSize:"20px"}}/>,
            children: [
                {
                    key: "table",
                    label: 'Табличный вид',
                    icon: <DatabaseOutlined style = {{fontSize:"20px"}}/>,
                    onClick: setInterfaceType.bind(this,'simpleTable')
                },
                {
                    key: "iconostas",
                    label: 'Графический вид',
                    icon: <PieChartOutlined style = {{fontSize:"20px"}}/>,
                    onClick: setInterfaceType.bind(this,'iconostas')
                },
                {
                    key: "graph",
                    label: 'Граф',
                    icon: <PartitionOutlined style = {{fontSize:"20px"}}/>,
                    onClick: setInterfaceType.bind(this,'map')
                },
            ]},
        (interfaceType != 'map' &&
            {
                key: "eye",
                title: buttonName,
                icon: <EyeOutlined style = {{fontSize:"20px"}}/>,
                onClick: onClickEye
            }
        )
    ]

    const bigMenu = [
        (!isHidden && 
            {
                key: "table",
                title: 'Табличный вид',
                icon: <DatabaseOutlined style = {{fontSize:"20px"}}/>,
                onClick: setInterfaceType.bind(this,'simpleTable')
            }
        ),
        (!isHidden && 
            {
                key: "iconostas",
                title: 'Графический вид',
                icon: <PieChartOutlined style = {{fontSize:"20px"}}/>,
                onClick: setInterfaceType.bind(this,'iconostas')
            }
        ),
        (!isHidden && 
            {
                key: "graph",
                title: 'Граф',
                icon: <PartitionOutlined style = {{fontSize:"20px"}}/>,
                onClick: setInterfaceType.bind(this,'map')
            }
        ),
        (interfaceType != 'map' &&
            {
                key: "eye",
                title: buttonName,
                icon: <EyeOutlined style = {{fontSize:"20px"}}/>,
                onClick: onClickEye
            }
        )
    ]

    return(
    <div className='leftButtons'>
        <Menu theme="light" mode="horizontal" items={isTinyScreen ? lilMenu : bigMenu } style={{margin: "auto"}}/>
    </div>
    )
}

export function AdminMessage(props) {
     //СВЯЗЬ С АДМИНАМИ
    
    const messageRef = useRef(null)
    const dialog = useRef(null)

    const [systemMessageText, setSystemMessageText] = useState("");

    const [sended, setSended] = useState(false)

    function sendMessage() {
        if (messageRef.current !== "") {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php?',
                headers: { "content-type": "multipart/form-data" },
                data: { Id: props.thankaId, Cabinet: sessionStorage.getItem("cabinet"), Message: messageRef.current, method: "sendMessage" }
            }).then((result) => {
                setSended(true)
                messageRef.current = "";
                setSystemMessageText("Сообщение успешно отправлено")
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка")
            });
        }
    }

    function closeModal() {
        dialog.current.close()
        setSended(false)
        messageRef.current = "";
    }
    return (
        <>
        <div className='adminHelp'>
            <input type="image" src={adminhelp} onClick={() => dialog.current.showModal()} title="связаться с администрацией" />
        </div>
        <dialog id='messageForAdmin' ref={dialog}>
            <h4>{"Связь с администрацией портала"}</h4>
            {!sended ?
                <>
                    <TextEditorJD
                        refs={messageRef}
                        onChange={(e) => messageRef.current = e}
                        defaultValue={""}
                    />
                    <button onClick={sendMessage.bind(this)}>Отправить</button>
                </>
                :
                <h3>{systemMessageText}</h3>
            }
            <button onClick={closeModal.bind(this)}>{!sended ? 'Отменить' : 'Закрыть'}</button>
        </dialog>
        </>
    )
}

export function WidgetGetter(props) {
    const dialog = useRef(null)
    const iframeCode = "<iframe src='"+SITE+"navigator/"+props.thankaId+"?lite=true' width='600' height='400'></iframe>"

    return (
        <>
        <div className='widgetGetter'>
            <input
                onClick={() => dialog.current.showModal()}
                type='image' src={widget}
                title='Создать виджет'
            />
        </div>
        <dialog id='widget' ref={dialog}>
            <h4>{"Код для вставки виджета"}</h4>
            <div>
                <TextArea rows={4} readOnly value={iframeCode} style={{"width":400}}/>
            </div>
            <button onClick={() => dialog.current.close()}>{'Закрыть'}</button>
        </dialog>
        </>
    )
}