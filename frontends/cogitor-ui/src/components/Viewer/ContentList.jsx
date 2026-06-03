import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from "axios";
import {PATH, SITE, DIRPATH} from "../../utils/url.js";
import { Link } from "react-router-dom";
import { useMediaQuery } from 'react-responsive'

import {Pagination} from 'antd';

import { ThankaSearch } from '../Editor/ThankaSearch.jsx';

import "../../style/thanka.css"

import removeimg from '../../icons/remove.png';
import eye from '../../icons/eyeopen.png';
import add_article from '../../icons/add_article.png';

import { SystemMessage } from './SystemMessage.jsx';

function ContentList(props) {

    const {content, type, privacy, data, hash, style, header } = props

    const [arr, setArr] = useState(content !== null && content !== undefined ? content.slice() : [])
    const [current, setCurrent] = useState(arr.slice(0,10))

    useEffect(() => {
        setCurrent(arr.slice(0,10))
    }, [arr])

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const removeLink = (id, i) => {
        axios({ 
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: {"content-type": "multipart/form-data"},
            data: { LinkID: id, method: "removeLink" }   
        }).then((result) => {
            let array = arr.slice()
            array.splice(i, 1)
            setArr(array)
            setSystemMessageText("Ссылка удалена");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    useEffect(() => {
        let array = arr.slice()
        for (let i = 0; i < array.length; i++) {
            if (type == "sitelist") {
                array[i].address = (SITE + 'sitepage/' + array[i].ID)
            } else {
                array[i].address = (type == "document" ? SITE + 'navigator/' + array[i].DocumentPath : SITE + 'navigator/' + array[i].ID)
            }
        }
        setArr(array)
    },[])

    const onChangePage = (page, pageSize) => {
        setCurrent(arr.slice((page-1) * pageSize, page * pageSize))
    }


    const isBigScreen = useMediaQuery({query : '(min-width: 980px)'});

    return (
        <div className='contentList' style={style}>
            <h4>
                {header}
                {type == 'rightLink' && data.AvatarList != null &&
                    <Link to={{ pathname: "/add", state: { data: data } }}>
                        <input title = {'Создать новость'} id="add_article" type='image' src={add_article}/>
                    </Link>
                }
            </h4>
            {arr.length > 0 &&
            <>
            {content.length > 10 &&
                <ThankaSearch content = {content} setData = {setArr} />
            }
            <table>
            <tbody>
            {current.map((elem, i) => (
                <React.Fragment key={(elem.LinkID != null ? elem.LinkID : (elem.ID != null ? elem.ID : 'row')) + '-' + i}>
                    {!(elem.Type != undefined && elem.Type == 'category') &&
                    <>
                        { isBigScreen && 
                        <>
                        <tr>
                            <td className="pic" rowSpan={'2'}>
                            <a href={elem.address}>
                                {elem.Image == 1 ?
                                    <img className='thankaPic' src={DIRPATH + "/image" + elem.ID + '.jpg?' + hash} width={50} />
                                    :
                                    <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                                }
                            </a>
                            </td>
                            <td className='tableName'>
                                    <a href={elem.address}>{elem.ID + ": " + elem.Name}</a>
                            </td>
                                <td className="eye" rowSpan={'2'}>
                                    <img src={eye} width={15} />
                                </td>
                                <td rowSpan={'2'}>
                                    {elem.ViewNum}
                                </td>
                            {privacy >= 4 && (type == 'catalog' || type == 'collection' || type == "leftLink") &&<td rowSpan={'2'}> 
                                
                                    <input
                                        onClick={() => removeLink(elem.LinkID, i)}
                                        type='image' src={removeimg}
                                        title='удалить из списка'
                                    />
                            
                            </td> }
                        </tr> 
                            <tr>
                                <td className='tableAnnotation'>
                                    <a href={elem.address}>
                                        { elem.Annotation != undefined &&
                                            <p 
                                                style={{ color: 'rgb(0,0,0,0.6)' }} 
                                                dangerouslySetInnerHTML={{ __html: elem.Annotation.slice(0, 500) }} 
                                            />
                                        }
                                    </a>
                                </td>
                            </tr>
                        </>
                        }
                        { !isBigScreen && 
                        <>
                        <tr>
                        <td className="pic">
                        <a href={elem.address}>
                            {elem.Image == 1 ?
                                <img className='thankaPic' src={type != "sitelist" ? DIRPATH + "/image" + elem.ID + '.jpg?' + hash : DIRPATH + "/image" + elem.Thanka + '.jpg?' + hash} width={50} />
                                :
                                <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                            }
                        </a>
                        </td>
                        <td className='tableName'>
                                <a href={elem.address}>{elem.ID + ": " + elem.Name}</a>
                        </td>
                        { privacy >= 4 && (type == 'catalog' || type == 'collection' || type == "leftLink") &&
                            <td> 
                                <input
                                    onClick={() => removeLink(elem.LinkID, i)}
                                    type='image' src={removeimg}
                                    title='удалить из списка'
                                />
                            </td>
                        }
                        </tr>
                        </>
                        }
                    </>
                    }
                </React.Fragment>
            ))}
            </tbody>
            </table>
            {arr.length > 10 && 
                <Pagination defaultCurrent={1} onChange = {onChangePage} align = {'center'} total = {arr.length}/>
            }
            </>
            
            }
            <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </div>
    );
}

export default ContentList;
