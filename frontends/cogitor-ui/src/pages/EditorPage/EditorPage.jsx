import React, { useEffect } from "react";
import { createBrowserHistory } from "history";
import { PATH } from "../../utils/url.js";
import EditorInner from "../../components/Editor/EditorComponent.jsx";
import "../../style/thanka.css";

import { useTypedSelector } from "../../hooks/useTypedSelector.ts";
import { useActions } from "../../hooks/useActions.ts";
import { FetchStatus } from '../../store/types/fetchTypes';

import { backHistory } from "../../utils/HistoryManager.js";
import EditorSite from "../../components/Editor/EditorSite.jsx";

//ЕСЛИ НЕ ДЕЛАТЬ РАЗДЕЛЕНИЕ ПО create/edit, БУДУТ ПОДСТАВЛЯТЬСЯ ДАННЫЕ ТЕКУЩЕЙ ТХАНКИ

function Editor(props) {

    const data = useTypedSelector((state) => state.ThankaReducer.Data);
    const auth = useTypedSelector((state) => state.user.headerInfo);
    const { getData } = useActions();

    //если мы переходим из пустого сектора
    useEffect(() => {
        if (data.data == null && auth.status === FetchStatus.SUCCESS) {
            getData(PATH, sessionStorage.getItem("address"), { id: auth.data.id, login: auth.data.login });
        }
    }, [auth.status]);

    return (
        <section className="cogicontainer">
            {data.data == null && auth.data.id != undefined &&
                <>
                    <h2 className="errormessage">Пожалуйста, вернитесь на страницу просмотра и попробуйте снова</h2>
                    <button className = "editorErrorButton" type={"reset"} onClick={(e) => backHistory()}>Вернуться</button>
                </>
            }
            {
                auth.data.id == undefined && 
                <>
                    <h2 className="errormessage">Пожалуйста, войдите в систему или зарегистрируйтесь</h2>
                    <button className = "editorErrorButton" type={"reset"} onClick={(e) => backHistory()}>Вернуться</button>
                </>
            }
            {data.data !== null && auth.data.id != undefined && 
                <>
                { props.type == 'createsite' ||  props.type == 'editsite'  ?
                    <EditorSite data={data} type={props.type} auth={auth} />
                    :
                    <EditorInner data={data} type={props.type} auth={auth} />
                }
                </>
            }
        </section>
    );
}

export default Editor;
