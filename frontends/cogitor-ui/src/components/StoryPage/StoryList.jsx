import React, { useState, useRef } from 'react';
import axios from "axios";
import { PATH, SITE, DIRPATH } from "../../utils/url.js";
import TextEditorJD from "../TextEditor/Jodit.jsx"
import "../../style/thanka.css"

import removeimg from '../../icons/remove.png';
import editimg from "../../icons/edit.png"

import { SystemMessage } from '../Viewer/SystemMessage.jsx';

function TodayTime(dateNow, dateItem) {
    let date = +new Date(dateNow)
    let dateComm = +new Date(dateItem);
    //return ((date - dateComm) < 24 * 60 * 60 * 1000)
    return ((date - dateComm) < 12 * 60 * 60 * 1000)
}

function Table(props) {

    const { arr, header, hash } = props;

    const [storyArray, setArray] = useState(arr);
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const removeItem = (id, i) => {
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'story/story.php?',
            headers: { "content-type": "multipart/form-data" },
            data: { Id: id, method: "removeItem" }
        }).then((result) => {
            let array = storyArray.slice()
            if (array[i].ID == id) {
                array[i].Removed = true;
            }
            setArray(array);
            setSystemMessageText("Запись удалена");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    const addCommemt = (id, i) => {
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'story/story.php?',
            headers: { "content-type": "multipart/form-data" },
            data: { Id: id, Note: commentRef.current, method: "addNoteToStory" }
        }).then((result) => {
            let array = storyArray.slice()
            setEditor(false)  
            if (array[i].ID == id) {
                array[i].Comment = commentRef.current;
            }
            setArray(array);
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    const [editor, setEditor] = useState(false)
    const [editorId, setId] = useState("")
    const commentRef = useRef(null)

    const commentOnChange = (e) => {
        commentRef.current = e;
    }

    const onClickEdit = (id) => {
        setEditor(true)
        setId(id)
    }

    return (
        <>
        <h4 style={{ display: "block" }}>{header}</h4>
        <table className='storyList'>
            <tbody>
                {storyArray.map((elem, i) => (
                    <>
                    <tr style = {elem.Active == "false" || elem.Removed == true ? {opacity: "50%"} : {}}>
                        <td className="pic">
                            {elem.Image == 1 ?
                                <img className='thankaPic' src={DIRPATH + "/image" + elem.Thanka + '.jpg?' + hash} width={50} />
                                :
                                <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                            }
                        </td>
                        <td className='tableName'>
                            {elem.Active == "true" ?
                                <>
                                { elem.DocumentPath != undefined ?
                                    <a href={SITE + 'navigator/' + elem.DocumentPath}>{elem.Thanka + ": " + elem.Name}</a>
                                    :
                                    <a href={SITE + 'navigator/' + elem.Thanka}>{elem.Thanka + ": " + elem.Name}</a>
                                }
                                </>
                            :
                                <p>{elem.Thanka + ": " + elem.Name}</p>
                            }
                        </td>
                        <td width={'45%'}>
                            {editor && elem.ID == editorId ?
                                <div className='tableCommentEditor'>
                                    <TextEditorJD defaultValue={elem.Comment} refs={commentRef} onChange={commentOnChange} />
                                    <button onClick={addCommemt.bind(this, elem.ID, i)}>Сохранить</button>
                                    <button onClick={setEditor.bind(this, false)}>Отменить</button>
                                </div>
                                :
                                <p dangerouslySetInnerHTML={{ __html: elem.Comment }} />
                            }
                        </td>
                        <td width={'50px'}>
                            {elem.Removed != true &&
                                <input
                                    onClick={() => onClickEdit(elem.ID)}
                                    type='image' src={editimg}
                                    title='Написать комментарий'
                                />
                            }
                        </td>
                        <td width={'50px'}>
                            {elem.Removed != true &&
                                <input
                                    onClick={() => removeItem(elem.ID, i)}
                                    type='image' src={removeimg}
                                    title='удалить из списка'
                                />
                            }
                        </td>
                    </tr>
                  {/*  <tr style = {elem.Active == "false" || elem.Removed == true ? {opacity: "50%"} : {}}>
                        <td className='tableAnnotation'>
                            {elem.Annotation != undefined &&
                                <p style={{ color: 'rgb(0,0,0,0.6)' }} dangerouslySetInnerHTML={{ __html: elem.Annotation.slice(0, 300) }} />
                            }
                        </td>
                        </tr>*/}
                    </>
                ))}
            </tbody>
        </table>
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    )
}

function StoryList(props) {

    let date = new Date()
    let arr = []
    if (props.content !== null) {
        arr = props.content.slice();
    }

    let todayArr = []
    for (let i = 0; i < arr.length; i++) {
        if (TodayTime(date, arr[i].DateCreate)) {
            todayArr.push(arr[i])
        }
    }

    let oldArr = []
    for (let i = todayArr.length; i < arr.length; i++) {
        oldArr.push(arr[i])
    }

    const [today, setToday] = useState(todayArr);
    const [old, setOld] = useState(oldArr);

    return (
        <>
            <div className='contentList'>
                <h3>Посещенные тханки</h3>
                <Table hash={props.hash} arr={today} header={"Сегодня"} setArray={setToday} />
                <Table hash={props.hash} arr={old} header={"Ранее"} setArray={setOld} />
            </div>
        </>
    );
}

export default StoryList;
