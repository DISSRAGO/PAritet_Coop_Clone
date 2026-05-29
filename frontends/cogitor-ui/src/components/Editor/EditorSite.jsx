import React, { useState, useRef, useEffect } from "react";
import { createBrowserHistory } from "history";
import axios from "axios";
import { PATH, DIRPATH } from "../../utils/url.js";
import TextEditorJD from "../TextEditor/Jodit.jsx"
import "../../style/thanka.css";

import { TrueDateForEditor } from "../../utils/language_ru.js";

const history = createBrowserHistory();

import { CustomURL } from "./EditorComponent.jsx";

import CogObjectEditor from "./CogObjEditor.jsx";
import { RequestEditor } from "./RequestEditor.jsx"
import { SystemMessage } from "../Viewer/SystemMessage.jsx";
import { SimpleTableList, SimpleProductList } from "../Table/TableList.jsx";
import { ThankaPic } from "./PrivacySettings.jsx";

//ЕСЛИ НЕ ДЕЛАТЬ РАЗДЕЛЕНИЕ ПО create/edit, БУДУТ ПОДСТАВЛЯТЬСЯ ДАННЫЕ ТЕКУЩЕЙ ТХАНКИ
function GetTypeByParentType(objType) {

    let type = "article";

    if (objType == "cabinet") type = "avatar";
    if (objType == "collection") type = "collection";

    return type;
}

function AvatarList(props) {

    const { list, authorId, setSelectedAuthor } = props;

    return (
        <>
            <p>Аватар:</p>
            <select onChange={(e) => setSelectedAuthor(e.target.value)}>
                {list != null && list != undefined && list.map((avatar) => (
                    <option value={avatar.ID} selected={avatar.ID == authorId ? 'selected' : ""} >{avatar.Name}</option>
                ))}
            </select>
        </>
    )
}

function PrivacySettins(props) {

    const {selectedPrivacy, setSelectedPrivacy,
            selectedChild, setSelectedChild,
            selectedComments, setSelectedComments,
            selectedType, data, selectedCircles, selectedSectors, selectedAngles,
            setSelectedCircles, setSelectedSectors, setSelectedAngles,
            type, elemArr, setSelectedElements, setSelectedPictureSend,
            setPicCoord, selectedPicCoord
        } = props

    const onChangePrivacy = (e) => {
        setSelectedPrivacy(e.target.value);
        if (e.target.value == 2) {
            setSelectedChild(0);
            setSelectedComments(0);
        }
    }

    return (
    <>
        <ThankaPic 
            setSelectedPictureSend = {setSelectedPictureSend} 
            setPicCoord = {setPicCoord} 
            selectedPicCoord = {selectedPicCoord}
            dataId = {data.Id}
            dataHash = {data.Hash}
            dataCenterImage = {data.CenterImage}
            type = {type}
        />

        <p>Кто может просматривать тханку:</p>
        <p className="privacy-label"><label><input type = "radio" name = "privacy" value={0} onChange={onChangePrivacy} checked={selectedPrivacy == 0}/>Все</label></p>
        <p className="privacy-label"><label><input type = "radio" name = "privacy" value={1} onChange={onChangePrivacy} checked={selectedPrivacy == 1}/>Только авторизованные пользователи</label></p>
        <p className="privacy-label"><label><input type = "radio" name = "privacy" value={2} onChange={onChangePrivacy} checked={selectedPrivacy == 2}/>Только я</label></p>
        <p className="privacy-label"><label><input type = "radio" name = "privacy" value={3} onChange={onChangePrivacy} checked={selectedPrivacy == 3}/>Только подписчики</label></p>
            
        <label>
            <input
                defaultValue={selectedComments}
                type={"checkbox"}
                onChange={(e) => setSelectedComments(Number(e.target.checked))}
                checked={selectedComments}
            />Добавить блок комментариев
        </label>  
    </>
    )
}

//хорошо бы тебя расписать по маленьким кусочкам
function EditorSite(props) {

    let data = props.data.data;
    let auth = props.auth.data;
    const { type } = props

    let dataToEditor = {};
    dataToEditor.Thanka = {};
    dataToEditor.Object = {};

    //сообщения об ошибках
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    //управляемые компоненты, вкусненько
    //Картинка. Новая, если создание или ее не было, существующая - если редактирование, и она есть
    const [selectedPictureSend, setSelectedPictureSend] = useState(null);
    const [selectedPicCoord, setPicCoord] = useState({ left: null, top: null, width: null, height: null });

    //аннотация
    const annotationRef = useRef(type == 'editsite' ? data.Thanka.Annotation : '');

    //выбор типа. Тут массив, поэтому такие огороды нагорожены, иначе не отправляет.
    const [selectedType, setSelectedType] = useState(type == 'editsite' ? (data.SectorLink != undefined && data.Object.Type != "repost" ? "link" : data.Object.Type) : GetTypeByParentType(data.Object.Type));

    //имя тханки, с ним все понятно: редактирование - старое, создание - пустое.
    const nameref = useRef(type == 'editsite' ? data.Thanka.Name : '');

    //количество секторов, все понятно
    const [selectedSectors, setSelectedSectors] = useState(type == 'editsite' ? data.Thanka.SectorsNum : 12);

    //количество кружочков, тоже все понятно
    const [selectedCircles, setSelectedCircles] = useState(type == 'editsite' ? data.Thanka.CirclesNum : 1);

    //TODO
    const [selectedAuthor, setSelectedAuthor] = useState(type == 'editsite' ? data.Thanka.Author :
        (data.Object.Type == 'avatar' ? data.Id : data.Thanka.Author));

    //прайваси. Тут одно для всех, поэтому такая простая инициализация. Или нет
    const [selectedPrivacy, setSelectedPrivacy] = useState(type == 'editsite' ? data.Thanka.Privacy : 0);

    //могут ли другие пользователи создавать потомков
    const [selectedChild, setSelectedChild] = useState(type == 'editsite' ? data.Thanka.OthersMakeChildren : Number(true));
    const [selectedComments, setSelectedComments] = useState(type == 'editsite' ? data.Thanka.Comments : Number(true));
    const [selectedAngles, setSelectedAngles] = useState(type == 'editsite' ? Number(data.Thanka.VisibleElements) : Number(false));

    //статейные дела
    let today = new Date();
    today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

    const [selectedDateEvent, setSelectedDateEvent] = useState(
        data.Object.DateEvent != null &&
            data.Object.DateEvent != undefined &&
            data.Object.DateEvent != "" ? TrueDateForEditor(data.Object.DateEvent) : today);

    const [selectedLocation, setSelectedLocation] = useState(
        data.LocationEvent !== undefined &&
            data.LocationEvent !== null &&
            type == 'editsite' &&
            data.LocationEvent[2] !== null &&
            data.LocationEvent[2] !== undefined ?
            data.LocationEvent[2].ID : "1"
    );

    //Аватарные дела
    const avatarNameref = useRef(type == 'editsite' ? data.Object.Name : '');

    const [params, setParams] = useState({})

    useEffect(() => {

        if (type != 'editsite' && data.AvatarList !== null && data.AvatarList !== undefined) {
            if (data.PrivacyLevel == 6) {
                if (data.Object && data.Object.Type == 'avatar') {
                    setSelectedAuthor(data.Id);
                } else if (data.Thanka) {
                    setSelectedAuthor(data.Thanka.Author)
                }
            } else if (Array.isArray(data.AvatarList) && data.AvatarList.length > 0) {
                setSelectedAuthor(data.AvatarList[0].ID);
            }
        }

        if (data.Elements != null) {
            let len = data.Elements.length;
            let elements = [];
            for (let i = 0; i < len; i++) {
                elements[i] = data.Elements[i].ID;
            }
            setElemArr(elements);
        }
    }, []);

    //стихии
    const [elemArr, setElemArr] = useState([]);
    const [selectedElements, setSelectedElements] = useState(elemArr);
    const [customURL, setCustomURL] = useState(type == 'editsite' ? data.CustomURL : '')

    //отправляем
    function FormSubmittionHandler(buttonType) {

        dataToEditor.EditorType = type == 'editsite' ? 'edit' : type;
        dataToEditor.UserId = auth.id;
        dataToEditor.UserLogin = auth.login;

        dataToEditor.Thanka.CustomURL = customURL

        dataToEditor.Id = (type == 'createsite' ? '' : data.Thanka.Id);
        dataToEditor.SitePageId = (type == 'createsite' ? '' : data.Id);
        if (type == 'createsite' && data.Id != "") {
            dataToEditor.ParentId = data.Id;
            dataToEditor.ThankaParentId = data.Thanka.Id
        }
        if (type == 'createsite' && data.Id == "") {
            dataToEditor.ParentId = selectedAuthor;
        }

        dataToEditor.Picture = selectedPictureSend;
        dataToEditor.PictureCoords = selectedPicCoord;

        dataToEditor.Thanka.Privacy = selectedPrivacy;
        dataToEditor.Thanka.Comments = selectedComments;
       
        dataToEditor.Thanka.Author = selectedAuthor;
        dataToEditor.Thanka.Name = (nameref.current.value !== undefined ? nameref.current.value : nameref.current);
        if (dataToEditor.Thanka.Name == "") {
            setSystemMessageText("Введите название тханки");
            setSystemMessageStatus("warning")
        }

        dataToEditor.Thanka.Annotation = (
            annotationRef.current.value !== undefined ?
                annotationRef.current.value :
                annotationRef.current
        );

        dataToEditor.Object.Type = 'site';

        if (dataToEditor.Thanka.Name != "" && checkedURL) {
            axios({
                method: "post",
                url: PATH + "thanka/setThanka.php",
                //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
                headers: { "content-type": "multipart/form-data" },
                data: dataToEditor,
            }).then((result) => {
                if (result.data != null) {
                    let standartURL = type == 'createsite' ? "/sitepage/" + result.data.SitePageId : "/sitepage/" + data.Id
                    window.location.assign(customURL != "" ? '/' + customURL : standartURL);
                }
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            })
        } else {
            if (dataToEditor.Thanka.Name == "") {
                setSystemMessageText("Введите название");
                setSystemMessageStatus("error")
            }
            if (!checkedURL) {
                setSystemMessageText("Проверьте введенный адрес страницы");
                setSystemMessageStatus("error")
            }
        }
    }
    const [checkedURL, setCheckedURL] = useState(true)
    //type = {type} это про то, какой редактор вызывается - создания или редактирования
    //cogType - про тип когобъекта
    return (
        <>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            <div className="editorHeader">
                {data.Id != "" && data.Id !== undefined && (
                    <h2>
                        {type == "editsite"
                            ? "Редактирование сайта"
                            : "Создание сайта"
                        }
                    </h2>
                )}
            </div>
            <section className="lil-container">
                <h3>Настройки содержимого</h3>
                <>
                    <p>Заголовок: </p>
                    <input onChange={(e) => nameref.current = e.target.value}
                        defaultValue={type == 'editsite' ? data.Thanka.Name : ''}
                        refs={nameref}
                    />

                    {data.AvatarList !== null && (
                        <AvatarList
                            list={data.AvatarList}
                            authorId={selectedAuthor}
                            setSelectedAuthor={setSelectedAuthor}
                        />
                    )}

                    <p>Приветственное слово:</p>
                    <TextEditorJD
                        refs={annotationRef}
                        onChange={(e) => { annotationRef.current = e }}
                        defaultValue={type == 'editsite' ? data.Thanka.Annotation : ''}
                    />
                </>
            </section>

            <section className="lil-container">
                <h3>Настройки отображения</h3>
                <CustomURL 
                    customURL = {customURL} 
                    setCustomURL = {setCustomURL} 
                    checkedURL = {checkedURL} 
                    setCheckedURL = {setCheckedURL}
                    defaultURL = {data.CustomURL}
                />
                {<PrivacySettins
                    selectedPrivacy={selectedPrivacy} setSelectedPrivacy={setSelectedPrivacy}
                    selectedChild={selectedChild} setSelectedChild={setSelectedChild}
                    selectedComments={selectedComments} setSelectedComments={setSelectedComments}
                    selectedCircles={selectedCircles} setSelectedCircles={setSelectedCircles}
                    selectedAngles={selectedAngles} setSelectedAngles={setSelectedAngles}
                    selectedSectors={selectedSectors} setSelectedSectors={setSelectedSectors}
                    selectedType={selectedType} type={type}
                    elemArr={elemArr} setSelectedElements={setSelectedElements}
                    data={data}
                    setSelectedPictureSend={setSelectedPictureSend}
                    setPicCoord={setPicCoord}
                    selectedPicCoord={selectedPicCoord}
                />
              }  
            </section>
                
            <div className="editorButtons">
                <button type="submit" onClick={() => FormSubmittionHandler("create")}> Сохранить </button>
                <button onClick={(e) => history.back()}> Отменить </button>
            </div>
        </>
    );
}

export default EditorSite
