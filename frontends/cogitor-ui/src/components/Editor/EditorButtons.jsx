import React from "react";
import { createBrowserHistory } from "history";

// Отдельный экземпляр history нужен именно для кнопки «Отменить»: приложение
// использует history@5, и переходы в SPA идут через этот объект.
// Поход через window.history.back() не возвращает на предыдущий экран,
// если переход был сделан через history.push() библиотеки history.
const history = createBrowserHistory();

// Блок кнопок «Сохранить» / «Отменить». Поведение зависит от режима
// (add / edit / create) и от выбранного типа тханки. Логика не
// менялась — это механический вынос из EditorComponent.jsx.
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
            <button type="button" onClick={(e) => history.back()}> Отменить </button>
        </div>
    );
}

export default EditorButtons;
