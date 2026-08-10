import React, { useEffect, useState, useContext } from 'react';
import { PATH, DIRPATH } from "../../utils/url.js";
import "../../style/thanka.css";

import ViewerContainer from '../../components/Viewer/ViewerComponent.jsx';
import { AdminMessage } from '../../components/Viewer/ViewerParts.jsx';
import { ViewerLite } from '../../components/Viewer/ViewerLite.jsx';
import SiteComponent from '../../components/Viewer/SiteComponent.jsx';
import ReclamationCreateModal from "../../components/reclamation/ReclamationCreateModal";

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

    let thanka_data;

    const { getData } = useActions();
    const auth = useTypedSelector((state) => state.user.headerInfo);
    const data = useTypedSelector((state) => state.ThankaReducer.Data);
    const { isAuth } = useContext(AuthContext);

    const [isReclamationOpen, setIsReclamationOpen] = useState(false);

    useEffect(() => {
        if (
            auth.status === FetchStatus.SUCCESS ||
            auth.status === FetchStatus.FAIL ||
            (auth.status === FetchStatus.IDLE &&
                isAuth == false &&
                sessionStorage.getItem('isAuth') == null) ||
            search == "?lite=true"
        ) {
            if (auth?.data?.id) {
                sessionStorage.setItem("id", auth.data.id);
            }

            let userId = "";
            let userLogin = "";

            if (auth.status === FetchStatus.FAIL && sessionStorage.getItem('isAuth') != null) {
                userId = sessionStorage.getItem("id") || "";
                userLogin = sessionStorage.getItem("login") || "";
            }

            if (auth.status === FetchStatus.SUCCESS) {
                userId = auth?.data?.id || "";
                userLogin = auth?.data?.login || "";
            }

            getData(PATH, address, { id: userId, login: userLogin });
        }
    }, [address, auth.status]);

    sessionStorage.setItem("address", address);

    if (data.status == FetchStatus.SUCCESS) {
        if (data?.data?.CabinetId !== undefined) {
            sessionStorage.setItem("cabinet", data.data.CabinetId);
        }
        if (data?.data?.IsAdmin !== undefined) {
            sessionStorage.setItem("admin", data.data.IsAdmin);
        }
    }

    let isload = false;

    if (data.data !== null && data.data !== undefined) {
        thanka_data = data.data;
        isload = true;
    }

    if (data.error == "error") {
        error = true;
        isload = true;
        errorText = "Страница не доступна, или была удалена.";
    }

    if (data.data !== null && data.data !== undefined && data.data.PrivacyLevel == 0) {
        error = true;
        isload = true;
        if (auth?.data?.id == undefined) {
            errorText = "Для просмотра тханки авторизуйтесь или зарегистрируйтесь";
        } else {
            errorText = "Нет доступа";
        }
    }

    const location = useLocation();

    useEffect(() => {
        if (location.search == "?lite=true") {
            sessionStorage.setItem("lite", true);
            if (data.data != null && sessionStorage.getItem("liteHead") == undefined) {
                sessionStorage.setItem("liteHead", data.data.Id);
            }
        } else {
            sessionStorage.removeItem("lite");
            sessionStorage.removeItem("liteHead");
        }
    }, [data, location.search]);

    const objectType = data?.data?.Object?.Type || data?.data?.Type || "";

    const normalizedTargetId =
        data?.data?.Thanka?.Id ||
        data?.data?.Thanka?.ID ||
        data?.data?.Id ||
        data?.data?.ID ||
        data?.data?.Object?.Id ||
        data?.data?.Object?.ID ||
        data?.data?.CurrentThanka?.Id ||
        data?.data?.CurrentThanka?.ID ||
        data?.data?.ParentThanka?.Id ||
        data?.data?.ParentThanka?.ID ||
        data?.data?.ThankaId ||
        data?.data?.thankaId ||
        "";

    const subjectId =
        auth?.data?.subjectId ||
        auth?.data?.subjectid ||
        auth?.data?.SubjectId ||
        "";

    const respondentSubjectId =
        data?.data?.Thanka?.AuthorSubjectId ||
        data?.data?.Thanka?.Authorsubjectid ||
        data?.data?.Thanka?.authorSubjectId ||
        data?.data?.Thanka?.author_subject_id ||
        data?.data?.Object?.AuthorSubjectId ||
        data?.data?.Object?.authorSubjectId ||
        data?.data?.Object?.author_subject_id ||
        data?.data?.AuthorSubjectId ||
        data?.data?.authorSubjectId ||
        data?.data?.author_subject_id ||
        "";
    
    const isProfilePage =
        address === "/profile" ||
        objectType === "avatar" ||
        objectType === "profile";

    const isSiteObject = objectType === "site";

    const canShowReclamationButton =
        isload &&
        !error &&
        !!normalizedTargetId &&
        !isProfilePage;
        // !isSiteObject;

    useEffect(() => {
        if (isload) {
            console.log("REKL DEBUG ViewerPage", {
                address,
                objectType,
                normalizedTargetId,
                canShowReclamationButton,
                rootKeys: data?.data ? Object.keys(data.data) : [],
                objectKeys: data?.data?.Object ? Object.keys(data.data.Object) : [],
                thankaKeys: data?.data?.Thanka ? Object.keys(data.data.Thanka) : [],
                currentThankaKeys: data?.data?.CurrentThanka ? Object.keys(data.data.CurrentThanka) : [],
                parentThankaKeys: data?.data?.ParentThanka ? Object.keys(data.data.ParentThanka) : [],
                rawData: data?.data,
            });
        }
    }, [isload, address, objectType, normalizedTargetId, canShowReclamationButton, data]);

    return (
        <>
            <Helmet>
                <link
                    rel="stylesheet"
                    href={
                        data.data !== null &&
                        data.data &&
                        data.data.Object &&
                        data.data.Object.Type == 'site' &&
                        data.data.MainPage &&
                        data.data.MainPage.ID &&
                        DIRPATH + "/styles/" + data.data.MainPage.ID + ".css?" + (data.data.Hash || "")
                    }
                />
            </Helmet>

            {!isload && (
                <div className="error">
                    <h3>Идет загрузка</h3>
                </div>
            )}

            {isload && error && (
                <div className="error">
                    <AdminMessage
                        thankaId={
                            data.data !== null
                                ? (
                                    data?.data?.Object?.Type == 'site'
                                        ? data?.data?.Thanka?.Id
                                        : (data?.data?.Id || data?.data?.Thanka?.Id || "")
                                )
                                : ""
                        }
                    />
                    <h2>{errorText}</h2>
                    <button onClick={() => backHistory()}>Назад</button>
                </div>
            )}

            {isload && !error && (
                <>
                    {canShowReclamationButton && (
                        <div
                            style={{
                                padding: "12px 16px",
                                display: "flex",
                                justifyContent: "flex-end",
                                position: "relative",
                                zIndex: 2,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setIsReclamationOpen(true)}
                                title="Подать рекламацию"
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #d9d9d9",
                                    background: "#ffffff",
                                    color: "#111111",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    lineHeight: "20px",
                                }}
                            >
                                Подать рекламацию
                            </button>
                        </div>
                    )}

                    {data?.data?.Object?.Type == 'site' ? (
                        <SiteComponent
                            data={thanka_data}
                            user={{ id: auth?.data?.id, login: auth?.data?.login }}
                            auth={auth}
                        />
                    ) : (
                        <>
                            {sessionStorage.getItem("lite") ? (
                                <ViewerLite
                                    data={thanka_data}
                                    user={{ id: auth?.data?.id, login: auth?.data?.login }}
                                    auth={auth}
                                    mainId={sessionStorage.getItem("liteHead")}
                                />
                            ) : (
                                <ViewerContainer
                                    data={thanka_data}
                                    user={{ id: auth?.data?.id, login: auth?.data?.login }}
                                    auth={auth}
                                />
                            )}
                        </>
                    )}
                </>
            )}

            {canShowReclamationButton && (
                <ReclamationCreateModal
                    isOpen={isReclamationOpen}
                    onClose={() => setIsReclamationOpen(false)}
                    targetType="thanka"
                    targetId={normalizedTargetId}
                    subjectId={subjectId}
                    respondentSubjectId={respondentSubjectId}
                />
            )}
        </>
    );
}

export default ViewerPage;