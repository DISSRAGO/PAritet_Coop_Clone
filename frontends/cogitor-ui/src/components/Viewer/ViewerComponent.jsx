import React, { useEffect, useState, useContext, useRef } from 'react';
import { useMediaQuery } from 'react-responsive'
import "../../style/thanka.css"

import SEO from '../../components/SEO.jsx';

import { useLocation } from 'react-router-dom';

import { ThankaHeader, AdminMessage, LeftButtons, FunctionalButtons, Notification, WidgetGetter, CreateSite } from './ViewerParts.jsx';

import { SITE } from '../../utils/url.js';

import Right from "../../components/Viewer/Right.jsx";
import Left from "../../components/Viewer/Left.jsx";

import eyeclose from "../../../src/icons/eyeclose.png"
import eyeopen from "../../../src/icons/eyeopen.png"


import { pushHistory, backHistory } from '../../utils/HistoryManager.js';

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import Comment from '../Society/Comment.jsx';

function ViewerContainer(props) {

    const {data} = props

    //Текущая страница заносится в историю
    let location = useLocation()
    useEffect(() => {
        pushHistory(location.pathname)
    }, [])

    //Препросмотр
    const [previewName, setPreviewName] = useState('');
    const [previewDesc, setPreviewDesc] = useState('');
    const [currStyle, setCurrStyle] = useState({ display: 'block' });
    const [childStyle, setChildStyle] = useState({ display: 'none' });
    const [isPreview, setIsPreview] = useState(false);
    const [previewId, setPreviewId] = useState();
    const [isPreviewImage, setIsPreviewImage] = useState(false);

    const prevData = useTypedSelector(state => state.ThankaReducer.Preview);

    useEffect(() => {
        if (prevData.data !== null) {
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
    }, [prevData]);

    const onPointerOut = (e) => {
        setCurrStyle({ display: 'block' });
        setChildStyle({ display: 'none' });
        setIsPreview(false);
    }

    //КНОПКИ ЛЕВОЙ ЧАСТИ
    //кнопка, скрывающая интерфейс
    const [isHidden, setHidden] = useState(false);
    const [buttonName, setButtonName] = useState('Скрыть навигатор');
    const [eyePic, setEyePic] = useState(eyeopen)

    const isBigScreen = useMediaQuery({ query: '(min-width: 980px)' });
    const isTinyScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const [rightStyle, setRightStyle] = useState(isBigScreen ? {width: 'calc(100% - 510)', marginLeft: 510} : {width: '100%', marginLeft: 0});

    useEffect(() => {
        
        if (window.innerWidth >= 980 && !isHidden) {
            setRightStyle({marginLeft: 510});
        } else {
            setRightStyle({marginLeft: 0, width: '100%'});
        } 
    }, [isBigScreen, window.innerWidth, isHidden])

    const onClick = (e) => {
        if (isHidden == false) {
            setHidden(true);
            setButtonName('Показать навигатор');
            setEyePic(eyeclose);
            setRightStyle({
                marginLeft: 0,
                width: '100%'
            });
        } else {
            setHidden(false);
            setButtonName('Cкрыть навигатор');
            setEyePic(eyeopen);
            if (isBigScreen) {
                setRightStyle({
                    marginLeft: 510,
                    maxWidth: 'calc(100% - 510)'
                });
            } else {
                setRightStyle({marginLeft: 0, width: '100%'})
            }
        }
    }

    const [interfaceType, setInterfaceType] = useState('iconostas')

    return (
        <>
            {/*<SEO 
                title = {data.Thanka.Name} 
                thumbnail = {(data.CenterImage == 1 ? DIRPATH + '/image' + data.Id + '.jpg?' + data.Hash : "")}
                url = {SITE + 'navigator/' + data.Id} 
                description = {data.Thanka.Annotation} 
            />*/}
            <LeftButtons
                interfaceType = {interfaceType} setInterfaceType = {setInterfaceType}
                onClickEye = {onClick} buttonName = {buttonName} isHidden = {isHidden} isTinyScreen = {isTinyScreen}/>
            <div>
                {data.Notifications != undefined &&
                    <Notification notifications={data.Notifications} />
                }
                <section className='cogicontainer'>
                    <div className='thankaHeader'>
                        <ThankaHeader data={data} />
                        {data.Id == data.CabinetId &&
                            <CreateSite data = {data} />
                        }
                        <div className='button-menu'>
                            {((data.Thanka.Privacy == 3 && (data.AdmittedSubscribe == true || data.PrivacyLevel >= 4)) || (data.Thanka.Privacy != 3)) &&
                                <>
                                    <FunctionalButtons data={data} auth={props.auth} setInterfaceType = {setInterfaceType}/>
                                </>
                            }
                        </div>
                    </div>
                            
                    {!isHidden &&
                        <Left data={data} onPointerOut={onPointerOut} auth={props.auth} 
                            isPreview={isPreview} childrenId={previewId} isPreviewImage={isPreviewImage}
                            interfaceType = {interfaceType}
                        />
                    }
                    <a name="top"></a>
                    <AdminMessage thankaId = {data.Id}/>
                    <WidgetGetter thankaId = {data.Id}/>
                    {interfaceType != 'map' &&
                        <Right data={data} style={rightStyle}
                            childrenName={previewName} childrenDescription={previewDesc}
                            currStyle={currStyle} childStyle={childStyle}
                        />
                    }
                    {/* ((data.PrivacyLevel >= 1 && data.Thanka.Comments == true) || (data.PrivacyLevel == 6)) &&
                        <>
                            <Comment thanka = {data.Id} avatarlist = {data.AvatarList} auth = {props.auth.data} adminprivacy = {data.PrivacyLevel}/>
                        </>
                    */}
                </section>
                <div className='interface_buttons'>
                        <a href="#top">Наверх</a>
                        <a onClick={(e) => backHistory()}>Назад</a>
                </div>
            </div>
        </>
    );
}

export default ViewerContainer;