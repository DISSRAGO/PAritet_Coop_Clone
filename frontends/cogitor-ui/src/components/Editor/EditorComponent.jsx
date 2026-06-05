import React, { useState, useEffect } from "react";
import "../../style/thanka.css";

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

import { GetTypeByParentType } from "./SelecterType.jsx";
import EditorContentSection from "./EditorContentSection.jsx";
import EditorDisplaySection from "./EditorDisplaySection.jsx";
import EditorButtons from "./EditorButtons.jsx";
import { submitThanka } from "./submitThanka.js";

import { TrueDateForEditor } from "../../utils/language_ru.js";

// Реэкспорт CustomURL — внешние потребители (EditorSite.jsx)
// импортируют его именованно из этого файла.
export { CustomURL } from "./CustomURL.jsx";

// EditorInner — оркестратор редактора тханки. Хранит весь state
// формы, разворачивает его в две секции (содержимое + отображение)
// и блок кнопок. Логика сабмита вынесена в submitThanka.js.
//
// Раньше этот файл был ~820 строк и держал в одном компоненте 7
// подкомпонентов, ~30 useState, useEffect, 256-строчный сабмит и весь
// JSX. После раскола файл превратился в чистый оркестратор state.
function EditorInner(props) {

    let data = props.data.data;
    let auth = props.auth.data;
    const { type } = props;

    //сообщения об ошибках
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    //управляемые компоненты, вкусненько
    //Картинка. Новая, если создание или ее не было, существующая - если редактирование, и она есть
    const [selectedPictureSend, setSelectedPictureSend] = useState(null);
    const [selectedPicCoord, setPicCoord] = useState({ left: null, top: null, width: null, height: null });

    // аннотация (Jodit общается через onChange-HTML, потому useState)
    const [annotation, setAnnotation] = useState(type == 'edit' ? (data.Thanka.Annotation || '') : '');

    //выбор типа. Тут массив, поэтому такие огороды нагорожены, иначе не отправляет.
    // Гарантируем непустой дефолт: если GetTypeByParentType вернёт undefined/null —
    // падаем в «article». Это убирает симптом «Object.Type='' прилетает на бэк».
    const [selectedType, setSelectedType] = useState(
        (type == 'edit'
            ? (data.SectorLink != undefined && data.Object.Type != "repost" ? "link" : data.Object.Type)
            : GetTypeByParentType(data.Object.Type)
        ) || "article"
    );

    // имя тханки (после рефакторинга — обычный useState).
    const [name, setName] = useState(type == 'edit' ? (data.Thanka.Name || '') : '');

    //количество секторов, все понятно
    const [selectedSectors, setSelectedSectors] = useState(type == 'edit' ? data.Thanka.SectorsNum : 12);

    //количество кружочков, тоже все понятно
    const [selectedCircles, setSelectedCircles] = useState(type == 'edit' ? data.Thanka.CirclesNum : 1);

    // Содержимое (описание).
    const [description, setDescription] = useState(type == 'edit' ? (data.Object.Description || '') : '');

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

    const [thankaLink, setThankaLink] = useState(type == 'edit' && data.SectorLink != undefined && data.SectorLink != null ? data.SectorLink.ID : '');
    const [productLink, setProductLink] = useState(type == 'edit' ? data.Object.ProductId : "");
    const [productCategory, setProductCategory] = useState({ id: "", name: "" });

    // Имя аватара (после рефакторинга — обычный useState).
    const [avatarName, setAvatarName] = useState(type == 'edit' ? (data.Object.Name || '') : '');

    const [params, setParams] = useState({});

    const [customURL, setCustomURL] = useState(type == 'edit' ? data.CustomURL : '');
    const [checkedURL, setCheckedURL] = useState(true);

    //стихии
    const [elemArr, setElemArr] = useState([]);
    const [selectedElements, setSelectedElements] = useState(elemArr);

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

    // Сабмит формы. Делегирует submitThanka — все ветвления, FormData,
    // axios и навигация лежат там.
    function FormSubmittionHandler(buttonType) {
        submitThanka({
            buttonType,
            type, data, auth,
            name, annotation, description, avatarName,
            selectedType, selectedAuthor,
            selectedPrivacy, selectedChild, selectedComments, selectedAngles,
            selectedSectors, selectedCircles,
            selectedElements, setSelectedElements,
            selectedPictureSend, selectedPicCoord,
            selectedDateEvent, selectedLocation, selectedPDF,
            selectedRealAuthor, selectedURL,
            birthDate, telNumber, email,
            params,
            thankaLink,
            productLink, productCategory,
            customURL, checkedURL,
            setSystemMessageText, setSystemMessageStatus,
        });
    }

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

            <EditorContentSection
                data={data} type={type}
                selectedType={selectedType} setSelectedType={setSelectedType}
                name={name} setName={setName}
                selectedAuthor={selectedAuthor} setSelectedAuthor={setSelectedAuthor}
                annotation={annotation} setAnnotation={setAnnotation}
                params={params} setParams={setParams}
                thankaLink={thankaLink} setThankaLink={setThankaLink}
                productLink={productLink} setProductLink={setProductLink} setProductCategory={setProductCategory}
                selectedDateEvent={selectedDateEvent} setSelectedDateEvent={setSelectedDateEvent}
                selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF}
                selectedRealAuthor={selectedRealAuthor} setSelectedRealAuthor={setSelectedRealAuthor}
                selectedURL={selectedURL} setSelectedURL={setSelectedURL}
                birthDate={birthDate} setBirthDate={setBirthDate}
                telNumber={telNumber} setTelNumber={setTelNumber}
                email={email} setEmail={setEmail}
                description={description} setDescription={setDescription}
                avatarName={avatarName} setAvatarName={setAvatarName}
            />

            <EditorDisplaySection
                customURL={customURL} setCustomURL={setCustomURL}
                selectedType={selectedType}
                checkedURL={checkedURL} setCheckedURL={setCheckedURL}
                data={data}
                selectedPrivacy={selectedPrivacy} setSelectedPrivacy={setSelectedPrivacy}
                selectedChild={selectedChild} setSelectedChild={setSelectedChild}
                selectedComments={selectedComments} setSelectedComments={setSelectedComments}
                selectedCircles={selectedCircles} setSelectedCircles={setSelectedCircles}
                selectedAngles={selectedAngles} setSelectedAngles={setSelectedAngles}
                selectedSectors={selectedSectors} setSelectedSectors={setSelectedSectors}
                type={type}
                elemArr={elemArr} setSelectedElements={setSelectedElements}
                setSelectedPictureSend={setSelectedPictureSend}
                setPicCoord={setPicCoord}
                selectedPicCoord={selectedPicCoord}
            />

            <EditorButtons
                type={type}
                selectedType={selectedType}
                name={name}
                data={data}
                onSubmit={FormSubmittionHandler}
            />
        </>
    );
}

export default EditorInner;
