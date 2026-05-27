import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive'
import "../../style/thanka.css"

import SEO from '../SEO.jsx';

import { useLocation } from 'react-router-dom';

import { ThankaHeader, AdminMessage, LeftButtons, FunctionalButtons, Notification } from './ViewerParts.jsx';

import {TableInterface} from '../Table/TableInterface.jsx'

import { SITE, DIRPATH } from '../../utils/url.js';

import Right from "./Right.jsx";

import { pushHistory, backHistory } from '../../utils/HistoryManager.js';

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import Canvas from '../Iconostas/Canvas.jsx';

import Comment from '../Society/Comment.jsx';

function isChild(children, id) {
    if (children == null || id == null) return -1
    return (children.findIndex(elem => elem.ID == id))
}

export function ViewerLite(props) {

    const {data, mainId, meta} = props

    const [isSite, setIsSite] = useState(false)

    const [settings, setSettings] = useState({
        Interface: meta != null ? meta.Interface : 'icon',
        LinkList: meta != null ? meta.LinkList : true,
        ShowComments: meta != null ? meta.ShowComments : true,
        Picture: meta != null ? meta.Picture : false
    })

    //Текущая страница заносится в историю
    let location = useLocation()
    useEffect(() => {
        pushHistory(location.pathname)

        if (location.pathname.indexOf('sitepage') != -1) {
            setIsSite(true)
        }
    }, [])


    //Препросмотр
    const [previewName, setPreviewName] = useState('');
    const [previewDesc, setPreviewDesc] = useState('');
    const [currStyle, setCurrStyle] = useState({ display: 'block' });
    const [childStyle, setChildStyle] = useState({ display: 'none' });
    const [isPreview, setIsPreview] = useState(false);
    const [previewId, setPreviewId] = useState();
    const [isPreviewImage, setIsPreviewImage] = useState(false);

    //console.log(previewId)

    const prevData = useTypedSelector(state => state.ThankaReducer.Preview);
    let res = useMemo(
        () => prevData.data !== null && prevData.data.id !== null && isChild(data?.Children, prevData.data.id),
        [data?.Children, prevData.data]
    )
    useEffect(() => {
        if (prevData.data !== null) {
            if (res != -1) {
                if (prevData.data.pic == 0 || prevData.data.pic == undefined) {
                    setIsPreviewImage(false);
                } else {
                    setIsPreviewImage(true);
                }
                setPreviewName(prevData.data.name);
                setPreviewDesc(prevData.data.desc);
                setPreviewId(prevData.data.id);

                setCurrStyle({ display: 'none' });
                setChildStyle({ display: 'block' });
                setIsPreview(true);

                if (prevData.data.id == null) {
                    setCurrStyle({ display: 'block' });
                    setChildStyle({ display: 'none' });
                    setIsPreview(false);
                }
            }
        }
    }, [prevData.data]);

    const onPointerOut = (e) => {
        setCurrStyle({ display: 'block' });
        setChildStyle({ display: 'none' });
        setIsPreview(false);
    }

    const [rightStyle, setRightStyle] = useState( meta != null && meta.Interface == 'none' ? {width: '100%'} : {width: 'calc(100% - 330)', marginLeft: 330} );
    
    return (
        <>
        {data.PrivacyLevel !== 0 && 
            <div>
                <section className='cogicontainer'>
                    <div className='thankaHeader'>
                        <ThankaHeader data={data} isLite = {true}/>
                    </div>
                    {settings.Interface != 'none' &&
                    <div id='graphicInterfaceLite'>
                        {settings.Interface == 'picture' &&
                            <img className='thankaPicInline' src={DIRPATH + "/image" + data.Id + '.jpg?'} width={200} />
                        }
                        {settings.Interface == 'icon' &&
                            <Canvas
                                isBigScreen={false}
                                isTinyScreen={false}
                                data={data}
                                onPointerOut={onPointerOut}
                                hash={data.Hash != undefined ? data.Hash : ""}
                                isPreview={isPreview}
                                childrenId={previewId}
                                isPreviewImage={isPreviewImage}
                                isLite = {true}
                                isSite = {isSite}
                                mainId = {mainId}
                            />
                        } 
                        {settings.Interface == 'table' &&
                            <TableInterface data={data} style={{'display': 'block'}} state={'simpleTable'} type={'view'} 
                                list={data.Children} mainId = {mainId}/>   
                        }
                    </div>
                    }
                    <Right data={data} style={rightStyle}
                        childrenName={previewName} childrenDescription={previewDesc}
                        currStyle={currStyle} childStyle={childStyle} isLite = {true} 
                    />
                    {settings.ShowComments == true && data?.Id != null &&
                        <Comment thanka={data.Id} avatarlist={[]} auth={null} adminprivacy={1} />
                    }
                </section>
            </div>
        }
        { data.PrivacyLevel == 0 &&
            <div className='thankaName'>
                <h3>
                    Для просмотра виджета нужно авторизоваться или зарегистрироваться
                </h3>
            </div>
        }
        </>
    );
}

export default ViewerLite;
