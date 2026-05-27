import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import {PATH, DIRPATH, SITE} from "../../utils/url.js";
import ContentList from './ContentList.jsx';

import "../../style/thanka.css"

import { useActions } from '../../hooks/useActions.ts';
import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import CogObjectEditor from '../Editor/CogObjEditor.jsx';
import RequestViewer from './CogRequest.jsx';

import { DateForEditor } from '../../utils/language_ru.js';

import { SystemMessage } from './SystemMessage.jsx';

function normalDateSlash(date) {

    if (date != undefined && date != null && date != "") {
        let separator = "/"
        let datearr = date.split(separator);
        datearr[2] = datearr[2].slice(0,4);

        return (datearr[1] + "." + datearr[0] + "." + datearr[2]);
    }
    return date
}

export function PictureFromMPT(props) {

    const {Id, className} = props

    const DIR_IMAGE = "https://m.paritet.coop/image/"
    //const DIR_IMAGE = "http://opencart.stend.nsk.ru/image"
/*
    const MIME = ["jpg","jpeg","png","JPG","JPEG","PNG"];

    let img = ""

    let images = []

    useEffect(() => {
        for (let i = 0; i < MIME.length; i++) {
            images[i] = new Image()
            images[i].src = `${DIR_IMAGE}/goods/${Id}/0.${MIME[i]}`
            images[i].onload = (e) => {
                img = <><img className = {className} src={img.src}/></>
            }
        }
    }, [])
    
*/

   /* const setNone = (e) => {
        if (e.type != "") {
            e.target.style.display = 'none'
        }
    }*/

    return (
        <>
        {<div>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.jpg` } onError = {(e) => e.target.style.display = 'none'}/>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.jpeg`} onError = {(e) => e.target.style.display = 'none'}/>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.png` } onError = {(e) => e.target.style.display = 'none'}/>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.JPG` } onError = {(e) => e.target.style.display = 'none'}/>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.JPEG`} onError = {(e) => e.target.style.display = 'none'}/>
            <img className = {className} src={`${DIR_IMAGE}/goods/${Id}/0.PNG` } onError = {(e) => e.target.style.display = 'none'}/>
        </div>}
        </>
    )
}

export function getProductLinks(id) {
    const OLD_MARKET = "https://market.paritet.coop/"
    const NEW_MARKET = "https://m.paritet.coop/"

    const OLD_STEND = "https://stend.dom.nsk.ru/stend/group/251500/"
    const NEW_STEND = "http://opencart.stend.nsk.ru/"

    return {
        old: OLD_STEND+"ptgktrcgoodcard_"+id,
        new: NEW_STEND+"index.php?route=product/product&language=ru-ru&product_id="+id
    }
}

function ProductViewer(props) {
    const {object, links} = props

    const [category, setCategory] = useState([])
    useEffect(() => {
        if (links != null) {
            let cat = []
            for (let i = 0; i < links.length; i++) {
                if (links[i].Type != undefined && links[i].Type == 'category') {
                    cat.push(links[i])
                }
            }
            setCategory(cat)
        }
    },[])

    return(
    <>
        <p><b>{object.Name}</b></p>
        <PictureFromMPT Id = {object.ProductId} className = {"productImg"}/>
        <p dangerouslySetInnerHTML={{__html: object.ShortDescription}}/>
        <p dangerouslySetInnerHTML={{__html: object.Description}}/>
        <p><b>{"Цена: "}</b>{object.Price+" паев"}</p>
        <p><b>{"Поставщик: "}</b> { object.ProducerAvatarId != undefined ?
                                    <a href={SITE+"navigator/"+object.ProducerAvatarId}>{object.ProducerName}</a> :
                                    object.ProducerName}
        </p>                              
        <p><a href={getProductLinks(object.ProductId).old}>старый Маркет</a></p>
        <p><a href={getProductLinks(object.ProductId).new}>новый Маркет</a></p>
        {category != [] &&
            <div className='contentList'>
               <p><b>Категория: </b></p> 
            <table>
            <tbody>
            {category.map((elem) => (
                <tr>
                    <td className="pic">
                        <a href={elem.address}>
                            {elem.Image == 1 ?
                                <img className='thankaPic' src={DIRPATH + "/image" + elem.ID + '.jpg?' + hash} width={50} />
                                :
                                <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                            }
                        </a>
                    </td>
                    <td className='tableName'>
                        <a href={SITE+'navigator/'+elem.ID}>{elem.ID + ": " + elem.Name}</a>
                    </td>
                </tr>
            ))}
            </tbody>
            </table>
            </div>
        }
    </>
    )
}

function CogObject(props) {
    const data = props.data || {};
    const auth = props.auth;
    const version = props.version || { data: null };

    const safeData = data || {};
    const object = safeData.Object || {};
    const thanka = safeData.Thanka || {};
    const request = safeData.Request || {};
    const sectorLink = safeData.SectorLink || {};
    
    let type = object.Type;

    let location = '';
    if (Array.isArray(data.LocationEvent)) {
        for (let i = 0; i < Math.min(data.LocationEvent.length, 3); i++) {
            location += (data.LocationEvent[i]?.Name || '') + ', ';
        }
        if (location.endsWith(', ')) {
            location = location.slice(0, -2);
        }
    }

    let elements = []
    let links = [];
    let arr = [];
    if (data.Content != null && (type == 'catalog' || type == 'category')) {
        arr = data.Content.slice();
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Type == "element") {
                elements.push(arr[i]);
            } else {
                links.push(arr[i]);
            }
        }
    }

    const [elementView, setElementView] = useState({display: 'none'});
    const [elementbutton, setElementButton] = useState(true);

    function hideElements(e) {
        setElementView({display: 'none'});
        setElementButton(true)
    }

    function showElements(e) {
        setElementView({display: 'block'});
        setElementButton(false)
    }

    return ( 
        <>
        {type == 'cabinet' && 
        <>
            <div className='personal'>
                <p><b>Дата регистрации:</b> {normalDateSlash(object.RegDate)}</p>
                <p><b>Логин:</b> {object.Login}</p>
                <p><b>Дата рождения:</b> {normalDateSlash(object.BirthDate)}</p>
                <p><b>Имя:</b> {object.Name}</p>
                <p><b>Адрес:</b> {object.Address}</p>
                <p><b>Электронная почта:</b> {object.Email}</p>
                <p><b>Телефон:</b> {object.TelephoneNumber}</p>
            </div>
            <h4>Мои сайты: </h4>
                <ContentList 
                    content={data.SiteList} 
                    privacy = {data.PrivacyLevel} 
                    mainId = {data.Id} 
                    type = {"sitelist"} 
                    hash = {data.Hash}
                />
        </>
        }
        {type == 'avatar' && 
            <div className='personal'>
                { object.Name != "" && object.Name != undefined &&
                    <p><b>Имя: </b>{object.Name}</p>
                }
                { object.BirthDate != "" && object.BirthDate != undefined &&
                    <p><b>Дата рождения: </b>{DateForEditor(object.BirthDate)}</p>
                }
                { object.Email != "" && object.Email != undefined &&
                    <p><b>Электронная почта: </b>{object.Email}</p>
                }
                { object.TelephoneNumber != "" && object.TelephoneNumber != undefined &&
                    <p><b>Телефон: </b>{object.TelephoneNumber}</p>
                }
                {(!safeData.SectorLink || Object.keys(sectorLink).length === 0) &&
                <>
                    <h4>Тханки этого автора: </h4>
                    <ContentList content={data.MyThankaList} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"avatar"} hash = {data.Hash}/>
                    {data.PrivacyLevel == 6 && 
                    <>
                        <h4>Мои подписки: </h4>
                        <ContentList 
                            content={data.MySubscribeList} 
                            privacy = {data.PrivacyLevel} 
                            mainId = {data.Id} 
                            type = {"avatar"} 
                            hash = {data.Hash}
                        />
                    </>
                    }
                </>
                }
            </div>
        }
        {type == 'catalog' && 
            <>
                <h4>Добавлено вручную: </h4>
                <ContentList content={links} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"catalog"} hash = {data.Hash}/>
                <h4>Добавлено через углы: </h4>
                <ContentList content={elements} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"catalog"} style = {elementView} hash = {data.Hash}/>
                {elements.length !== 0 && (elementbutton ?
                <button className='seeAllButt' onClick = {showElements.bind(this)}>Показать</button>
                :
                <button className='seeAllButt' onClick = {hideElements.bind(this)}>Скрыть</button>
                )}  
            </>
        }
        {type == 'category' && 
            <>
                <ContentList content={links} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"catalog"} hash = {data.Hash}/>
            </>
        }
        {type == 'collection' && 
            <ContentList content={data.Content} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"collection"} hash = {data.Hash}/>
        }
        {type == 'hashtag' && 
            <ContentList content={data.Content} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"hashtags"} hash = {data.Hash}/>
        }
        {type == 'article' && version.data == null &&
            <>   
                <p dangerouslySetInnerHTML={{__html: object.Description}}/>
                {(object.Filename != null && object.Filename != undefined && object.Filename != "") && 
                <iframe src = {DIRPATH+"/pdf/"+object.Filename} width={'100%'} height={"700"}/>
                }
                <div className='personal'>
                    <p><b>Дата события: </b>{DateForEditor(object.DateEvent)}</p>
                    <p><b>Место события: </b>{location}</p>
                    {object.RealAuthor != "" && object.RealAuthor != undefined &&
                    <p><b>Автор: </b>{object.RealAuthor}</p>
                    }
                    {object.URL != "" && object.URL != undefined &&
                    <p><b>Источник: </b>{object.URL}</p>
                    }
                </div>
            </>
        }
        {type == 'repost' &&
            <p dangerouslySetInnerHTML={{__html: object.Description}}/>
        }
        {type == 'document' &&
            <>
                <p dangerouslySetInnerHTML={{__html: object.Description}}/>
                {object.RealAuthor != "" && object.RealAuthor != undefined &&
                    <p><b>Автор: </b>{object.RealAuthor}</p>
                    }
                    {object.URL != "" && object.URL != undefined &&
                    <p><b>Источник: </b>{object.URL}</p>
                    }
                <h3>Содержание:</h3>
                <ContentList content={data.Children} privacy = {data.PrivacyLevel} mainId = {data.Id} type = {"document"} hash = {data.Hash}/>
            </>
        }
        { type == 'request' &&
            <RequestViewer content = {data.Content} request = {request} hash = {data.Hash}/>
        }
        { type == 'product' &&
            <ProductViewer object = {object} links = {data.LinksFrom}/>
        }
        { type == 'site' &&
            <>
            {
                data.SiteList != null && data.SiteList[0] != undefined &&
                <p>Эта тханка является <a href = {SITE+'sitepage/'+data.SiteList[0].ID}>страницей сайта</a></p>
            }
            </>
        }
        { version.data != null &&
            <VersionViewer />
        }
        { data.PrivacyLevel == 6 && version.data == null && object.VersionStamp != true && 
          (object.Type == "article" || object.Type == "document" || object.Type == 'avatar') && sectorLink == undefined &&
            <div id="cogobj_buttons">
                {
                    <button id="cogEdit" onClick = {() => props.setState("edit")}>
                        Редактировать {data.Accusativus}
                    </button>
                }
            </div>
        }
    </>
    );
}

function VersionViewer(props) {

    const data = useTypedSelector((state) => state.ThankaReducer.Version.data);
    
    let location = '';
    if (data.LocationEvent != null) {
        for (let i = 0; i < 3; i++) {
            location += data.LocationEvent[i].Name + ', ';
        }
    }

    const [state, setState] = useState("none");
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    function setMain() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: object.VersionID, method: "setMain"},
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            setMessage("Установлено");
        }).catch((error) => {
            setMessage("Ошибка");
        })
    }
   
    function stampVersion() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: object.VersionID, method: "stampVersion"},
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            setSystemMessageText("Установлено");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

    return (
        <div className='version'>
            {state == "none" &&
            <>
                <p className='versionmessage'>Версия от {object.VersionDate}</p>
                <p dangerouslySetInnerHTML={{__html: object.Description}}/>
                <p><b>Дата события: </b>{DateForEditor(object.DateEvent)}</p>
                <p><b>Место события: </b>{location}</p>
                <p><b>Автор: </b>{object.RealAuthor}</p>
                <p><b>Источник: </b>{object.URL}</p>
                
                {object.VersionStamp != true &&
                <>
                    <button onClick = {() => setState("edit")}>Редактировать версию</button>
                    <button onClick = {setMain}>Сделать главной</button>
                    <button onClick = {stampVersion}>Запечатать версию</button>
                </>
                }
            </>
            }
            {state == "edit" &&
                <VersionEditor data = {data} setState = {setState}/>
            }
            <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </div>
    );
}

function VersionEditor(props) {

    const {data, type, setState} = props

    const { getVersion } = useActions();
    
    const descriptionRef = useRef(object.Description);
    let today = new Date();
    today = today.getFullYear()+"-"+today.getMonth()+"-"+today.getDate();

    const [selectedDateEvent, setSelectedDateEvent] = useState(
        object.DateEvent != null && 
        object.DateEvent != undefined &&
        object.DateEvent != "" ? DateForEditor(object.DateEvent) : DateForEditor(today));

    const [selectedLocation, setSelectedLocation] = useState(
        data.LocationEvent !== undefined &&
        data.LocationEvent !== null &&  
        type == 'edit' &&
        data.LocationEvent[2] !== null &&
        data.LocationEvent[2] !== undefined ? 
        data.LocationEvent[2].ID : "1"
    );

    const [realAuthor, setRealAuthor] = useState(object.RealAuthor);
    const [url, setURL] = useState(object.URL);
 
    let dataToEditor = {};
    dataToEditor.Object = {};

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const Save = (e) => {
        e.preventDefault();

        dataToEditor.Id = object.VersionID;
        dataToEditor.EditorType = "version";

        dataToEditor.Object.Description = (
            descriptionRef.current.value !== undefined ? 
            descriptionRef.current.value : 
            descriptionRef.current
        );
        dataToEditor.Object.DateEvent = selectedDateEvent;
        dataToEditor.LocationEvent = selectedLocation;
        dataToEditor.Object.RealAuthor = realAuthor
        dataToEditor.Object.URL = url
    
        axios({
            method: "post",
            url: PATH + "thanka/setThanka.php",
            //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
            headers: { "content-type": "multipart/form-data" },
            data: dataToEditor,
        }).then((result) => {
            setState("none");
            getVersionFunc(object.VersionID);
            setSystemMessageText("Успешно");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    };

    function getVersionFunc(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: id, method: "getVersion"},
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            getVersion(result.data);
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

 /*   const SaveNewVersion = (e) => {
        e.preventDefault();

        dataToEditor.Id = data.Id;


        if (type == "article") {
            dataToEditor.Object.Description = (
                descriptionRef.current.value !== undefined ? 
                descriptionRef.current.value : 
                descriptionRef.current
            );
            dataToEditor.Object.DateEvent = selectedDateEvent;
            dataToEditor.LocationEvent = selectedLocation;
        }

        axios({
            method: "post",
            url: PATH + "versions/setNewVersion.php",
            //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
            headers: { "content-type": "multipart/form-data" },
            data: dataToEditor,
        }).then((result) => {
            setState("none");
            getVersionFunc(object.VersionID);
            setSystemMessage("Успешно");
        }).catch((error) => {
            setSystemMessage("Произошла ошибка");
        })
    };*/

    return ( 
        <>
            <CogObjectEditor
                selectedDateEvent = {selectedDateEvent} setSelectedDateEvent = {setSelectedDateEvent}
                selectedLocation = {selectedLocation} setSelectedLocation = {setSelectedLocation}
                selectedRealAuthor = {realAuthor} setSelectedRealAuthor = {setRealAuthor}
                selectedURL = {url} setSelectedURL = {setURL}
                selectedType = {"article"} data = {data} type = {"edit"}
                descriptionRef = {descriptionRef}
            />
        {
            <>
                <button onClick = {Save}>Сохранить версию</button>
                <button onClick={() => setState("none")}>Отменить</button>
            </> 
        }
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    );
}

export default CogObject;
