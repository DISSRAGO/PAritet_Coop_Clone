import React, { useEffect, useState } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector.ts';
import axios from 'axios';
import {PATH} from "../../utils/url.js";
import { DIRPATH } from '../../utils/url.js';

import TableSort from './TableSort.jsx';

import angledown from '../../icons/angledown.png';
import angleup from '../../icons/angleup.png';
import arrowToBottom from '../../icons/arrow_to_bottom.png';

import { SystemMessage } from '../Viewer/SystemMessage.jsx';
import { ThankaSearch } from '../Editor/ThankaSearch.jsx';

function ButtonUp(props) {

    const {parentId} = props

    return(
        <>
        {parentId === undefined || parentId == '' ? 
            <></> 
            :
            <input onClick = {props.onClick.bind(this, parentId)} title = {'На уровень выше'} type='image' src={angleup} width={20}/>
        }
        </>
    );
}

function TableViewer(props) {

    const {hash, setHash, data, list, state, mainId} = props;    
    const auth = useTypedSelector((state) => state.user.headerInfo);

    const [arrData, setArrData] = useState(list != null && list != undefined ? list.slice() : [])

    useEffect(() => {
        if (state == 'tableMove') {
            onClickUp(parentId);
        } else setArrData(list != null && list != undefined ? list.slice() : []);
    }, [state]);

    const [parentId, setParentId] = useState(data.Thanka.ParentId);
    const [inputThanka, setInputThanka] = useState("");

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const [mainTr, setMainTr] = useState({
        Id: data.Id,
        Name: data.Thanka.Name,
        Date: data.Thanka.DateCreate,
        Type: data.Object.Type,
        Image: data.CenterImage,
        DocumentPath: data.Thanka.DocumentPath,
        OthersMakeChildren: data.Thanka.OthersMakeChildren,
        Mine: data.PrivacyLevel == 6 ? true : false
    });

    let style = {display: 'none'};
    switch (state) {
        case 'unvisible': {
            style = {display: 'none'};
            break;
        }
        default: {
            style = {display: 'table'};
            break;
        }
    }

    function onClickMove(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: {who: data.Id, where: id, Login: auth.data.login, UserId: auth.data.id, method: "moveThanka"},
        })
        .then((result) => {
            window.location.assign('/navigator/'+id);
        })
        .catch((error) => {
            setSystemMessageText(error.response.data.Text);
            setSystemMessageType("error")
        })
    }

    function onClickLink(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data"},
            data: {from: data.Id, to: id, method: "addLink"},
        }).then((result) => {
            setSystemMessageText("Ссылка создана");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText(error.response.data.Text);
            setSystemMessageType("error")
        })
    }

    function onClickUp(parentId) {
        if (parentId !== undefined) {
            axios({
                method: "post",
                url: PATH + 'thanka/getThanka.php',
                data: JSON.stringify({ id: auth.data.id, login: auth.data.login, address: '/navigator/'+parentId}),
                headers: { "content-type": "application/json" },
            }).then((result) => {
                if (result.data.PrivacyLevel != 0) {
                    setArrData(result.data.Children != null ? result.data.Children.slice(): []);
                    setParentId(result.data.Thanka.ParentId);
                    setMainTr({ Id: result.data.Id, 
                                Name: result.data.Thanka.Name,
                                Date: result.data.Thanka.DateCreate, 
                                Type: result.data.Object.Type, 
                                Image: result.data.CenterImage, 
                                DocumentPath: result.data.Thanka.DocumentPath,
                                OthersMakeChildren: result.data.Thanka.OthersMakeChildren,
                                Mine: result.data.PrivacyLevel == 6 ? true : false
                    });
                    setHash(result.data.Hash)
                } else {
                    setSystemMessageType("warning")
                    setSystemMessageText("Нет доступа");
                }
            }).catch((error) => {
                setSystemMessageText("Ошибка");
                setSystemMessageType("error")
            })
        }
    }

    function onClickExpand(id, DocPath) {
        let path = DocPath == undefined ? id : DocPath + "/" + id;
        axios({
            method: "post",
            url: PATH + 'thanka/getThanka.php',
            data: JSON.stringify({ id: auth.data.id, login: auth.data.login, address: '/navigator/'+ path }),
            headers: { "content-type": "application/json" },
        }).then((result) => {
            setArrData(result.data.Children !== null ? result.data.Children.slice() : []);
            setParentId(result.data.Thanka.ParentId);
            setMainTr({ Id: result.data.Id, 
                        Name: result.data.Thanka.Name, 
                        Date: result.data.Thanka.DateCreate, 
                        Type: result.data.Object.Type, 
                        Image: result.data.CenterImage, 
                        Mine: result.data.PrivacyLevel == 6 ? true : false,
                        DocumentPath: result.data.Thanka.DocumentPath});
            setHash(result.data.Hash)
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

    return (
    <>
    {/* (state == 'thankalist' || state == 'tableCollection') && 
        <ThankaSearch content = {list} setData = {setArrData}/>
    */}
        <table className="table" style={style}>
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
            <th>{"Действие"}</th>
          </tr>
        { state != 'thankalist' && state != 'tableCollection' && mainTr !== undefined &&  
            <tr>
                <td><strong>{mainTr.Id}</strong></td>
                <td>
                    {mainTr.Image == 1 
                        ? <img src={DIRPATH + "/image" + mainTr.Id + '.jpg?' + hash} width={50} />
                        : <img src={DIRPATH + "/empty.jpg"} width={50} />
                    }
                </td>
                <td>
                    <strong> 
                        { mainTr.DocumentPath != undefined 
                            ? <a href={'/navigator/' + mainTr.DocumentPath}>{mainTr.Name}</a>
                            : <a href={'/navigator/' + mainTr.Id}>{mainTr.Name}</a>
                        }   
                    </strong>
                </td>
                <td>
                    {(((state != "tableEditor") || (state == "tableEditor" && mainTr.Type == "catalog")) && (state == 'simpleTable' && mainId != undefined && mainTr.Id != mainId)) && (
                            <ButtonUp parentId={parentId} onClick={onClickUp} />
                    )}
                    
                    {state == 'tableMove' && mainTr.Id != props.data.Id &&
                        (mainTr.OthersMakeChildren == true || mainTr.OthersMakeChildren == 'true' || mainTr.Mine == "true" || mainTr.Mine == true) &&
                        mainTr.Id != data.Thanka.ParentId &&
                        <input onClick={onClickMove.bind(this, mainTr.Id)} title = {'Переместить'} type='image' src={arrowToBottom} width={20}/>
                    }
                </td>
            </tr>
        }
          {arrData != null && arrData.map((arr) => (
            <tr>
              <td>{arr.ID}</td>
              <td>
                { arr.Image == 1 && <img src = {DIRPATH + "/image" + arr.ID + ".jpg?" + hash} width={50}/>}
                { arr.Image == 0 && <img src = {DIRPATH + "/empty.jpg"} width={50}/> }
              </td>
              <td>{arr.DocumentPath != undefined ? 
                    <a href={'/navigator/' + arr.DocumentPath}>{arr.Name}</a>
                    :
                    <a href={'/navigator/'+arr.ID}>{arr.Name}</a>
                }
                </td>
              <td>                
                {(state == "simpleTable" || state == "tableEditor" || state == "tableLink" || (state == 'tableMove' && arr.ID != props.data.Id)) && 
                    <input onClick = {onClickExpand.bind(this, arr.ID, arr.DocumentPath)} title = {'Развернуть'} type='image' src={angledown} width={20}/>
                }
                { state == 'tableMove' && arr.ID != props.data.Id && 
                    (arr.OthersMakeChildren == true || arr.OthersMakeChildren == 'true' || arr.Mine == "true" || arr.Mine == true ) &&
                    <input onClick={onClickMove.bind(this, arr.ID)} title = {'Переместить'} type='image' src={arrowToBottom} width={20}/>
                }
                { state == 'tableLink' && arr.ID != props.data.Id &&
                    <button onClick = {onClickLink.bind(this, arr.ID)}>{'Добавить ссылку'}</button>
                } 
                { state == 'tableEditor' && arr.ParentId != '' && arr.ParentId !== undefined &&
                    <ButtonUp parentId={arr.ParentId} onClick={onClickUp} />
                }                
              </td>
            </tr>
          ))}
          {(state == 'tableMove' || state == 'tableLink') &&
            <tr>
                <td>Введите номер тханки</td>
                <td colSpan={2}>
                    <input onChange = {(e) => setInputThanka(e.target.value)}></input>
                </td>
                <td>
                { state == 'tableMove' && 
                    <button onClick = {onClickMove.bind(this, inputThanka)}>{'Переместить'}</button>
                }
                { state == 'tableLink' && 
                    <button onClick = {onClickLink.bind(this, inputThanka)}>{'Добавить ссылку'}</button>
                }
                </td>
            </tr>
        }
        </tbody>
      </table>
      <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function EditorTableViewer(props) {

    const {hash, list, state} = props;    

    const [arrData, setArrData] = useState(list != null && list != undefined ? list.filter(item => item.ParentId == undefined) : [])

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const [mainTr, setMainTr] = useState(null);

    let style = {display: 'none'};
    switch (state) {
        case 'unvisible': {
            style = {display: 'none'};
            break;
        }
        default: {
            style = {display: 'table'};
            break;
        }
    }

    function onClickUp(parentId) {
        if (parentId !== undefined) {
            let elem = list.find(item => item.ID == parentId)
            setMainTr({
                Id: elem.ID,
                Name: elem.Name,
                Image: elem.Image,
                ParentId: elem.ParentId,
                Annotation: elem.Annotation
            })
        }
        else {
            setMainTr(null)
        }
        setArrData(list.filter((ch) => ch.ParentId == parentId))
    }

    function onClickExpand(id) {
        let elem = list.find(item => item.ID == id)
        setMainTr({
            Id: elem.ID,
            Name: elem.Name,
            Image: elem.Image,
            ParentId: elem.ParentId,
            Annotation: elem.Annotation
        })
        setArrData(list.filter((ch) => ch.ParentId == id))
    }

    return (
    <>
        <ThankaSearch content = {list} setData = {setArrData}/>
        <table className="table" style={style}>
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
            <th>{"Аннотация"}</th>
            <th>{"Действие"}</th>
          </tr>
        { mainTr != undefined && mainTr != null && mainTr != "" && mainTr != {} &&
            <tr>
                <td><strong>{mainTr.Id}</strong></td>
                <td>
                    {mainTr.Image == 1 
                        ? <img src={DIRPATH + "/image" + mainTr.Id + '.jpg?' + hash} width={50} />
                        : <img src={DIRPATH + "/empty.jpg"} width={50} />
                    }
                </td>
                <td>
                    <strong> 
                        { mainTr.DocumentPath != undefined 
                            ? <a href={'/navigator/' + mainTr.DocumentPath}>{mainTr.Name}</a>
                            : <a href={'/navigator/' + mainTr.Id}>{mainTr.Name}</a>
                        }   
                    </strong>
                </td>
                <td>
                <p dangerouslySetInnerHTML={{ __html: mainTr.Annotation.slice(0, 500) }}></p>
                </td>
                <td>
                    <input onClick = {onClickUp.bind(this, mainTr.ParentId)} title = {'На уровень выше'} type='image' src={angleup} width={20}/>
                </td>
            </tr>
        }
          {arrData != null && arrData.map((arr) => (
            <tr>
              <td>{arr.ID}</td>
              <td>
                { arr.Image == 1 && <img src = {DIRPATH + "/image" + arr.ID + ".jpg?" + hash} width={50}/>}
                { arr.Image == 0 && <img src = {DIRPATH + "/empty.jpg"} width={50}/> }
              </td>
              <td>{arr.DocumentPath != undefined ? 
                    <a href={'/navigator/' + arr.DocumentPath}>{arr.Name}</a>
                    :
                    <a href={'/navigator/'+arr.ID}>{arr.Name}</a>
                }
                </td>
                <td>
                    <p dangerouslySetInnerHTML={{ __html: arr.Annotation.slice(0, 500) }}></p>
                </td>
              <td>         
                <input onClick = {onClickExpand.bind(this, arr.ID, arr.DocumentPath)} title = {'Развернуть'} type='image' src={angledown} width={20}/>    
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function TableInterface(props) {

    const {list, state, data, mainId} = props

    const [hash, setHash] = useState("")
    const [tableSort, setTableSort] = useState(false)    

    const arrData = list != null && list != undefined && state != 'tableMove' ? list.slice() : [];
    const mainTr = {
        Id: data.Id,
        Mine: data.PrivacyLevel == 6 ? true : false
    } 

    return (
        <> { mainTr !== undefined && 
        <>
            <div className='sortButtons'>
            {
                mainTr.Id == data.Id && tableSort == false && mainTr.Mine == true && state == 'simpleTable' && list != null &&
                <button onClick={setTableSort.bind(this, true)}>Отсортировать тханки</button>
            }
            </div>
            { tableSort ?
                <TableSort data = {arrData} hash = {hash} setTableSort = {setTableSort}/>
                :
                <>
                {state == 'tableEditor' ?
                    <EditorTableViewer 
                        list = {list}
                        hash = {hash} 
                        state = {state}
                    />
                :
                    <TableViewer 
                        list = {list}
                        data = {data}
                        hash = {hash} 
                        setHash = {setHash}
                        state = {state}
                        mainId = {mainId}
                    />
                }
                </>
            }
        </>
        }
    </>
    );
}

export default TableInterface;
