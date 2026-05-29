import React, { useState, useRef, useEffect } from "react";
import { createBrowserHistory } from "history";
import axios from "axios";
import { PATH, DIRPATH, SITE } from "../../utils/url.js";
import TextEditorJD from "../../components/TextEditor/Jodit.jsx"
import "../../style/thanka.css";

import { PrivacySettins } from "./PrivacySettings.jsx";

import { TrueDateForEditor } from "../../utils/language_ru.js";

const history = createBrowserHistory();

import CogObjectEditor from "./CogObjEditor.jsx";
import { RequestEditor } from "./RequestEditor.jsx"
import { SystemMessage } from "../Viewer/SystemMessage.jsx";
import { SimpleTableList, SimpleProductList } from "../Table/TableList.jsx";

//ЕСЛИ НЕ ДЕЛАТЬ РАЗДЕЛЕНИЕ ПО create/edit, БУДУТ ПОДСТАВЛЯТЬСЯ ДАННЫЕ ТЕКУЩЕЙ ТХАНКИ
function GetTypeByParentType(objType) {

    let type = "article";

    if (objType == "cabinet") type = "avatar";
    if (objType == "collection") type = "collection";

    return type;
}

function SelecterType(props) {

    let TypeName = "";

    const { defaultValue, parentType, type, setSelectedType } = props;

    switch (defaultValue) {
        case "article": { TypeName = "Статья"; break; }
        case "avatar": { TypeName = "Аватар"; break; }
        case "collection": { TypeName = "Коллекция"; break; }
        case "catalog": { TypeName = "Каталог"; break; }
        case "cabinet": { TypeName = "Кабинет"; break; }
        case "document": { TypeName = "Документ"; break; }
        case "hashtag": { TypeName = "Хэштег"; break; }
        case "request": { TypeName = "Бот"; break; }
        case "link": { TypeName = (type == "add" ? "Ссылка на текущую тханку" : "Ссылка"); break; }
        case "repost": { TypeName = (type == "add" ? "Репост на текущую тханку" : "Репост"); break; }
        case "product": { TypeName = "Товар"; break; }
        case "site": { TypeName = "Сайт"; break; }
    }

    let defaultOption = { value: defaultValue, text: TypeName, selected: true };
    let optionAvatar = { value: "avatar", text: "Аватар", selected: false };
    let optionArticle = { value: "article", text: "Статья", selected: false };
    let optionCatalog = { value: "catalog", text: "Каталог", selected: false };
    let optionCollection = { value: "collection", text: "Коллекция", selected: false };
    let optionDocument = { value: "document", text: "Документ", selected: false };
    let optionRequest = { value: "request", text: "Бот", selected: false };
    let optionRepost = { value: "repost", text: type === "add" ? "Репост на текущую тханку" : "Репост", selected: false };
    let linkRequest = { value: "link", text: type === "add" ? "Ссылка на текущую тханку" : "Ссылка", selected: false };
    let productRequest = { value: "product", text: "Товар", selected: false };
    //let optionSite = { value: "site", text: "Сайт", selected: false };

    let nonSpecialOptions = [
        optionArticle,
        optionDocument,
        optionCatalog,
        optionCollection,
        optionRequest,
        linkRequest,
        productRequest,
        //optionSite
    ]

    let options = []

    if (type == 'edit') {
        options.push(defaultOption);
    }
    else if (type === 'create') {
        if (parentType === 'cabinet') {
            options.push(optionAvatar)
        }
        options = options.concat(nonSpecialOptions)
    }
    else if (type === "add") {
        options.push(optionArticle)
        options.push(optionDocument)
        if (parentType != 'cabinet') {
            options.push(linkRequest)
        }
        if (parentType == 'article' || parentType == 'document') {
            options.push(optionRepost)
        }
    }

    return (
        <>
            <p>Тип:</p>
            <select onChange={(e) => setSelectedType(e.target.value)} disabled={type == 'edit' ? "disabled" : ""}>
                {options.map((op) => (
                    <option value={op.value} defaultValue={op.selected ? op.value : ""}>{op.text}</option>
                ))}
            </select>
        </>
    );
}

function AvatarList(props) {

    const { list, authorId, setSelectedAuthor } = props;

    return (
        <>
            <p>Аватар:</p>
            <select onChange={(e) => setSelectedAuthor(e.target.value)}>
                {list.map((avatar) => (
                    <option value={avatar.ID} selected={avatar.ID == authorId ? 'selected' : ""} >{avatar.Name}</option>
                ))}
            </select>
        </>
    )
}

export function CustomURL(props) {

    const { customURL, setCustomURL, type, checkedURL, setCheckedURL, defaultURL } = props

    //const [url, setUrl] = useState("")
    const [error, showError] = useState(false)
    const [errorText, setErrorText] = useState("Недопустимые символы")
    const regexp = /[aA-zZ0-9\-\_]+/

    const onChangeUrl = (e) => {
        setErrorText("Недопустимые символы")
        //условия посмотреть, не работает на изначально плохих строках
        let reg = e.target.value != "" && regexp.exec(e.target.value) != null ? regexp.exec(e.target.value) : null
        setCustomURL(e.target.value)
        if ((e.target.value != "" && reg == null) || (reg != null && reg[0] != reg['input'])) {
            showError(true)
        } 
        else if ((e.target.value == "") || (reg != null && e.target.value != "" && reg[0] == reg['input'])) {
            showError(false)
        }  
        if (defaultURL != e.target.value) {
            setCheckedURL(false) 
        }
    }

    function checkURL() {
        if (customURL != defaultURL) {
            axios({
                method: "post",
                url: PATH + 'thanka/thanka.php',
                headers: { "content-type": "multipart/form-data" },
                data: { method: "checkCustomURL", url: (type == 'avatar' ? '@' + customURL.toLowerCase() : customURL.toLowerCase())},
            }).then((result) => {
                if (result.data.result) {
                    setErrorText("Данный адрес уже занят")
                    showError(true)
                } else {
                    setErrorText("Данный адрес можно использовать")
                    showError(true)
                    setCheckedURL(true)
                }
            }).catch((error) => {
            })
        } else {
            setErrorText("Текущий адрес")
            showError(true)
            setCheckedURL(true)
        }
    }

    return(
        <>
        <p>Введите желаемый URL-адрес:</p>
        <input /*defaultValue={url}*/ onChange={onChangeUrl} value = {customURL}/>
        {error && <p>{errorText}</p>}
        <button  onClick = {(e) => checkURL()} disabled = {error || customURL == ""}>Проверить</button>
        <button onClick = {(e) => {setCustomURL(""); setErrorText(""); setCheckedURL(true)}}>Удалить</button>
        <p>Полный URL-адрес страницы будет выглядеть:<input readOnly value={type == 'avatar' ? SITE+'@'+customURL : SITE+customURL}/></p>
        </>
    )
}

function ThankaLinkEditor(props) {

    const { thankaLink, setThankaLink } = props

    const [thankaList, setThankaList] = useState([])
    const [hash, setHash] = useState()

    const [searchVisible, setSearchVisible] = useState(false)

    function getAllThanka() {
        setSearchVisible(true)
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: { method: "getAllThankas", type: "link" },
        }).then((result) => {
            setThankaList(typeof result.data.List == 'object' ? Object.values(result.data.List) : result.data.List)
            setHash(result.data.Hash)
        }).catch((error) => {
        })
    }

    return (
        <>
            <p>Введите номер тханки:</p>
            <input type="text" defaultValue={thankaLink} onChange={(e) => setThankaLink(e.target.value)} />
            <button onClick={() => getAllThanka()}>Открыть список тханок</button>
            {searchVisible &&
                <SimpleTableList list={thankaList} hash={hash} />
            }
        </>
    )
}

function ProductEditor(props) {

    const { productLink, setProductLink, setProductCategory } = props

    const [productList, setProductList] = useState([])
    const [hash, setHash] = useState()

    const [searchVisible, setSearchVisible] = useState(false)

    function getGoodsList() {
        setSearchVisible(true)
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: { method: "getGoodsList"},
        }).then((result) => {
            setProductList(typeof result.data == 'object' ? Object.values(result.data) : result.data)
            setHash(result.data.Hash)
        }).catch((error) => {
        })
    }

    return (
        <>
            <p>Выберите товар в списке:</p>
            <input type="text" defaultValue={productLink} onChange={(e) => setProductLink(e.target.value)} value={productLink} readOnly/>
            <button onClick={() => getGoodsList()}>Открыть список товаров</button>
            {searchVisible &&
                <SimpleProductList list={productList} hash={hash} setProductLink= {setProductLink} setProductCategory = {setProductCategory} productLink = {productLink}/>
            }
        </>
    )
}

//хорошо бы тебя расписать по маленьким кусочкам
function EditorInner(props) {

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
    const annotationRef = useRef(type == 'edit' ? data.Thanka.Annotation : '');

    //выбор типа. Тут массив, поэтому такие огороды нагорожены, иначе не отправляет.
    const [selectedType, setSelectedType] = useState(type == 'edit' ? (data.SectorLink != undefined && data.Object.Type != "repost" ? "link" : data.Object.Type) : GetTypeByParentType(data.Object.Type));

    //имя тханки, с ним все понятно: редактирование - старое, создание - пустое.
    const nameref = useRef(type == 'edit' ? data.Thanka.Name : '');

    //количество секторов, все понятно
    const [selectedSectors, setSelectedSectors] = useState(type == 'edit' ? data.Thanka.SectorsNum : 12);

    //количество кружочков, тоже все понятно
    const [selectedCircles, setSelectedCircles] = useState(type == 'edit' ? data.Thanka.CirclesNum : 1);

    //Содержимое
    const descriptionRef = useRef(type == 'edit' ? data.Object.Description : '');

    //TODO
    const [selectedAuthor, setSelectedAuthor] = useState(type == 'edit' ? data.Thanka.Author :
        (data.Object.Type == 'avatar' ? data.Id : data.Thanka.Author));

    //прайваси. Тут одно для всех, поэтому такая простая инициализация. Или нет
    const [selectedPrivacy, setSelectedPrivacy] = useState(type == 'edit' ? data.Thanka.Privacy : 0);

    //могут ли другие пользователи создавать потомков
    const [selectedChild, setSelectedChild] = useState(type == 'edit' ? data.Thanka.OthersMakeChildren : Number(true));
    const [selectedComments, setSelectedComments] = useState(type == 'edit' ? data.Thanka.Comments : Number(true));
    const [selectedAngles, setSelectedAngles] = useState(type == 'edit' ? Number(data.Thanka.VisibleElements) : Number(false));

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
            type == 'edit' &&
            data.LocationEvent[2] !== null &&
            data.LocationEvent[2] !== undefined ?
            data.LocationEvent[2].ID : "1"
    );
    const [selectedPDF, setSelectedPDF] = useState(type == 'edit' ? data.Object.Filename : "");
    const [selectedRealAuthor, setSelectedRealAuthor] = useState(type == 'edit' ? data.Object.RealAuthor : '');
    const [selectedURL, setSelectedURL] = useState(type == 'edit' ? data.Object.URL : '');
    const [birthDate, setBirthDate] = useState(type == 'edit' ? data.Object.BirthDate : '');
    const [telNumber, setTelNumber] = useState(type == 'edit' ? data.Object.TelephoneNumber : '');
    const [email, setEmail] = useState(type == 'edit' ? data.Object.Email : '');

    const [thankaLink, setThankaLink] = useState(type == 'edit' && data.SectorLink != undefined && data.SectorLink != null ? data.SectorLink.ID : '')
    const [productLink, setProductLink] = useState(type == 'edit' ? data.Object.ProductId : "")
    const [productCategory, setProductCategory] = useState({id: "", name: ""})

    //Аватарные дела
    const avatarNameref = useRef(type == 'edit' ? data.Object.Name : '');

    const [params, setParams] = useState({})

    const [customURL, setCustomURL] = useState(type == 'edit' ? data.CustomURL : '')
    const [checkedURL, setCheckedURL] = useState(true)

    useEffect(() => {

        if (type != 'edit' && data.AvatarList !== null && data.AvatarList !== undefined) {
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

        if (selectedType == 'avatar' && type == 'edit') {
            setCustomURL(data.CustomURL.substr(1))
        }

    }, []);

    //стихии
    const [elemArr, setElemArr] = useState([]);
    const [selectedElements, setSelectedElements] = useState(elemArr);

    function addLink(from, to) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: { from: from, to: to, method: "addLink" },
        }).then((result) => {
            //setMessage("Ссылка создана");
        }).catch((error) => {
            //setMessage("Ошибка");
        })
    }

    //отправляем
    function FormSubmittionHandler(buttonType) {

        dataToEditor.EditorType = props.type;
        dataToEditor.UserId = auth.id;
        dataToEditor.UserLogin = auth.login;

        dataToEditor.Thanka.CustomURL = selectedType == 'avatar' && customURL != "" ? '@'+customURL : customURL

        dataToEditor.Id = (type == 'create' || type == 'add' ? '' : data.Id);
        if (buttonType == 'create') {
            dataToEditor.ParentId = data.Id;
            dataToEditor.ParentType = data.SectorLink != undefined ? "link" : data.Object.Type;
        }
        if (buttonType == 'add') {
            dataToEditor.ParentId = selectedAuthor;
        }

        dataToEditor.Angles = selectedAngles;
        if (selectedElements.length < 4) {
            let elements = selectedElements;
            for (let i = 0; i < 4 - elements.length; i++) {
                elements.push("");
            }
            setSelectedElements(elements)
        }
        dataToEditor.Elements = selectedElements.join(';');
        dataToEditor.Picture = selectedPictureSend;
        dataToEditor.PictureCoords = selectedPicCoord;

        dataToEditor.Thanka.Privacy = selectedPrivacy;
        if (type != "edit") {
            if (data.Children != null) {
                dataToEditor.Thanka.Sort = data.Children.length + 1;
            } else {
                dataToEditor.Thanka.Sort = 1
            }
        }
        dataToEditor.Thanka.OthersMakeChildren = selectedType == "cabinet" ? 0 : selectedChild;
        dataToEditor.Thanka.Comments = selectedType == "cabinet" ? 0 : selectedComments;
        dataToEditor.Thanka.VisibleElements = selectedAngles
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

        dataToEditor.Thanka.CirclesNum = selectedCircles;
        dataToEditor.Thanka.SectorsNum = selectedSectors;

        dataToEditor.Object.Type = selectedType != "" ? selectedType : data.Object.Type;
        if (selectedType == "article") {
            dataToEditor.Object.DateEvent = selectedDateEvent;
            dataToEditor.LocationEvent = selectedLocation;
            dataToEditor.Object.Filename = selectedPDF;
        }

        if (selectedType == "document" || selectedType == "article") {
            dataToEditor.Object.RealAuthor = selectedRealAuthor;
            dataToEditor.Object.URL = selectedURL;
            dataToEditor.Object.Description = (
                descriptionRef.current.value !== undefined ?
                    descriptionRef.current.value :
                    descriptionRef.current
            );
        }

        if (selectedType == "avatar") {
            dataToEditor.Object.BirthDate = birthDate;
            dataToEditor.Object.TelephoneNumber = telNumber;
            dataToEditor.Object.Email = email;
            dataToEditor.Object.Name = (
                avatarNameref.current.value !== undefined ?
                    avatarNameref.current.value :
                    avatarNameref.current
            );
        }

        if (selectedType == "request") {
            dataToEditor.Request = {}

            dataToEditor.Request.Fields = params.fieldArr != undefined ? params.fieldArr.join(",") : ""
            dataToEditor.Request.Picture = params.picture

            dataToEditor.Request.Categories = params.category

            dataToEditor.Request.SortOrder = params.sortOrder
            dataToEditor.Request.SortField = params.sortField
            dataToEditor.Request.StartDate = params.startDate
            dataToEditor.Request.EndDate = params.endDate
            dataToEditor.Request.QueryName = params.template
            dataToEditor.Request.SpecialProps = params.specialProps

            //поисковые строчки
            let search = []
            if (params.searchName != "") search.push(params.searchName)
            dataToEditor.Request.SearchString = search.join(";")
        }

        if (selectedType == "link" || selectedType == "repost") {
            if (type != "add") {
                dataToEditor.Thanka.ThankaLink = thankaLink
            } else {
                dataToEditor.Thanka.ThankaLink = data.Id
            }
        }

        if (selectedType == "product") {
            if (productLink != "") {
                dataToEditor.Object.ProductId = productLink
                dataToEditor.Object.CategoryId = productCategory.id
                dataToEditor.Object.CategoryName = productCategory.name
            } else {
                setSystemMessageText("Выберите товар");
                setSystemMessageStatus("error")
            }
        }

        if (dataToEditor.Thanka.Name != "" && checkedURL) {
            axios({
                method: "post",
                url: PATH + "thanka/setThanka.php",
                //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
                headers: { "content-type": "multipart/form-data" },
                data: dataToEditor,
            }).then((result) => {
                if (result.data != null) {
                    if (customURL != "") {
                        if (selectedType == 'avatar') {
                            window.location.assign("/@" + customURL);
                        } else {
                            window.location.assign("/" + customURL);
                        }
                    } else {
                        if (result.data.DocPath == "") {
                            if (dataToEditor.Id == "") {
                                if (type == "add" && selectedType != "link" && selectedType != "repost") {
                                    addLink(result.data.Id, data.Id)
                                }
                                window.location.assign("/navigator/" + result.data.Id);
                            } else {
                                window.location.assign("/navigator/" + dataToEditor.Id);
                            }
                        } else {
                            window.location.assign("/navigator/" + result.data.DocPath);
                        }
                    }
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
    //type = {type} это про то, какой редактор вызывается - создания или редактирования
    //cogType - про тип когобъекта
    return (
        <>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            <div className="editorHeader">
                {data.Id != "" && data.Id !== undefined && (
                    <h2>
                        {type == "edit"
                            ? "Редактирование " + (data.SectorLink != undefined ? "ссылки" : data.Genitivus)
                            : "Создание тханки"
                        }
                    </h2>
                )}
            </div>
            <section className="lil-container">
                <h3>Настройки содержимого</h3>
                {data.Object.VersionStamp == true && type == "edit" && data.SectorLink == undefined ? (
                    <p>Редактирование содержимого недоступно</p>
                ) : (
                    <>
                        {data.Id != "" && data.Id !== undefined && (
                            <SelecterType
                                type={type}
                                parentType={((type == 'create' || type == "add") && (data.SectorLink != undefined ? "link" : data.Object.Type))}
                                defaultValue={selectedType}
                                setSelectedType={setSelectedType}
                            />
                        )}

                        {selectedType == 'avatar' ?
                            <p>Имя (будет отображаться на сайте):</p>
                            :
                            <p>Название: </p>
                        }

                        <input onChange={(e) => nameref.current = e.target.value}
                            defaultValue={type == 'edit' ? data.Thanka.Name : ''}
                            refs={nameref}
                            disabled={selectedType == "hashtag" ? 'disabled' : ""}
                        />

                        {data.AvatarList !== null && selectedType !== 'avatar' && selectedType !== 'cabinet' && (
                            <AvatarList
                                list={data.AvatarList}
                                authorId={selectedAuthor}
                                setSelectedAuthor={setSelectedAuthor}
                            />
                        )}

                        <p>Краткая аннотация</p>
                        <TextEditorJD
                            refs={annotationRef}
                            onChange={(e) => { annotationRef.current = e }}
                            defaultValue={type == 'edit' ? data.Thanka.Annotation : ''}
                        />

                        {selectedType == "request" &&
                            <RequestEditor setParams={setParams} type={type} request={data.Request} />
                        }
                        {selectedType == "link" && type != "add" &&
                            <ThankaLinkEditor thankaLink={thankaLink} setThankaLink={setThankaLink} />
                        }

                        {selectedType == "product" && /*type != "add" &&*/
                            <ProductEditor productLink={productLink} setProductLink={setProductLink} setProductCategory = {setProductCategory}/>
                        }

                        {selectedType != "request" && selectedType != "link" && selectedType != 'repost' &&
                            <CogObjectEditor
                                selectedDateEvent={selectedDateEvent} setSelectedDateEvent={setSelectedDateEvent}
                                selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                                selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF}
                                selectedRealAuthor={selectedRealAuthor} setSelectedRealAuthor={setSelectedRealAuthor}
                                selectedURL={selectedURL} setSelectedURL={setSelectedURL}
                                birthDate={birthDate} setBirthDate={setBirthDate}
                                telNumber={telNumber} setTelNumber={setTelNumber}
                                email={email} setEmail={setEmail}
                                selectedType={selectedType} data={data} type={type}
                                descriptionRef={descriptionRef}
                                avatarNameref={avatarNameref}
                            />
                        }
                    </>
                )}
            </section>

            <section className="lil-container">
                <h3>Настройки отображения</h3>
                <CustomURL 
                    customURL = {customURL} 
                    setCustomURL = {setCustomURL} 
                    type = {selectedType} 
                    checkedURL = {checkedURL} 
                    setCheckedURL = {setCheckedURL}
                    defaultURL = {data.CustomURL}
                />
                <PrivacySettins
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
            </section>

            <div className="editorButtons">
                {type === 'add' ? (
                    selectedType === 'repost' || selectedType === 'link' ? (
                        <>
                            <button type="submit" onClick={() => FormSubmittionHandler("add")}> Сохранить в свое дерево </button>
                        </>
                    ) : (
                        <>
                            <button type="submit" onClick={() => FormSubmittionHandler("add")}> Сохранить в свое дерево и добавить в ленту </button>
                        </>
                    )
                ) : (
                    <>
                        {(((data.PrivacyLevel === 6 || data.PrivacyLevel === 5 || data.PrivacyLevel === 3) && (type == 'add' || type == 'create')) || type == 'edit' ) && (
                            <button type="submit" onClick={() => FormSubmittionHandler("create")}> Сохранить </button>
                        )}
                    </>
                )}
                <button onClick={(e) => history.back()}> Отменить </button>
            </div>
        </>
    );
}

export default EditorInner
