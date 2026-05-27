import React, { useState } from 'react';

import axios from "axios";
import { PATH, SITE } from "../../utils/url.js";
import CogObject from './CogObject.jsx';
import CogEditor from './CogEditor.jsx';
import ContentList from './ContentList.jsx';
import Comment from '../Society/Comment.jsx';

import "../../style/thanka.css"

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

function RightCurrent(props) {
    const { isLite } = props;

    const [data, setthankadata] = useState(props.data || {});
    const safeData = data || {};
    const sectorLink = safeData.SectorLink || {};
    const thanka = safeData.Thanka || {};

    const Version = useTypedSelector((state) => state.ThankaReducer.Version);
    const auth = useTypedSelector((state) => state.user.headerInfo);

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");
    const [state, setState] = useState("view");

    function getObject() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: { Id: data.Id, Login: auth.data.login, UserId: auth.data.id, method: "getObject" },
        })
        .then((result) => {
            let temp = data
            temp.Object = result.data.Object;
            temp.LocationEvent = result.data.LocationEvent;
            setthankadata(temp);
            setState("view");
        })
        .catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    return (
        <section id="mainThanka" style={props.style}>

            <div id='annotation'>
                <p dangerouslySetInnerHTML={{ __html: thanka.Annotation || "" }} />
            </div>

            {((thanka.Privacy == 3 && (safeData.AdmittedSubscribe == true || safeData.PrivacyLevel >= 4)) || (thanka.Privacy != 3)) &&
                <>
                    {state == "view" &&
                        <>
                            {sectorLink && Object.keys(sectorLink).length > 0 ?
                                <>
                                    <h4>
                                        Оригинал: <a href={SITE + 'navigator/' + sectorLink.ID}>{sectorLink.Name || ""}</a>
                                        {" "}автора{" "}
                                        <a href={SITE + 'navigator/' + sectorLink.Author}>{sectorLink.AuthorName || ""}</a>
                                    </h4>

                                    <div className='thankaLinkObject'>
                                        {(sectorLink.Privacy ?? 0) == 0 && <p>У вас нет прав для просмотра этой тханки</p>}
                                        {(sectorLink.Removed ?? 0) != 0 && <p>Тханка не существует или была удалена</p>}
                                        {(sectorLink.Privacy ?? 0) != 0 && (sectorLink.Removed ?? 0) == 0 &&
                                            <>
                                                <p dangerouslySetInnerHTML={{ __html: sectorLink.Annotation || "" }} />
                                                <CogObject
                                                    state={state}
                                                    setState={setState}
                                                    data={safeData}
                                                    auth={auth}
                                                    function={getObject}
                                                    version={Version}
                                                />
                                            </>
                                        }
                                    </div>
                                </>
                                :
                                <CogObject
                                    state={state}
                                    setState={setState}
                                    data={safeData}
                                    auth={auth}
                                    function={getObject}
                                    version={Version}
                                />
                            }
                        </>
                    }
                    {state == "edit" &&
                        <CogEditor
                            state={state}
                            setState={setState}
                            data={data}
                            auth={auth}
                            function={getObject}
                        />
                    }
                    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
                    {!isLite && 
                        <ContentList
                            header={'Ссылки до текущей тханки'}
                            content={data.LinksTo}
                            privacy={data.PrivacyLevel}
                            mainId={data.Id}
                            hash={data.Hash}
                            style={{ display: 'block' }}
                            type={"rightLink"}
                            data={data}
                        />
                    }
                    {/*window.innerWidth < 980 && props.seeLeftLinks &&
                        <div className='leftLink'>
                            <ContentList
                                header={'Ссылки от текущей тханки'}
                                content={data.LinksFrom}
                                privacy={data.PrivacyLevel}
                                mainId={data.Id}
                                hash={data.Hash}
                                style={{ display: 'block' }}
                                type={"leftLink"}
                            />
                        </div>
                    */}
                    {((data.PrivacyLevel >= 1 && thanka.Comments == true) || (data.PrivacyLevel == 6)) && window.innerWidth < 980 && !isLite &&
                            <Comment thanka={data.Id} avatarlist={data.AvatarList} auth={auth.data} adminprivacy={data.PrivacyLevel} />
                    }
                </>
            }
        </section>
    );
}


export default RightCurrent;
