import React, { useEffect, useState, useContext, useRef } from 'react';
import { useMediaQuery } from 'react-responsive'
import { PATH, SITE, DIRPATH } from "../../utils/url.js";
import "../../style/thanka.css"

import ViewerContainer from '../../components/Viewer/ViewerComponent.jsx';
import {AdminMessage} from '../../components/Viewer/ViewerParts.jsx';
import { ViewerLite } from '../../components/Viewer/ViewerLite.jsx';

import SiteComponent from '../../components/Viewer/SiteComponent.jsx';

import { useLocation } from 'react-router-dom';

import { backHistory } from '../../utils/HistoryManager.js';

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import { useActions } from '../../hooks/useActions.ts';
import { AuthContext } from '../../context/AuthContext';
import { FetchStatus } from '../../store/types/fetchTypes';
import { Helmet } from 'react-helmet';

function ViewerPage(props) {
    
    let error = false;
    let errorText = "Страница не найдена";

    let address = document.location.pathname;
    let search = document.location.search;

    var thanka_data;

    const { getData } = useActions();

    const auth = useTypedSelector((state) => state.user.headerInfo);
    const { isAuth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.status === FetchStatus.SUCCESS || auth.status === FetchStatus.FAIL ||
            auth.status === FetchStatus.IDLE && isAuth == false && sessionStorage.getItem('isAuth') == null || search == "?lite=true") {
            if (auth.data.id) sessionStorage.setItem("id", auth.data.id)
            let userId = ""
            let userLogin = ""
            if (auth.status === FetchStatus.FAIL && sessionStorage.getItem('isAuth') != null) {
                userId = sessionStorage.getItem("id")
                userLogin = sessionStorage.getItem("login")
            }
            if (auth.status === FetchStatus.SUCCESS) {
                userId = auth.data.id
                userLogin = auth.data.login
            }
            getData(PATH, address, { id: userId, login: userLogin });
        };
    }, [address, auth.status]);

    const data = useTypedSelector((state) => state.ThankaReducer.Data);

    sessionStorage.setItem("address", address);

    if (data.status == FetchStatus.SUCCESS) {
        sessionStorage.setItem("cabinet", data.data.CabinetId);
        sessionStorage.setItem("admin", data.data.IsAdmin);
    }

    let isload = false;

    if (data.data !== null && data.data.Id !== undefined) {
        thanka_data = data.data;
        isload = true;
    }

    if (data.error == "error") {
        error = true;
        isload = true;
        errorText = "Страница не доступна, или была удалена.";
    }

    if (data.data !== null && data.data.PrivacyLevel == 0) {
        error = true;
        isload = true;
        if (auth.data.id == undefined) {
            errorText = "Для просмотра тханки авторизуйтесь или зарегистрируйтесь"
        } else {
            errorText = "Нет доступа";
        }
    }

    let location = useLocation()
    useEffect(() => {
        if (location.search == "?lite=true") {
            sessionStorage.setItem("lite",true)
            if (data.data != null && sessionStorage.getItem("liteHead") == undefined) {
                sessionStorage.setItem("liteHead",data.data.Id)
            }
        } else {
            sessionStorage.removeItem("lite");
            sessionStorage.removeItem("liteHead")
        }
    },[data])
    
    return (
        <>
            <Helmet>
                <link rel="stylesheet" href={data.data !== null && data.data.Object.Type == 'site' && DIRPATH + "/styles/" + data.data.MainPage.ID + ".css?" + data.data.Hash}></link>
            </Helmet>

            {!isload && (
                <div className="error">
                    <h3>Идет загрузка</h3>
                </div>
            )}

            {isload && error &&
                <div className="error">
                    <AdminMessage thankaId={data.data !== null ? (data.data.Object.Type == 'site' ? data.data.Thanka.Id : data.data.Id) : ""} />
                    <h2>{errorText}</h2>
                    <button onClick={(e) => backHistory()}>Назад</button>
                </div>
            }
            {isload && !error &&
                <>
                    {data.data.Object.Type == 'site' ?
                        (<SiteComponent data={thanka_data} user={{ id: auth.data.id, login: auth.data.login }} auth={auth} />)
                        :
                        (<>
                            {
                                sessionStorage.getItem("lite") ?
                                    <ViewerLite data={thanka_data} user={{ id: auth.data.id, login: auth.data.login }} auth={auth} mainId={sessionStorage.getItem("liteHead")} />
                                    :
                                    <ViewerContainer data={thanka_data} user={{ id: auth.data.id, login: auth.data.login }} auth={auth} />
                            }
                        </>)
                    }
                </>
            }
        </>
    );
}

export default ViewerPage;
