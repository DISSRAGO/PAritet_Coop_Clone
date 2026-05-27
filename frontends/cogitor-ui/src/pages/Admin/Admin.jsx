import React, { useEffect, useState, useContext, useRef } from 'react';
import { useMediaQuery } from 'react-responsive'
import {PATH, SITE, DIRPATH} from "../../utils/url.js";
import axios from 'axios';
import "../../style/thanka.css"

import { SystemMessage } from '../../components/Viewer/SystemMessage.jsx';

import { CommentHeader } from '../../components/Society/Comment.jsx';

import removeimg from '../../icons/remove.png';
import pizza from '../../icons/pizza.png';
import megaphone from '../../icons/megaphone.png';
import comments from '../../icons/comments.png';

import TextEditorJD from '../../components/TextEditor/Jodit.jsx'

function AdminPage(props) {

    const [state, setState] = useState("thanka")

    return (
        <section>
            <AdminMenu setState = {setState} state = {state}/>
            <AdminWork state = {state}/>
        </section>
    )
}

function Pagination(props) {

    let pages = []
    for (let i = 0; i < props.count; i++) pages[i] = i+1

    return (
        <div className='pagination'>
            {pages.map((page) => (
                <button onClick={props.setPage.bind(this, page)}>{page}</button>
            ))}
        </div>
    )
}

function Preview(props) {
    return(
        <>
        {/*props.selectedId == props.id &&*/
        <div className='popupPreview'>
            <div /*style={props.preview == true ? {display: "block"} : {display: "none"}}*/>
            <h3>{props.Name}</h3>
            <p dangerouslySetInnerHTML={{ __html: props.Annotation}} />
            <p dangerouslySetInnerHTML={{ __html: props.Desc}} />
            </div>
        </div>
        }
        </>
    )
}

function AdminMenu(props) {
    return (
        <div className='leftMenu'>
            <button className='menuItem' onClick={props.setState.bind(this, "thanka")} style={props.state == "thanka" ? {backgroundColor: "#bdbebd"} : {}}>
                <img src={pizza}/>
                {"Тханки"}
            </button>
            <button className='menuItem' onClick={props.setState.bind(this, "comments")} style={props.state == "comments" ? {backgroundColor: "#bdbebd"} : {}}>
                <img src={comments}/>
                {"Комментарии"}
            </button>
            <button className='menuItem' onClick={props.setState.bind(this, "notifications")} style={props.state == "notifications" ? {backgroundColor: "#bdbebd"} : {}}> 
                <img src={megaphone}/>
                {"Уведомления"}
            </button>
        </div>
    )
}

function AdminWork(props) {
    return (
        <div className='RightWork'>
            {props.state == "thanka" &&
                <ThankaList />
            }
            {props.state == "comments" &&
                <CommentList />
            }
            {props.state == "notifications" &&
                <Notifications />
            }
        </div>
    )
}

function privacyType(privacy) {
    let result = ""
    switch (privacy) {
        case '0': {
            result = "всем"
            break
        }
        case '1': {
            result = "только авторизованным"
            break
        }
        case '2': {
            result = "только мне"
            break
        }
        case '3': {
            result = "только подписчикам"
            break
        }
    }
    return result
}

function CommentList() {

    const [comments, setComments] = useState([])
    function deleteComment(id,i) {
        let text = prompt('Введите причину для удаления:')
        if (text != "") {
            axios({
                method: "post",
                url: PATH + 'community/community.php',
                headers: { "content-type": "multipart/form-data" },
                data: { ID: id, text: text, method: "deleteComment" },
            }).then((result) => {
                let arr = comments.slice()
                arr[i].Removed = "true"
                setComments(arr)
            }).catch((error) => {
                setMessage("Произошла ошибка");
            })
        }
    }

    useEffect(() => {
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'request/request.php?',
            headers: { "content-type": "multipart/form-data" },
            data: {method: "getAllComments"}
        }).then((result) => {
            setComments(result.data.List)
        }).catch((error) => {
            setMessage('Произошла ошибка')
        });
    },[])

    function hideRemoved() {
        let arr = comments.slice()
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Removed == "true") {
                arr.splice(i,1)
                i--;
            }
        }
        setComments(arr)
    }

    const [preview, showPrewiew] = useState(false)
    const [selectedId, setId] = useState(null)
    const [selectedName, setName] = useState(null)
    const [selectedAnnotation, setAnnotation] = useState(null)
    const [selectedDesc, setDesc] = useState(null)

    function showPopUp(id,name,annotation,desc) {
        showPrewiew(true)
        setId(id)
        setAnnotation(annotation)
        setName(name)
        setDesc(desc)
    } 

    function hidePopUp() {
        showPrewiew(false)
        setId(null)
        setAnnotation(null)
        setName(null)
        setDesc(null)
    } 

    return(
        <>
        <h3>Комментарии</h3>
        <button onClick = {hideRemoved.bind()}>Скрыть удаленные</button>
        {comments != undefined && comments.map((comment, i) => (
            <>
            <p>К теме 
                <a 
                    href={SITE + "navigator/" + comment.Thanka}
                    onMouseOver={showPopUp.bind(this, comment.Thanka,comment.ThankaName,comment.ThankaAnnotation,comment.ThankaDesc)} 
                    onMouseOut={hidePopUp.bind(this)} 
                >
                    {" " + comment.ThemeName}
                </a>
            </p>
            <div className='commentStory'>
                <div style={comment.Removed == "true" ? {opacity: "50%"} : {}}>
                    {comment.Author != undefined &&
                        <CommentHeader comment={comment} />
                    }
                    <p dangerouslySetInnerHTML={{ __html: comment.Text }} />
                    {comment.Removed != "true" && 
                        <input
                            onClick={deleteComment.bind(this, comment.ID, i)}
                            type='image' src={removeimg} title='удалить комментарий'
                        />
                    }
                </div>
            </div>
            </>
        ))}
        <Preview Name = {selectedName} preview={preview} selectedId={selectedId} Annotation = {selectedAnnotation} Desc = {selectedDesc}/>
        </>
    )
}

function ThankaList() {
    const [thanka, setThanka] = useState([])
    let hash;

   /* const [lastId, setLastId] = useState(null)
    const [pageNum, setPageNum] = useState(0)
    const [page, setPage] = useState(null)*/

    /*useEffect(() => {
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: {method: "getThankaInfo"},
        }).then((result) => {
            setPage(1)
            setLastId(result.data.Id)
            setPageNum(result.data.Count / 50)
        }).catch((error) => {
        })  
    },[])*/

    useEffect(() => {
        axios({
                method: "post",
                url: PATH + 'request/request.php',
                headers: { "content-type": "multipart/form-data" },
                data: {/*Id: +lastId + +1, */method: "getAllThankas", type: "admin"},
            }).then((result) => {
                setThanka(result.data.List)
                hash = result.data.Hash
                //setLastId(thanka.at(-1).ID)
            }).catch((error) => {
            })
    },[/*page, lastId*/])

    function removeThanka(id,i) {
        let text = prompt('Введите причину для удаления:')
        if (text != "") {
            axios({
                method: "post",
                url: PATH + 'thanka/thanka.php',
                headers: { "content-type": "multipart/form-data" },
                data: { Id: id, text: text, method: "removeThanka" },
            }).then((result) => {
                let arr = thanka.slice()
                arr[i].Removed = "true"
                setThanka(arr)
            }).catch((error) => {
            })
        }
    }

    function hideRemoved() {
        let arr = thanka.slice()
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Removed == "true") {
                arr.splice(i,1)
                i--;
            }
        }
        setThanka(arr)
    }

    const [preview, showPrewiew] = useState(false)
    const [selectedId, setId] = useState(null)
    const [selectedName, setName] = useState(null)
    const [selectedAnnotation, setAnnotation] = useState(null)
    const [selectedDesc, setDesc] = useState(null)

    function showPopUp(id,name,annotation,desc) {
        showPrewiew(true)
        setId(id)
        setAnnotation(annotation)
        setName(name)
        setDesc(desc)
    } 

    function hidePopUp() {
        showPrewiew(false)
        setId(null)
        setAnnotation(null)
        setName(null)
        setDesc(null)
    } 

    return(
        <>
        <h3>Тханки</h3>
        <button onClick = {hideRemoved.bind()}>Скрыть удаленные</button>
        <table className='storyList'>
            <tbody>
                {thanka !== null && thanka.map((elem, i) => (
                    <>
                    <tr style = {elem.Removed == "true" ? {opacity: "50%"} : {}}>
                        <td className="pic">
                            {elem.Image == 1 ?
                                <img className='thankaPic' src={DIRPATH + "/image" + elem.ID + '.jpg?' + hash} width={50} />
                                :
                                <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                            }
                        </td>
                        <td className='tableName'>
                        {elem.Removed != "true" ?
                                <>
                                { elem.DocumentPath != undefined ?
                                    <a 
                                        onMouseOver={showPopUp.bind(this, elem.ID,elem.Name,elem.Annotation,elem.ThankaDesc)} 
                                        onMouseOut={hidePopUp.bind(this)} 
                                        href={SITE + 'navigator/' + elem.DocumentPath}
                                    >
                                        {elem.ID + ": " + elem.Name}
                                    </a>
                                    :
                                    <a 
                                        onMouseOver={showPopUp.bind(this, elem.ID,elem.Name,elem.Annotation,elem.ThankaDesc)} 
                                        onMouseOut={hidePopUp.bind(this)} 
                                        href={SITE + 'navigator/' + elem.ID}
                                    >
                                        {elem.ID + ": " + elem.Name}
                                    </a>
                                }
                                </>
                            :
                                <p>{elem.ID + ": " + elem.Name}</p>
                            }
                        </td>
                        <td>
                            {elem.Type}
                        </td>
                        <td>
                            {privacyType(elem.Privacy)}
                        </td>
                        <td width={'50px'}>
                            {elem.Removed != "true" && elem.Type != 'cabinet' && elem.Type != 'avatar' &&
                                <input
                                    onClick={() => removeThanka(elem.ID, i)}
                                    type='image' src={removeimg}
                                    title='удалить'
                                />
                            }
                        </td>
                    </tr>
                    </>
                ))}
            </tbody>
        </table>
        <Preview Name = {selectedName} preview={preview} selectedId={selectedId} Annotation = {selectedAnnotation} Desc = {selectedDesc}/>   
        {/*<Pagination count = {pageNum} setPage = {setPage}/>*/}
        </>
    )
}

function normalDate(date) {
    let pattern = RegExp("-|T|:")
    let dateArr = date.split(pattern)

    return dateArr[2]+"."+dateArr[1]+"."+dateArr[0]//+" "+dateArr[3]+":"+dateArr[4]
}

function addZero(a) {
    return ((a != 0 && String(a).length == 1) || a == 0 ? "0" + a : a)
}

function Notifications() {
    
    let today = new Date().toISOString().split('T')[0];
    const [hours, setHours] = useState("10")
    const [minutes, setMinutes] = useState("00")

    const [startDate, setStartDate] = useState(normalDate(today))
    const [endDate, setEndDate] = useState("10:05")
    const [workTime, setWorkTime] = useState(5)
    
    const [text, setText] = useState("будет проводиться техническое обслуживание.")

    const [message, setMessage] = useState(null)

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    useEffect(() => {
        setMessage(`В период с ${startDate} ${hours}:${minutes} до ${endDate} ${text} Сервис будет недоступен. Приносим извинения за неудобства.`)
    },[startDate, endDate, text, hours, minutes])

    useEffect(() => {
        let m = +minutes + +workTime
        setEndDate((+m >= 60 ? +hours + 1 : hours) + ":" + (+m >= 60 ? addZero(+m - 60) : addZero(m)))
    },[hours, minutes, workTime])

    function sentNotification() {
        axios({
            method: "post",
            url: PATH + 'community/community.php',
            headers: { "content-type": "multipart/form-data" },
            data: { Text: message, method: "createSystemNotification" },
        }).then((result) => {
            setSystemMessageText("Успешно")
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка")
            setSystemMessageType("error")
        })
    }

    return (
        <>
        <h3>Уведомления</h3>
        <div>
            <h3>Отправка системного сообщения</h3>
            <p>Дата и время начала работы: </p>
            <input type='date' onChange={(e) => setStartDate(normalDate(e.target.value))} min={today} defaultValue={today}/>
            <select onChange={(e) => setHours(e.target.value)} className='clock'>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
            </select>
            <select onChange={(e) => setMinutes(e.target.value)} className='clock'>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
            </select>
            <p>Количество минут на простой: </p>
            <select onChange={(e) => setWorkTime(e.target.value)}>
                <option>5</option>
                <option>10</option>
                <option>15</option>
                <option>20</option>
                <option>30</option>
                <option>60</option>
            </select>
            <p>Вид работ:</p>
            <select onChange={(e) => setText(e.target.value)}>
                <option>будет проводиться техническое обслуживание.</option>
                <option>будет установлено обновление.</option>
            </select>
            <p>Полученное сообщение:</p>
            <input onChange={(e) => setMessage(e.target.value)} value = {message} className='big_input'/>
            <button onClick={sentNotification}>Отправить</button>
            <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </div>
        </>
    )
}

export default AdminPage;
