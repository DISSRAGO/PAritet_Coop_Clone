import React, { useEffect, useState, useContext, useRef } from 'react';
import { useMediaQuery } from 'react-responsive'
import "../../style/thanka.css"

import axios from 'axios';

import { useActions } from '../../hooks/useActions.ts';

import { Link } from "react-router-dom";

import SEO from '../SEO.jsx';

import { useLocation } from 'react-router-dom';

import { ThankaHeader, AdminMessage, LeftButtons, FunctionalButtons, Notification, WidgetGetter, CreateSite } from './ViewerParts.jsx';
import { SystemMessage } from './SystemMessage.jsx';

import {ViewerLite} from "./ViewerLite.jsx"

import { SITE, PATH, DIRPATH } from '../../utils/url.js';

import Right from "./Right.jsx";
import Left from "./Left.jsx";

import eyeclose from "../../../src/icons/eyeclose.png"
import eyeopen from "../../../src/icons/eyeopen.png"


import add from '../../icons/add.png';
import edit from '../../icons/edit.png';
import collection from '../../icons/collection.png';
import link from '../../icons/link.png';
import remove from '../../icons/remove.png';
import move from '../../icons/move.png';
import versions from '../../icons/versions.png';
import add_article from '../../icons/add_article.png';
import eye from '../../icons/eyeopen.png';
import sort from '../../icons/sort.png';
import colors from "../../icons/colors.png"

import sortdown from '../../icons/sortdown.png';
import sortup from '../../icons/sortup.png';

import { pushHistory, backHistory, setBreadCrumbs, getBreadCrumbs } from '../../utils/HistoryManager.js';
import { ThankaPic } from '../Editor/PrivacySettings.jsx';

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import Comment from '../Society/Comment.jsx';
import { SimpleThankaActionList } from '../Table/TableList.jsx';

import { MenuProps } from 'antd';
import { Menu, Breadcrumb, Modal} from 'antd';
import TableSort from '../Table/TableSort.jsx';

function SiteButtons(props) {

    const { data, auth } = props;

    const { getTableData } = useActions();

    const [type, setType] = useState(data.SectorLink != undefined ? "link" : data.Object.Type)

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const removePage = (e) => {
        const confirmBox = window.confirm(
            'Удалить текущую тханку? Ее нельзя будет восстановить'
        );
        if (confirmBox === true) {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'site/site.php',
                headers: { "content-type": "multipart/form-data" },
                data: { Id: data.Id /*id: auth.data.id, login: auth.data.login*/, method: "removePage" }
            }).then((result) => {
                //window.location.assign(SITE + 'navigator/' + data.Thanka.ParentId);
                setSystemMessageText("");
                setSystemMessageType("none")
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
        }
    }

    return (
        <>
        <div className='button-group'>
            {data.PrivacyLevel > 2 && data.PrivacyLevel != 4 && type != 'hashtag' && (data.Thanka.DocumentPart == undefined ||
                (data.Thanka.DocumentPart == true && type == 'document')) && //авторизованный может создавать потомков
                <Link to={{ pathname: "/createsite", state: { data: data } }}>
                    <input title={'Создать новую страницу сайта'} type='image' src={add} />
                </Link>
            }
            {data.PrivacyLevel == 6 && //владелец
                <>
                    <Link to={{ pathname: "/editsite", state: { data: data } }}>
                        <input title={'Редактировать страницу'} type='image' src={edit} />
                    </Link>

                    {type == "article" && data.Thanka.ThankaLink == undefined &&
                        <input onClick={getAllVersions} title={'Просмотреть версии'} type='image' src={versions} />
                    }
                </>
            }
            {data.PrivacyLevel >= 4 &&  //админ и владелец
                !data.Thanka.MainPage &&
                <>
                    <input onClick={removePage} title={'Удалить страницу'} type='image' src={remove} />
                </>
            }
            {data.PrivacyLevel == 6 && 
                <>
                    <WidgetCreate type = {"create"} Id = {data.Id} contentLength = {data.Content != null ? data.Content.length : 0}/>
                    <WidgetSort data = {data.Content} />
                </>
            }
        </div>
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} Type = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    );
}

function WidgetSort(props) {

    const {data, hash} = props;
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const [array, setArray] = useState(data);
    let arr = array != null ? array.slice(): [];

    function onClickUp(i) {
        let elem = arr[i-1]
        arr[i-1] = arr[i]
        arr[i] = elem
        setArray(arr)
    }

    function onClickDown(i) {
        let elem = arr[i+1]
        arr[i+1] = arr[i]
        arr[i] = elem
        setArray(arr)
    }

    function Save() {
        sortTable.current.close()
        let Sectors = ""
        for (let i = 0; i < arr.length; i++) {
            Sectors += arr[i].ID + ";"
        }
        axios({
            method: "post",
            url: PATH + 'site/site.php',
            data: {Line: Sectors, method: "sortWidget"},
            headers: {"content-type": "multipart/form-data"},
        }).then((result) => {
            setSystemMessageText("Перезагрузите страницу")
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

    const sortTable = useRef(null)

    return (
    <>
    <input onClick={() => sortTable.current.showModal()} title={'Отсортировать виджеты'} type='image' src={sort} />
    <dialog id = "sortTable" ref = {sortTable}>
    <div className='sortButtons'>
      <button onClick = {Save.bind(this)}>Сохранить</button>
      <button onClick = {() => sortTable.current.close()}>Отменить</button>
    </div>
      <table className="table">
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
            <th>{"Действие"}</th>
          </tr>
          {array != null && array.map((arr, i) => (
            <tr>
              <td>{arr.ID}</td>
              <td>
                { arr.Image == 1 && <img src = {DIRPATH + "/image" + arr.Thanka.Id + ".jpg?" + hash} width={50}/>}
                { arr.Image == 0 && <img src = {DIRPATH + "/empty.jpg"} width={50}/> }
              </td>
              <td>{arr.DocumentPath != undefined ? 
                    <a href={'/navigator/' + arr.DocumentPath}>{arr.Name}</a>
                    :
                    <a href={'/navigator/'+arr.ID}>{arr.Name}</a>
                }
                </td>
              <td>
                {i > 0 &&
                <input onClick={onClickUp.bind(this,i)} title = {'Вверх'} type='image' src={sortup} width={20}/>
                }
                {i < array.length-1 &&
                <input onClick={onClickDown.bind(this,i)} title = {'Вниз'} type='image' src={sortdown} width={20}/>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </dialog>
      <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}


function WidgetCreate(props) {

    const {type, Id, widgetThankaId, contentLength, widgetSettings} = props

    const dialog = useRef(null)    

    const [thankalist, setThankaList] = useState([])
    const [selectThanka, setSelectThanka] = useState("")
    const [interfaceType, setInterfaceType] = useState(type == 'edit' ? widgetSettings.Interface : "none")
    const [comments, setComments] = useState(type == 'edit' ? widgetSettings.ShowComments : false)
    const [linkList, setLinkList] = useState(type == 'edit' ? widgetSettings.LinkList : false);
    //const [picture, setPicture] = useState(type == 'edit' ? widgetSettings.Image : false);

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const createWidget = () => {
        if (selectThanka != "") {
            dialog.current.close()
            axios({
                method: "post",
                url: PATH + 'site/site.php',
                headers: { "content-type": "multipart/form-data" },
                data: { 
                        method: "createWidget", 
                        SitePage: Id, 
                        ThankaWidget: selectThanka,
                        Interface: interfaceType,
                        Comments: +comments,
                        LinkList: +linkList,
                        //Picture: +picture,
                        Sort: contentLength + 1
                    },
            }).then((result) => {
                setSystemMessageText("Виджет создан");
                setSystemMessageType("success")
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })  
        } else {
            setSystemMessageText("Выберите нужную тханку");
            setSystemMessageType("warning")
        } 
    } 

    const editWidget = () => {
            dialog.current.close()
            axios({
                method: "post",
                url: PATH + 'site/site.php',
                headers: { "content-type": "multipart/form-data" },
                data: { 
                        method: "editWidget", 
                        Id: widgetThankaId, 
                        Interface: interfaceType,
                        Comments: +comments,
                        LinkList: +linkList,
                        //Picture: +picture
                    },
            }).then((result) => {
                setSystemMessageText("Виджет изменен");
                setSystemMessageType("success")
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })  
        } 

    const getThankaList = (e) => {
        dialog.current.showModal()
        if (thankalist.length == 0) {
            axios({
                method: "post",
                url: PATH + 'request/request.php',
                headers: { "content-type": "multipart/form-data" },
                data: {method: "getAllThankas", type: "addwidget"},
            }).then((result) => {
                setThankaList(typeof result.data.List == 'object' ? Object.values(result.data.List) : result.data.List)
            }).catch((error) => {
            })
        }      
    }  

    return (
    <>
        <input onClick={getThankaList} title={type == "create" ? 'Создать виджет' : "Изменить виджет"} type='image' src={type == "create" ? add_article : edit} />
        <dialog id='addwidget' ref={dialog}>
            <h4>{"Редактирование виджета"}</h4>
            {type == 'create' &&
                <SimpleThankaActionList list = {thankalist} setLink = {setSelectThanka} link = {selectThanka} />
            }
            <div className="requestEditor">
                <div>
                    <label>
                        <input type="radio" id="interface_none" name="interface" value="none" onChange={(e) => setInterfaceType(e.target.value)} checked={interfaceType == 'none'}/>
                        Без интерфейса
                    </label>
                    <label>
                        <input type="radio" id="interface_icon" name="interface" value="icon" onChange={(e) => setInterfaceType(e.target.value)} checked={interfaceType == 'icon'} />
                        Иконостас
                    </label>
                    <label>
                        <input type="radio" id="interface_tble" name="interface" value="table" onChange={(e) => setInterfaceType(e.target.value)} checked={interfaceType == 'table'} />
                        Таблица
                    </label>
                    <label>
                        <input type="radio" id="interface_pic" name="interface" value="picture" onChange={(e) => setInterfaceType(e.target.value)} checked={interfaceType == 'picture'} />
                        Изображение
                    </label>
                    {/*<label>
                        <input type="radio" id="interface_mmap" name="interface" value="map" onChange={(e) => setInterfaceType(e.target.value)} checked={interfaceType == 'map'} />
                        Карта
                    </label>*/}
                </div>
                <div>
                    <label><input type="checkbox" onChange={(e) => setComments(!comments)} checked={comments} />{"Показывать комментарии"}</label>
                    <label><input type="checkbox" onChange={(e) => setLinkList(!linkList)} checked={linkList}/>{"Показывать ссылки"}</label>
                </div>
            </div>
            <button onClick={type == "create" ? createWidget.bind(this) : editWidget.bind(this)}>{type == "create" ? "Создать виджет" : "Сохранить виджет"}</button>
            <button onClick={() => dialog.current.close()}>{'Закрыть'}</button>
        </dialog>
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} Type = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    )
}

function WidgetButtons(props) {

    const { privacyLevel, id, setRemovedId, widgetSettings } = props;

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const removeWidget = (e) => {
        const confirmBox = window.confirm(
            'Удалить текущую тханку? Ее нельзя будет восстановить'
        );
        if (confirmBox === true) {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'site/site.php',
                headers: { "content-type": "multipart/form-data" },
                data: { Id: id /*id: auth.data.id, login: auth.data.login*/, method: "removeWidget" }
            }).then((result) => {
                //window.location.assign(SITE + 'navigator/' + data.Thanka.ParentId);
                setRemovedId(id)
                setSystemMessageText("Виджет был удален");
                setSystemMessageType("success")
            }).catch((error) => {
                setRemovedId("")
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
        }
    }

    return (
        <>
        <div className='button-group'>
      
            {privacyLevel == 6 && //владелец
                <WidgetCreate type = {"edit"} widgetThankaId = {id} widgetSettings = {widgetSettings}/>
            }
            {privacyLevel >= 4 &&  //админ и владелец
                <input onClick={removeWidget} title={'Удалить виджет'} type='image' src={remove} />
            }
        </div>
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} Type = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    );
}


function SiteHeader(props) {
    const { data, location, defaultStyle } = props

    const thanka = data?.Thanka || {}
    const mainPage = data?.MainPage || {}

    const [bread, setBread] = useState(getBreadCrumbs())
    const [style, setStyle] = useState({})

    useEffect(() => {
        setBreadCrumbs(location.pathname, thanka.Name || "")
        setBread(getBreadCrumbs())
    }, [])

    return (
        <>
            {data?.PrivacyLevel == 6 && data?.Id == mainPage.ID && (
                <DesignEditor
                    setStyle={setStyle}
                    className={'.siteHeader'}
                    Id={data?.Id}
                    defaultStyle={defaultStyle}
                    hash={data?.Hash}
                />
            )}

            <div className='siteHeader' style={style}>
                <div>
                    <h2>{thanka.Name || ""}</h2>
                    <h4 dangerouslySetInnerHTML={{ __html: thanka.Annotation || "" }} />
                </div>

                <div className='parentAuthorLinks'>
                    {!thanka.MainPage && thanka.ParentName && (
                        <h5>
                            <a href={SITE + "sitepage/" + data?.ParentSitePage}>
                                {thanka.ParentName}
                            </a>
                        </h5>
                    )}

                    {thanka.Author && (
                        <h5>
                            <a href={SITE + "navigator/" + thanka.Author}>
                                {thanka.AuthorName || ""}
                            </a>
                        </h5>
                    )}
                </div>

                <div>
                    <Breadcrumb items={bread} />
                </div>
            </div>

            <SiteMenu data={data} style={{ "background-color": "transparent" }} />
        </>
    )
}

function getDefaultStyle(arr, selector, property, defaultStyle) {
    let result = defaultStyle
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == selector && arr[i][1][property] != undefined) {
            result = arr[i][1][property]
        }
    }
    return result
}

function DesignEditor(props) {

    const {setStyle, className, Id, defaultStyle, hash} = props

    const dialog = useRef(null)   

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const [backgroundColor, setBackgroundColor] = useState(getDefaultStyle(defaultStyle, className, 'background-color', "#ffffff"))
    const [color, setColor] = useState(getDefaultStyle(defaultStyle, className, 'color', "#000000"))
    const [headerColor, setHeaderColor] = useState(getDefaultStyle(defaultStyle, 'h', 'color', "#000000"))
    const [backgroundImage, setBackgroundImage] = useState(getDefaultStyle(defaultStyle, className, 'background-image', ""))
    const [backgroundRepeat, setBackgroundRepeat] = useState(getDefaultStyle(defaultStyle, className, 'background-repeat', "space"))
    const [backgroundPosition, setBackgroundPosition] = useState(getDefaultStyle(defaultStyle, className, 'background-position', "center"));
    const [backgroundSize, setBackgroundSize] = useState(getDefaultStyle(defaultStyle, className, 'background-size', "cover"));

    const [selectedPictureSend, setSelectedPictureSend] = useState(null);
    const [selectedPicCoord, setPicCoord] = useState({ left: null, top: null, width: null, height: null });

    const [linkColor, setLinkColor] = useState(getDefaultStyle(defaultStyle, 'a', 'color', "#000000")); // Чёрный цвет по умолчанию
    const [textSize, setTextSize] = useState(getDefaultStyle(defaultStyle, className, 'font-size', "14px")); // Размер текста по умолчанию

    const [textAlign, setTextAlign] = useState(getDefaultStyle(defaultStyle, className, 'text-align', "left"));

    const [design, setDesign] = useState(className + " " + JSON.stringify(defaultStyle))

    useEffect(() => {
        let link = getDefaultStyle(defaultStyle, className, 'background-image', "")
        if (link != "") {
            let img = new Image
            img.src = "http://"+link+"?"+hash
            setBackgroundImage(img)
            setSelectedPictureSend(img)
        } else {
            setBackgroundImage(null)
        }
    },[])

    useEffect(() => {

        let backUrl = "url('"+DIRPATH+'/styles/'+className.replace(".","")+Id+".jpg')"
       
        let classObj = {
            'background-color': backgroundColor,
            'color': color,
            'font-size': textSize,
            'text-align': textAlign,
        }
        if (selectedPictureSend != null) {
            classObj["background-image"] = backUrl
            classObj['background-position'] = backgroundPosition
            classObj['background-repeat'] = backgroundRepeat
            classObj['background-size'] = backgroundSize
        }
        let classStyle = className + " " + JSON.stringify(classObj)
        let linkStyle = className + " a " + JSON.stringify({'color': linkColor,'text-align': textAlign})
        let headerStyle = className + " h1, "+ className + " h2, "+ className + " h3, "+className + " h4, "+className + " h5, "+className + " h6 "+ JSON.stringify({'color': headerColor,'text-align': textAlign})
        setDesign(classStyle+'\n'+linkStyle+'\n'+headerStyle)
    },[backgroundColor, backgroundImage, backgroundPosition, backgroundRepeat, color, headerColor, linkColor, textSize, selectedPictureSend, backgroundSize])

    const saveDesign = (e) => {
        dialog.current.close()
        setStyle({
            'backgroundColor': backgroundColor,
            'color': color,
            'font-size': textSize,
            'text-align': textAlign
        })
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'site/site.php',
            headers: { "content-type": "multipart/form-data" },
            data: { 
                Id: Id, 
                method: "setStyle", 
                content: design,
                classname: className.replace(".",""),
                picture: selectedPictureSend, 
                PictureCoords: selectedPicCoord,
            },
        }).then((result) => {   
            setSystemMessageText("Дизайн установлен. Перезагрузите страницу для просмотра");
            setSystemMessageType("success")
        }).catch((error) => {
        })
    }

    return (
        <div>
            <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
            <input onClick={(e) => dialog.current.showModal()} title={'Изменить внешний вид'} type='image' src={colors} />
            <dialog ref={dialog} id='headercolors'>
                <div>
                    <label>Цвет фона<input type='color' value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} /></label>
                    <label>Цвет текста<input type='color' value={color} onChange={(e) => setColor(e.target.value)} /></label>
                    <label>Фоновое изображение</label>
                    <ThankaPic
                        setSelectedPictureSend={setSelectedPictureSend}
                        setPicCoord={setPicCoord}
                        selectedPicCoord={selectedPicCoord}
                        backgroundImage={backgroundImage}
                        type={'sitepage'}
                        dataCenterImage={0}
                        dataId={Id}
                        dataHash={hash}
                    />
                    { selectedPictureSend != null &&
                    <>
                    <label htmlFor="background-repeat">Выберите как повторять фоновый рисунок:
                        <select
                            id="background-repeat"
                            value={backgroundRepeat}
                            onChange={(e) => setBackgroundRepeat(e.target.value)}
                        >
                            <option value="no-repeat">не повторять</option>
                            <option value="repeat">повторять</option>
                            <option value="repeat-x">повторять по горизонтали</option>
                            <option value="repeat-y">повторять по вертикали</option>
                        </select>
                    </label>
                    <label htmlFor="background-position">Выберите расположение фонового рисунка:
                        <select
                            id="background-position"
                            value={backgroundPosition}
                            onChange={(e) => setBackgroundPosition(e.target.value)}
                        >
                            <option value="top left">вверху слева</option>
                            <option value="top center">вверху по центру</option>
                            <option value="top right">вверху справа</option>
                            <option value="center left">по центру слева</option>
                            <option value="center">по центру</option>
                            <option value="center right">по центру справа</option>
                            <option value="bottom left">внизу слева</option>
                            <option value="bottom center">внизу по центру</option>
                            <option value="bottom right">внизу справа</option>
                        </select>
                    </label>
                    <label htmlFor="background-size">Выберите размер фона:</label>
                    <select
                        id="background-size"
                        value={backgroundSize}
                        onChange={(e) => setBackgroundSize(e.target.value)}
                    >
                        <option value="cover">Растянуть с обрезкой по ширине/высоте</option>
                        <option value="contain">Растянуть без обрезки</option>
                        <option value="auto">автоматически</option>
                    </select>
                    </>
                    }
                    <label htmlFor="link-color">Выберите цвет ссылок:</label>
                    <input
                        type="color"
                        id="link-color"
                        value={linkColor}
                        onChange={(e) => { setLinkColor(e.target.value); }}
                    />
                    <label htmlFor="header-color">Выберите цвет заголовков:</label>
                    <input
                        type="color"
                        id="header-color"
                        value={headerColor}
                        onChange={(e) => { setHeaderColor(e.target.value); }}
                    />
                    <label htmlFor="text-size">Выберите размер текста:</label>
                    <select
                        id="text-size"
                        value={textSize}
                        onChange={(e) => { setTextSize(e.target.value); }}
                    >
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                    </select>
                    <label htmlFor="text-align">Выберите расположение текста:</label>
                    <select
                        id="text-align"
                        value={textAlign}
                        onChange={(e) => setTextAlign(e.target.value)}
                    >
                        <option value="left">По левому краю</option>
                        <option value="center">По центру</option>
                        <option value="right">По правому краю</option>
                        <option value="justify">По ширине</option>
                    </select>
                    <button onClick={(e) => saveDesign()}>Сохранить</button>
                    <button onClick={(e) => dialog.current.close()}>Отменить</button>
                </div>
            </dialog>
        </div>
    )
}

function WidgetList(props) {

    const {data, content, user} = props

    const [removedId, setRemovedId] = useState("")
    const [list, setList] = useState(content)

    useEffect(() => {
        if (removedId != "") {
            let i = list.findIndex((elem) => elem.ID == removedId)
            list.splice(i, 1)
            setList(list.slice())
        }
    },[removedId])

    return (
        <>
        {list != null && list.map((item) => (
            <div style = {{"border": "1px"}}>
                <WidgetButtons 
                    id = {item.ID} 
                    setRemovedId = {setRemovedId} 
                    privacyLevel = {data.PrivacyLevel} 
                    contentLength = {data.Content.length != null ? data.Content.length : 0}
                    widgetSettings = {item}                
                />
                <Widget id = {item.Thanka} meta = {item} user = {user}/>
            </div>
        ))}
        </>
    )
}

function Widget(props) {
    const {id, meta, user} = props

    const [data, setData] = useState(null)

    useEffect(() => {
        axios({
            method: "post",
            url: PATH + 'thanka/getThanka.php',
            data: JSON.stringify({ id: user.id, login: user.login, address: '/lite/' + id}),
            headers: { "content-type": "application/json" },
        }).then((result) => {
            const response = result.data

            if (!response) {
                console.warn("Widget getThanka empty response", { id })
                return
            }

            if (response.Error === true) {
                console.warn("Widget getThanka fallback response", response)
            }

            setData(response)
        }).catch((error) => {
            console.error("Widget getThanka request failed", id, error)
        })
    }, [id, user.id, user.login])

    return (
        <>
        {data !== null &&
            <ViewerLite data={data} mainId={id} meta={meta} user={user} />
        }
        </>
    )
}
function SiteMenu(props) {

    const {data} = props
    const [items, setItems] = useState([])

    useEffect(() => {
        let arr = []
        for (let i = 0; data.Children != null && i < data.Children.length; i++) {
            let item = {}
            item.label = <a href={data.MainPage.Url != "" ? SITE+data.Children[i].Url : SITE+'sitepage/'+data.Children[i].ID}>{data.Children[i].Name}</a>
            item.key = i
            arr.push(item)
        }
        setItems(arr)
    },[data.Children])
      
    const [current, setCurrent] = useState('');
    
    const onClick = (e) => {
        setCurrent(e.key);
    };
    
    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

function cssParser(arr) {
    for (let i = 0; i < arr.length; i++) {
        let string = arr[i][1]
        //if (string == "")
        string = string.replace("http://","")
        let mainstring = string.split(/\{|\}|\;|\:/)
        let len = mainstring.length
        mainstring[0] = "{"
        mainstring[len-1] = "}"
        for (let i = 1; i < len - 1; i++) {
            mainstring[i] = "\""+mainstring[i]+"\""
        }
        for (let i = 1; i < len - 2; i++) {
            mainstring[i] = mainstring[i]+":"+mainstring[i+1]
            if (i+1 != len - 2) {
                mainstring[i+1] = ","
            } else {
                mainstring[i+1] = ""
            }
            i++
        }
        mainstring = mainstring.join("")
        arr[i][1] = JSON.parse(mainstring)
    }
    return arr
}

function getCSSProperty(array, property) {
    let string = ""
    let stylearr = []
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][0] == property) {
                stylearr.push(array[i])
            }
        }
        for (let i = 0; i < stylearr.length; i++) {
            if (stylearr[i].length > 2) {
                stylearr[i][0] = stylearr[i][1][0]
            }
            string = stylearr[i][stylearr[i].length-1].toString().replace("url('",'')
            string = string.replace("')",'')
            string = string.replace("!important","")
            string = string.replace("\r","")
            string = string.replace("\n","")
            stylearr[i][1] = string
            stylearr[i].splice(2, stylearr[i].length-1)
        }
    }
    return stylearr
}

function getCSSArray(string) {
    if (string == "") return ""
    let styleArr = string.split("\n")
    for (let i = 0; i < styleArr.length; i++) {
        styleArr[i] = styleArr[i].split(" ")
    }
    return styleArr
}

function MainContent(props) {

    const {data, user, auth, defaultStyle} = props

    const [style, setStyle] = useState({})

    return (
        <>
            {data.PrivacyLevel == 6 && (data.Id == data.MainPage.ID) &&
                <DesignEditor setStyle = {setStyle} className = {'.main'} Id = {data.Id} defaultStyle = {defaultStyle} hash = {data.Hash}/> 
            }       
            <section className='cogicontainer' style = {style}>
                <a name="top"></a>
                <AdminMessage thankaId = {data.Id}/>
                <WidgetList data = {data} content = {data.Content} user = {user}/>
                { ((data.PrivacyLevel >= 1 && data.Thanka.Comments == true) || (data.PrivacyLevel == 6)) &&
                    <Comment thanka = {data.Thanka.Id} avatarlist = {data.AvatarList} auth = {auth.data} adminprivacy = {data.PrivacyLevel} />  
                }
            </section>
        </>
    )
}

function SiteComponent(props) {
    const { data, user, auth } = props

    const thanka = data?.Thanka || {}
    const styleValue = data?.Style
    const hash = data?.Hash || ""
    const privacy = thanka?.Privacy

    const [defaultCSS, setDefaultCSS] = useState(
        styleValue != undefined ? getCSSArray(styleValue) : []
    )

    let location = useLocation()

    useEffect(() => {
        pushHistory(location.pathname)
        // setBreadCrumbs(location.pathname, thanka.Name)
    }, [])

    if (!data || data.Id == null || data.Thanka == null) {
        return (
            <div className='main'>
                <div className='thankaName'>
                    <h3>Страница временно недоступна</h3>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='main'>
                <SiteHeader
                    data={data}
                    location={location}
                    defaultStyle={cssParser(getCSSProperty(defaultCSS, '.siteHeader'))}
                    hash={hash}
                />

                <div className='button-menu'>
                    {((privacy == 3 && (data.AdmittedSubscribe == true || data.PrivacyLevel >= 4)) ||
                        (privacy != 3)) && (
                        <SiteButtons data={data} auth={auth} />
                    )}
                </div>

                <MainContent
                    data={data}
                    location={location}
                    defaultStyle={cssParser(getCSSProperty(defaultCSS, '.main'))}
                    hash={hash}
                    auth={auth}
                    user={user}
                />

                <div className='interface_buttons'>
                    <a href="#top">Наверх</a>
                    <a onClick={(e) => backHistory()}>Назад</a>
                </div>
            </div>
        </>
    )
}
export default SiteComponent;