import React from "react";
import TextEditorJD from "../TextEditor/Jodit.jsx";

import SelecterType from "./SelecterType.jsx";
import AvatarList from "./AvatarList.jsx";
import ThankaLinkEditor from "./ThankaLinkEditor.jsx";
import ProductEditor from "./ProductEditor.jsx";
import CogObjectEditor from "./CogObjEditor.jsx";
import { RequestEditor } from "./RequestEditor.jsx";

// Section «Настройки содержимого» — верхняя половина редактора тханки.
// Группирует выбор типа, имя, аватар-автор, аннотацию и подкомпоненты,
// специфичные для конкретного типа тханки.
//
// Логика не менялась — это механический вынос из EditorComponent.jsx.
function EditorContentSection(props) {
    const {
        // данные / режим
        data, type,
        // тип объекта тханки
        selectedType, setSelectedType,
        // имя
        name, setName,
        // аватар-автор
        selectedAuthor, setSelectedAuthor,
        // аннотация
        annotation, setAnnotation,
        // request
        params, setParams,
        // link / repost
        thankaLink, setThankaLink,
        // product
        productLink, setProductLink, setProductCategory,
        // article / document / avatar (через CogObjectEditor)
        selectedDateEvent, setSelectedDateEvent,
        selectedLocation, setSelectedLocation,
        selectedPDF, setSelectedPDF,
        selectedRealAuthor, setSelectedRealAuthor,
        selectedURL, setSelectedURL,
        birthDate, setBirthDate,
        telNumber, setTelNumber,
        email, setEmail,
        description, setDescription,
        avatarName, setAvatarName,
    } = props;

    // VersionStamp + edit + не-ссылка → редактирование содержимого
    // запрещено по бизнес-правилу.
    if (data.Object.VersionStamp == true && type == "edit" && data.SectorLink == undefined) {
        return (
            <section className="lil-container">
                <h3>Настройки содержимого</h3>
                <p>Редактирование содержимого недоступно</p>
            </section>
        );
    }

    return (
        <section className="lil-container">
            <h3>Настройки содержимого</h3>

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

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setAnnotation(e)}
                defaultValue={type == 'edit' ? (data.Thanka.Annotation || '') : ''}
            />

            {selectedType == "request" &&
                <RequestEditor setParams={setParams} type={type} request={data.Request} />
            }
            {selectedType == "link" && type != "add" &&
                <ThankaLinkEditor thankaLink={thankaLink} setThankaLink={setThankaLink} />
            }

            {selectedType == "product" && /*type != "add" &&*/
                <ProductEditor productLink={productLink} setProductLink={setProductLink} setProductCategory={setProductCategory} />
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
                    description={description}
                    setDescription={setDescription}
                    avatarName={avatarName}
                    setAvatarName={setAvatarName}
                />
            }
        </section>
    );
}

export default EditorContentSection;
