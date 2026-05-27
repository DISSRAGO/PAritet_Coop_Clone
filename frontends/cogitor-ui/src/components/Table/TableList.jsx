import React, { useEffect, useState } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector.ts';
import axios from 'axios';
import {PATH} from "../../utils/url.js";
import { DIRPATH } from '../../utils/url.js';
import { useMediaQuery } from 'react-responsive';

import {Table} from "antd"

import { russianTypes } from '../../utils/language_ru.js';
import { getFilterList } from '../Viewer/CogRequest.jsx';

import { SystemMessage } from '../Viewer/SystemMessage.jsx';
import { ThankaSearch } from '../Editor/ThankaSearch.jsx';

import { PictureFromMPT } from '../Viewer/CogObject.jsx';

import {Pagination} from 'antd';

function TableList(props) {

    const { list, data } = props
    
    const auth = useTypedSelector((state) => state.user.headerInfo);

    const {state} = props

    useEffect(() => {
        if (state == 'tableMove') {
            onClickUp(data.Thanka.ParentId);
        } else setArrData(list != null && list != undefined ? list.slice() : []);
    }, [state]);

    const hash = data.Hash;

    const [arrData, setArrData] = useState(list != null && list != undefined ? list.slice() : []);
   
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const avatars = sessionStorage.getItem('isAuth') && data.AvatarList != null && data.AvatarList != undefined ? data.AvatarList.slice() : [];
    const [selectedAvatar, setSelectedAvatar] = useState(sessionStorage.getItem('isAuth') && avatars != [] ? avatars[0].ID : "");
    const [collectionName, setCollectionName] = useState("");
    const [createCollectionWindowStyle, setWinStyle] = useState({display: 'none'});

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

    function addToCollection(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { 
                "content-type": "multipart/form-data",
            },
            data: {collection: id, thanka: data.Id, method: "addToCollection"},
        }).then((result) => {
            setSystemMessageText("Добавлено");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

    function addToCatalog(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: {catalog: data.Id, thanka: id, method: "addToCatalog"},
        }).then((result) => {
            setSystemMessageText("Добавлено");
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }

    function getCollection() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            headers: { "content-type": "multipart/form-data" },
            data: {Login: auth.data.login, UserId: auth.data.id, method: "getCollections"},
        })
        .then((result) => {
            setArrData(result.data.List.slice());
        })
        .catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    function CreateCollection() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: {Name: collectionName, Avatar: selectedAvatar, method: "createFirstCollection"},
            headers: {"content-type": "multipart/form-data"},
        }).then((result) => {
            getCollection();
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })
    }
    return (
    <>
    {list != null && list.length > 10 &&
        <ThankaSearch content = {list} setData = {setArrData} />
    }
    {state == "tableCollection" && 
        <h4>Мои коллекции</h4>
    }
      <table className="table" style={style}>
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
           {/* <th>{"Дата создания"}</th> */}
            <th>{"Действие"}</th>
          </tr>
          {arrData.map((arr) => (
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
                {state == "tableList" && 
                    <button onClick = {addToCatalog.bind(this, arr.ID)}>{'Добавить'}</button>
                }
                {state == "tableCollection" && 
                    <button onClick = {addToCollection.bind(this, arr.ID)}>{'Добавить'}</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {state == "tableCollection" && arrData.length == 0 &&
        <>
        <button onClick = {setWinStyle.bind(this,{display: 'block'})}>Создать коллекцию</button>
        <div style={createCollectionWindowStyle} className='lil-container'>
            <p>Выберите аватар:</p>
            <select onChange={(e) => setSelectedAvatar(e.target.value)}>
                {avatars.map((avatar) => (
                    <option value={avatar.ID}>{avatar.Name}</option>
                ))}
            </select>
            <p>Введите название:</p>
            <input onChange={(e) => setCollectionName(e.target.value)}/>
            <button onClick = {CreateCollection.bind(this)}>Создать</button>
        </div>
        </>
      }
    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function SimpleTableList(props) {

    const { list, hash } = props

    const [filterData, setFilterData] = useState(list != null && list != undefined ? list.slice() : []);
    const [currentArr, setCurrentArr] = useState([])

    const [changed, setChanged] = useState(false)

    useEffect(() => {
        setCurrentArr(list.slice(0,10))
        setChanged(false)
    },[list])

    useEffect(() => {
        setChanged(true)
        setCurrentArr(filterData.slice(0,10))
    },[filterData])
   
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const onChangePageList = (page, pageSize) => {
        setCurrentArr(list.slice((page-1) * pageSize, page * pageSize))
    }

    const onChangePageArr = (page, pageSize) => {
        setCurrentArr(filterData.slice((page-1) * pageSize, page * pageSize))
    }
    
    return (
    <>
    {list != null && list.length > 10 &&
        <ThankaSearch content = {list} setData = {setFilterData}/>
    }
      <table className="table">
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
            <th>{"Аннотация"}</th>
          </tr>
          {currentArr.map((arr) => (
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
                    <p dangerouslySetInnerHTML={{ __html: arr.Annotation != undefined ? arr.Annotation.slice(0,500) : "" }}></p>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    
    {list.length > 10 && !changed &&
        <Pagination defaultCurrent={1} onChange = {onChangePageList} align = {'center'} total = {list.length}/>
    }
    {filterData.length > 10 && changed &&
        <Pagination defaultCurrent={1} onChange = {onChangePageArr} align = {'center'} total = {filterData.length}/>
    }
    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function SimpleProductList(props) {

    const { list, hash, setProductLink, setProductCategory, productLink } = props

    const OLD_MARKET = "https://market.paritet.coop/"
    const NEW_MARKET = "https://m.paritet.coop/"

    const OLD_STEND = "https://stend.dom.nsk.ru/stend/group/251500/"
    const NEW_STEND = "http://opencart.stend.nsk.ru/"

    const [tableData, setTableData] = useState(list)

    const [filterData, setFilterData] = useState(list != null && list != undefined ? list.slice() : []);
    const [currentArr, setCurrentArr] = useState([])

    const [changed, setChanged] = useState(false)


    const isBigScreen = useMediaQuery({ query: '(min-width: 980px)' });

    useEffect(() => {
        let arr = list.slice()
        setTableData(arr)
    },[list])

    useEffect(() => {
        setChanged(true)
        setCurrentArr(filterData.slice(0,10))
    },[filterData])
   
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const selectProduct = (value) => {
        setProductCategory({id: value.ProductClassId, name: value.ProductClassName})
        setProductLink(value.Id)
    }

    const columnsTitle = [
        {
            title: "Номер",
            dataIndex: "Id",
            sorter: {
            }
        },
        {
            title: "Изображение",
            dataIndex: "Picture",
            render: (_,value) => <PictureFromMPT Id = {value.Id} className = {"productImgList"}/>
        },
        {
            title: "Название",
            dataIndex: "Name",
            sorter: {
            },
            render: (_,value) => <a href={NEW_STEND+"index.php?route=product/product&language=ru-ru&product_id="+value.Id}>{value.Name}</a>
        },
        {
            title: "Категория",
            dataIndex: "ProductClassName",
            sorter: {
            }
        },
        {
            title: "Действие",
            dataIndex: "Event",
            render: (_,value) => <>{productLink != value.Id && <button onClick={selectProduct.bind(this, value)}>Выбрать</button>}</>
        }
    ]

    return (
    <>
    {list != null && list.length > 10 &&
        <ThankaSearch content = {list} setData = {setFilterData}/>
    }    
    <Table columns={columnsTitle} dataSource={tableData} pagination={{position: ['bottomCenter']}} bordered/>
    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function SimpleThankaActionList(props) {

    const { list, hash, setLink, link } = props

    const [tableData, setTableData] = useState(list)

    const [filterData, setFilterData] = useState(list != null && list != undefined ? list.slice() : []);

    useEffect(() => {
        let arr = list.slice()
        setTableData(arr)
    },[list])

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const columnsTitle = [
        {
            title: "Номер",
            dataIndex: "ID",
            sorter: {
                compare: (a, b) => +a.Type >= +b.Type ? 1 : -1
            }
        },
        {
            title: "Изображение",
            dataIndex: "Picture",
            render: (_,value) => <img src = {value.Image == 1 ? DIRPATH + "/image" + value.ID + ".jpg?" + hash : DIRPATH + "/empty.jpg"} width={50}/>          
        },
        {
            title: "Название",
            dataIndex: "Name",
            sorter: {
                compare: (a, b) => a.Type >= b.Type ? 1 : -1
            },
            render: (_,value) => <a href={'/navigator/'+value.ID}>{value.Name}</a>
        },
        {
            title: "Аннотация",
            dataIndex: "Annotation",
            render: (_,value) => <p dangerouslySetInnerHTML={{ __html: value.Annotation != undefined ? value.Annotation.slice(0,200) : "" }}></p>
        },
        {
            dataIndex: "Type",
            title: "Тип",
            sorter: {
                compare: (a, b) => a.Type >= b.Type ? 1 : -1
            },
            filters: getFilterList("Type", tableData, "thanka"),
            onFilter: (value, string) => string.Type == value,
            render: (_, item) => (item.Type != undefined ? russianTypes(item.Type) : "")
        },
        {
            title: "Действие",
            dataIndex: "Event",
            render: (_,value) => <>{link != value.ID && <button onClick={setLink.bind(this, value.ID)}>Выбрать</button>}</>
        }
    ]

    return (
    <>
    {list != null && list.length > 10 &&
        <ThankaSearch content = {list} setData = {setFilterData}/>
    }    
    <Table columns={columnsTitle} dataSource={tableData} pagination={{position: ['bottomCenter']}} bordered/>
    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export function SimpleTvtList(props) {

    const { list, setTvtId, tvtId, tvtInfo } = props

    const [tvtFull, setTvtFull] = useState(tvtInfo != undefined ? tvtInfo : "")

    const [filterData, setFilterData] = useState(list != null && list != undefined ? list.slice() : []);
   
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const columnsTitle = [
        {
            title: "Название",
            dataIndex: "Name",
        },
        {
            title: "Описание",
            dataIndex: "Description",
        },
        {
            title: "Адрес",
            dataIndex: "Address",
        },
        {
            title: "Действие",
            dataIndex: "Event",
            render: (_, record) => record.Id !== tvtId && (
                <button onClick = {() => setTvt(record)}>Выбрать</button>
            )
        }
    ]

    const setTvt = (item) => {
        setTvtId(item.Id)
        setTvtFull(item)
    }

    useEffect(() => {
        setFilterData(list)
    },[list])

    return (
    <>
    {tvtId != "" && tvtFull != "" && tvtFull.Name != undefined && tvtFull.Address != undefined &&
        <h4><b>{tvtFull.Name+": "}</b>{tvtFull.Address}</h4>
    }
    { tvtId != "" &&
        <button onClick = {(e) => setTvtId("")}>Убрать ТВТ</button>
    }
    {list != null && list.length > 10 &&
        <ThankaSearch content = {list} setData = {setFilterData} type = {"tvt"}/>
    }
    <Table columns={columnsTitle} dataSource={filterData} pagination={{position: ['bottomCenter']}} bordered/>
    <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export default TableList;
