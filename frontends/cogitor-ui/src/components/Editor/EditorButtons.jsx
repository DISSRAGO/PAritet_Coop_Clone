import React from "react";
import { useNavigate } from "react-router-dom";

// Блок кнопок «Сохранить» / «Отменить». Поведение зависит от режима
// (add / edit / create) и от выбранного типа тханки.
//
// Кнопка «Отменить» использует navigate(-1) из react-router-dom.
// На страницу /create пользователь попадает через navigate("/create")
// из Canvas — значит в истории router'а лежит родительская
// тханка, и navigate(-1) корректно на неё вернёт.
//
// Оригинал использовал history.back() из отдельного createBrowserHistory()
// — это совпадало с браузерной историей, потому что BrowserRouter в той
// же истории и сохраняет записи при navigate(). Но формально
// вызывать свой экземпляр history рядом с react-router-dom — хрупко
// и в новых версиях библиотеки может не работать. navigate(-1) —
// канонический способ в react-router-dom v6.
function EditorButtons(props) {
    const navigate = useNavigate();
    const {
        type,
        selectedType,
        name,
        data,
        onSubmit,
    } = props;

    return (
        <div className="editorButtons">
            {type === 'add' ? (
                selectedType === 'repost' || selectedType === 'link' ? (
                    <>
                        <button type="submit" onClick={() => onSubmit("add")}> Сохранить в свое дерево </button>
                    </>
                ) : (
                    <>
                        <button type="submit" onClick={() => onSubmit("add")}> Сохранить в свое дерево и добавить в ленту </button>
                    </>
                )
            ) : (
                <>
                    {(((data.PrivacyLevel === 6 || data.PrivacyLevel === 5 || data.PrivacyLevel === 3) && (type == 'add' || type == 'create')) || type == 'edit') && (
                        <button
                            type="submit"
                            onClick={() => onSubmit("create")}
                            disabled={!name || name.trim() === ""}
                            title={!name || name.trim() === "" ? "Введите название тханки" : ""}
                        > Сохранить </button>
                    )}
                </>
            )}
            <button type="button" onClick={(e) => navigate(-1)}> Отменить </button>
        </div>
    );
}

export default EditorButtons;
