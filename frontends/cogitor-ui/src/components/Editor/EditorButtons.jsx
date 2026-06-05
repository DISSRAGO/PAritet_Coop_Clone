import React from "react";
import { backHistory } from "../../utils/HistoryManager.js";

// Блок кнопок «Сохранить» / «Отменить». Поведение зависит от режима
// (add / edit / create) и от выбранного типа тханки.
//
// Кнопка «Отменить» использует backHistory() из HistoryManager — это
// собственный механизм проекта поверх sessionStorage, который
// хранит реальную цепочку переходов по тханкам. Ровно этот же
// helper вызывается кнопками «Вернуться» в EditorPage.jsx и в других
// местах проекта.
// (Ранее был history.back() из createBrowserHistory — он опирается
// на браузерную историю, которая в SPA с react-router-dom не всегда
// содержит нужный слой — поэтому клик визуально не реагировал.)
function EditorButtons(props) {
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
            <button type="button" onClick={(e) => {
                console.log("CANCEL CLICK FIRED", {
                    sessionHistory: sessionStorage.getItem("history"),
                    location: window.location.pathname,
                });
                backHistory();
            }}> Отменить </button>
        </div>
    );
}

export default EditorButtons;
