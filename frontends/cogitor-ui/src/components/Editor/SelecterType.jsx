import React from "react";

// Определение дефолтного типа дочерней тханки по типу родителя.
// Вынесено вместе с SelecterType из EditorComponent.jsx без изменений логики.
export function GetTypeByParentType(objType) {

    let type = "article";

    if (objType == "cabinet") type = "avatar";
    if (objType == "collection") type = "collection";

    return type;
}

// Селектор типа тханки в редакторе. Логика выбора опций зависит от режима
// (create / edit / add) и от parentType. Поведение неизменно — это
// механический вынос из EditorComponent.jsx.
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
            <select
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={type == 'edit' ? "disabled" : ""}
                defaultValue={(options.find((o) => o.selected) || {}).value || ""}
            >
                {options.map((op) => (
                    <option key={op.value} value={op.value}>{op.text}</option>
                ))}
            </select>
        </>
    );
}

export default SelecterType;
