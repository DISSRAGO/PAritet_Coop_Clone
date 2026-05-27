import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {PATH} from "../../utils/url.js";
import { SITE } from '../../utils/url.js';

import angledown from '../../icons/angledown.png';
import angleup from '../../icons/angleup.png';
import check from '../../icons/simplecheck.png';
import cross from '../../icons/cross.png';
import "../../style/thanka.css"

function SubscriberList(props) {

    //развернут ли список
    const [state, setState] = useState(false);
    
    const [admittedFollowers, setAdmittedFollowers] = useState([])
    const [unadmittedFollowers, setUnadmittedFollowers] = useState([])

    function onClickExpand() {
        axios({
            method: "post",
            url: PATH + 'members/members.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Id: props.id, method: "getThankaSubscriberList"},
        })
        .then((result) => {
            props.setMessage("");
            setState(true);
            setAdmittedFollowers(result.data.AdmittedSubscriberList);
            setUnadmittedFollowers(result.data.UnadmittedSubscriberList);
        })
        .catch((error) => {
            props.setMessage("Ошибка");
        })
    }

    function AccertSubscriber(id) {
        axios({
            method: "post",
            url: PATH + 'members/members.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Id: id, method: "accertSubscriber"},
        })
        .then((result) => {
            props.setMessage("");
            onClickExpand()
        })
        .catch((error) => {
            props.setMessage("Ошибка");
        })
    }

    function RejectSubscriber(id) {
        axios({
            method: "post",
            url: PATH + 'members/members.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Id: id, method: "rejectSubscriber"},
        })
        .then((result) => {
            props.setMessage("");
            onClickExpand()
        })
        .catch((error) => {
            props.setMessage("Ошибка");
        })
    }

    function onClickCollapse() {
        setState(false)
    }

    return (
    <>
        <h4>{"Список подписчиков"}</h4>
        {state == false ?
            <input className='subscribeAngles' onClick={() => onClickExpand()} title={'Развернуть'} type='image' src={angledown} />
            :
            <>
                <input className='subscribeAngles'
                    onClick={() => onClickCollapse()}
                    title={'Свернуть'}
                    type='image' src={angleup}
                />
                <table className='followers'>
                <tbody>
                    <tr>
                        <td colSpan={2}><h4>{"Одобренные подписчики"}</h4></td>
                    </tr>
                    {admittedFollowers != null && admittedFollowers.map((follower) => (
                        <tr>
                            <td><a href={SITE + 'navigator/' + follower.Author}>{follower.AuthorName}</a></td>
                            <td>
                                <input className='subscribeAngles'
                                    onClick={() => RejectSubscriber(follower.ID)}
                                    title={'Удалить'}
                                    type='image' src={cross}
                                />
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={2}><h4>{"Неодобренные подписчики"}</h4></td>
                    </tr>
                    {unadmittedFollowers != null && unadmittedFollowers.map((follower) => (
                        <tr>
                            <td><a href={SITE + 'navigator/' + follower.Author}>{follower.AuthorName}</a></td>
                            <td>
                                <input className='subscribeAngles'
                                    onClick={() => AccertSubscriber(follower.ID)}
                                    title={'Одобрить'}
                                    type='image' src={check}
                                />
                                <input className='subscribeAngles'
                                    onClick={() => RejectSubscriber(follower.ID)}
                                    title={'Удалить'}
                                    type='image' src={cross}
                                />
                            </td>
                        </tr>
                    ))}                  
                </tbody>
                </table>
            </>
        }
    </>
    )
}

function SubscribeButton(props) {
    //нажата ли кнопка
    const [state, setState] = useState(false);


    const [selectedAvatar, setSelectedAvatar] = useState(props.avatarList != [] && props.avatarList != null ? props.avatarList[0].ID : "");

    function subscribeThanka() {
        axios({
            method: "post",
            url: PATH + 'members/members.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Thanka: props.id, Avatar: selectedAvatar, method: "addThankaSubscriber"},
        })
        .then((result) => {
            props.setMessage("");
            props.setSubId(result.data.SubId)
            setState(false)
        })
        .catch((error) => {
            props.setMessage("Ошибка");
        })
    }

    return (
        <>
        { state == false && //props.stateSub == false &&
            <button onClick={() => setState(true)}>Подписаться</button>
        }
        { state == true && 
            <>
            <p>Выберите аватар:</p>
            <select onChange={(e) => setSelectedAvatar(e.target.value)}>
                {props.avatarList.map((avatar) => (
                    <option value={avatar.ID}>{avatar.Name}</option>
                ))}
            </select>
            <button onClick = {() => subscribeThanka()}>Подписаться</button>
            </>
        }
        </>
    )
}

function UnSubscribeButton(props) {

    function unsubscribeThanka() {
        axios({
            method: "post",
            url: PATH + 'members/members.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Id: props.SubscribeId, method: "thankaUnsubscribe"},
        })
        .then((result) =>
            props.setSubId("")
        )
        .catch((error) => {
            setMessage("Ошибка");
        })
    }

    return (
        <>
        {//props.stateSub == true &&
            <button onClick = {() => unsubscribeThanka()}>Отписаться</button>
        }
        </>
    )
}

function SubscriberService(props) {
    const [message, setMessage] = useState("");

    const [subscribeId, setSubscribeId] = useState(props.data.SubscribeId);

    return (
        <div className='subscribeService'>
            { props.data.PrivacyLevel != 6 && 
            <>
                {(subscribeId == "") &&
                    <SubscribeButton 
                        avatarList = {props.data.AvatarList} 
                        id = {props.data.Id} 
                        setMessage = {setMessage}
                        setSubId = {setSubscribeId}
                    />
                }
                { (subscribeId != "") &&
                    <UnSubscribeButton 
                        setMessage = {setMessage} 
                        SubscribeId = {subscribeId}
                        setSubId = {setSubscribeId}
                    />
                }
            </>
            } 
            <p>{message}</p>
            {props.data.PrivacyLevel == 6 && 
                <SubscriberList setMessage = {setMessage} id = {props.data.Id} />
            }
        </div>
    );

}

export default SubscriberService;