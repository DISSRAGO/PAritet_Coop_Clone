import React, { useState, useMemo, useEffect } from 'react';
import axios from "axios";
import {DIRPATH, SITE} from "../../utils/url.js";

import { ThankaSearch } from '../Editor/ThankaSearch.jsx';

import { PictureFromMPT, getProductLinks } from './CogObject.jsx';

import {Pagination, Table} from 'antd';

import "../../style/thanka.css"

import { russianTypes, DateForEditorZero, onlyDate, request_lang_switch, dateMonthWord } from '../../utils/language_ru.js';

function fieldCharacteristic(field, requestType) {

    let ch = {
        field: field,
        sort: true,
        type: "",
        translate: "",
        sortName: ""
    }

    switch (field) {
        case 'ID': { ch.type = 'string'; ch.translate = "Номер"; break }
        case 'Id': { ch.type = 'string'; ch.translate = "Номер"; break }
        case 'Name': { ch.type = 'string'; requestType == "thankaauthor" ? ch.translate = "Имя" : ch.translate = "Название"; break }
        case 'Author': { ch.type = 'string'; ch.translate = "Автор"; break }
        case 'Annotation': { ch.type = 'string'; ch.translate = "Аннонация"; ch.sort = false; break }
        case 'Description': { ch.type = 'string'; ch.translate = "Описание"; ch.sort = false; break }
        case 'Type': { ch.type = 'string'; ch.translate = "Тип тханки"; break }
        case 'HolderName': { ch.type = 'string'; ch.translate = "Имя пайщика"; break }
        case 'HolderAvatar': { ch.type = 'string'; ch.translate = "Страница в Когитеке"; ch.sort = false; break}
        case 'AccountNumber': { ch.type = 'string'; ch.translate = "Номер счета"; break }
        case 'HolderStatus': { ch.type = 'string'; ch.translate = "Статус пайщика"; break }
        case 'Date': { 
            ch.type = 'date'; 
            requestType == "shareholder" ? ch.translate = "Дата регистрации" : ch.translate = "Дата создания"; 
            ch.sortName = "date"; 
            break 
        }
        case 'CommentsNum': { ch.type = 'number'; ch.translate = "Количество комментариев"; ch.sortName = "comment"; break }
        case 'ToComments': { ch.type = 'number'; ch.translate = "Количество комментариев к тханкам"; break }
        case 'ViewNum': { ch.type = 'number'; ch.translate = "Количество просмотров"; ch.sortName = "view"; break }
        case 'LinksNum': { ch.type = 'number'; ch.translate = "Количество ссылок на тханки"; break }
        case 'ThankaNum': { ch.type = 'number'; ch.translate = "Количество тханок автора"; break }
        case 'Price': { ch.type = 'number'; ch.translate = "Цена"; ch.sortName = "price"; break }
        case 'Producer': { ch.type = 'string'; ch.translate = "Поставщик"; break }
        case 'Category': { ch.type = 'string'; ch.translate = "Категория"; ch.sortName = "category"; break }
        default: break;
    }

    return ch;
}

function normalDateTime(date) {
    let separator = '-';

    let datearr = date.split(separator);
    let time = datearr[2].slice(3,8)
    datearr[2] = datearr[2].slice(0,2);
      
    return (datearr[2] + "." + datearr[1] + "." + datearr[0] + ", " + time);
}

//дополнительная функция для сортировки объектов по выбранному полю
function byField(fieldName,sortorder){
    if (fieldName != "Name" && 
        fieldName != "Annotation" && 
        fieldName != 'HolderName' && 
        fieldName != 'AccountNumber' && 
        fieldName != "HolderStatus" && 
        fieldName != "HolderAvatar" &&
        fieldName != "Type" &&
        fieldName != "Date" &&
        fieldName != "ProducerName" &&
        fieldName != "ProductClassName"
        ) {
        if (sortorder == 'asc') {
            return (a, b) => +a[fieldName] >= +b[fieldName] ? 1 : -1;
        } else {
            return (a, b) => +a[fieldName] < +b[fieldName] ? 1 : -1;
        }
    } else {
        if (sortorder == 'asc') {
            return (a, b) => a[fieldName] >= b[fieldName] ? 1 : -1;
        } else {
            return (a, b) => a[fieldName] < b[fieldName] ? 1 : -1;
        }
    }
}

//поиск минимального и максимального значения в массиве объектов по выбранному полю
function countMinMax(list, field) {
    let arr = list.sort(byField(field,"asc"))
    let minmax = {
        min: arr[0][field],
        max: arr[arr.length -1][field]
    }
    return minmax
}

function getFieldsArr(filterFields,fields,list,queryName) {

    let arr = []
    for (let i = 0; i < filterFields.length; i++) {
        arr.push({
            field: filterFields[i],
            checked: true,
            translate: queryName != 'shareholder' ? russianTypes(filterFields[i]) : filterFields[i],
            type: 'type',
            min: "",
            max: "",
        })
    }

    //заполнение списков полей
    for (let i = 0; i < fields.length; i++) {
        let count = list.length != 0 ? countMinMax(list,fields[i]) : {min: 0, max: 0}
        let char = fieldCharacteristic(fields[i],queryName)
        arr.push({
            field: fields[i],
            min: char.type != "string" ? (char.type == "date" ? count.min : count.min) : "",
            max: char.type != "string" ? (char.type == "date" ? DateForEditorZero(count.max) : count.max) : "",
            translate: char.translate,
            type: char.type,
            checked: true,
        })
    }
    return(arr)
}

function RequestFilter(props) {

    const {queryName, filterArr, setFilterArr} = props

    //отслеживание галочек
    const onChangeFilter = (e) => {
        let arr = filterArr.slice()
        let check = arr.findIndex(item => item.field == e.target.value);
        arr[check].checked = e.target.checked
        setFilterArr(arr)
    }

    //смена значений фильтров
    const onChangeMin = (e) => {
        let arr = filterArr.slice()
        let check = arr.findIndex(item => item.field == e.target.name)
        arr[check].min = e.target.value
        setFilterArr(arr)
    }

    const onChangeMax = (e) => {
        let arr = filterArr.slice()
        let check = arr.findIndex(item => item.field == e.target.name)
        arr[check].max = e.target.value
        setFilterArr(arr)
    }

    return(
        <div className='requestEditor'>
            <div>
            {filterArr !== undefined && filterArr.length > 0 && 
                <>
                <h4>Фильтры</h4>
                {filterArr.map((field) => (
                    (field.type == 'number' || field.type == 'date') && (
                        <div key={field.field}>
                            <label><input type="checkbox" value={field.field} onChange={onChangeFilter} defaultChecked />{field.translate}</label>
                            {"от"}
                            <input name={field.field} onChange={onChangeMin} type={field.type} defaultValue={field.type == 'date' ? onlyDate(field.min) : field.min} />
                            {"до"}
                            <input name={field.field} onChange={onChangeMax} type={field.type} defaultValue={field.type == 'date' ? onlyDate(field.max) : field.max} />
                        </div>
                    )
                ))}
                </>    
            }
            </div>
        </div>
    )
}

function nameFilterByWords(arr) {
    let list = []
    for (let i = 0; i < arr.length; i++) {
        let temp = arr[i].split(" ");
        for (let j = 0; j < temp.length; j++) {
            list.push(temp[j])
        }
    }
}

function getColumnNames(fields, picture, content, type) {
    let arr = []

    if (fields.includes("Id")) arr.push({
        title: "№",
        dataIndex: "Id",
        sorter: {
            compare: byField("Id")
        }
    })
    if (fields.includes("ID")) arr.push({
        dataIndex: 'ID',
        title: "№",
        sorter: {
            compare: byField("ID")
        },
        render: (_, item) => (item.ID != undefined ? <a href={SITE + 'navigator/' + item.ID}>{item.ID}</a> : "")
    })
    if (fields.includes("Name")) arr.push({
        dataIndex: 'Name',
        title: (type == 'thankaauthor' ? "Имя" : "Название"),
        sorter: {
            compare: byField("Name")
        },
        render: (_, item) => type == "products" ? (item.Name != "" ? <a href={getProductLinks(item.Id).new}>{item.Name}</a> : "")
            : (item.Name != undefined ? <a href={SITE + 'navigator/' + item.ID}>{item.Name}</a> : "")

    })
    if (fields.includes("GroupName")) arr.push({
        dataIndex: 'Name',
        title: ("Название"),
        sorter: {
            compare: byField("Name")
        },
        render: (_, item) => (item.GroupAvatar != undefined ? <a href={SITE + 'navigator/' + item.GroupAvatar}>{item.Name}</a> : item.Name)
    })
    if (picture) arr.push({
        title: "Изображение",
        dataIndex: "Picture",
        render: (_, item) => type == 'products' ? (
            <a href={getProductLinks(item.Id).new}><PictureFromMPT Id={item.Id} className={"productImgList"} target="_blank"/></a>
        ) :
            (item.Image == 1 ?
                <a href={SITE + 'navigator/' + item.ID}><img className='thankaPic' src={DIRPATH + "/image" + item.ID + '.jpg'} width={50} /></a>
                :
                <a href={SITE + 'navigator/' + item.ID}><img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} /></a>
            )
    })
    if (fields.includes("Description")) arr.push({
        title: "Описание",
        dataIndex: "Description",
        render: (_, item) => ((item.Description != undefined ? item.Description.slice(0,200) : "")+" "+(item.ShortDescription != undefined ? item.ShortDescription.slice(0,200) : ""))
    })
    if (fields.includes("Producer")) arr.push({
        title: "Поставщик",
        dataIndex: "ProducerName",
        sorter: {
            compare: byField("ProducerName")
        },
        filters: getFilterList("ProducerName", content),
        onFilter: (value, string) => string.ProducerName == value,
    })
    if (fields.includes("Price")) arr.push({
        title: "Цена",
        dataIndex: "Price",
        sorter: {
            compare: byField("Price")
        }
    })
    if (fields.includes("Category")) arr.push({
        title: "Категория",
        dataIndex: "ProductClass",
        sorter: {
            compare: byField("ProductClassName")
        },
        filters: getFilterList("ProductClassName", content),
        onFilter: (value, string) => string.ProductClassName == value,
        render: (_, item) => (item.ProductClassName != undefined ? (
            item.ProductClass != undefined ?
                <a href={SITE + "navigator/" + item.ProductClass}>{item.ProductClassName}</a> :
                <p>{item.ProductClassName}</p>
        )
            : ""
        )
    })
    if (fields.includes("HolderName")) arr.push({
        title: "Имя пайщика",
        dataIndex: "HolderName",
        sorter: {
            compare: byField("HolderName")
        }
    })
    if (fields.includes("HolderAvatar")) arr.push({
        title: "Аватар в когитеке",
        dataIndex: "HolderAvatar",
        render: (_, item) => (item.AvatarId != "" ? <a href={SITE + 'navigator/' + item.AvatarId}>{item.HolderAvatar}</a> : "")
    })
    if (fields.includes("Date")) arr.push({
        title: (type == 'thankaauthor' ? "Дата регистрации" : "Дата создания"),
        dataIndex: "Date",
        sorter: {
            compare: byField("Date")
        },
        render: (_, item) => (item.Date != undefined ? dateMonthWord(item.Date) : "")
    })
    if (fields.includes("AccountNumber")) arr.push({
        title: "Номер счета",
        dataIndex: "AccountNumber"
    })
    if (fields.includes("HolderStatus")) arr.push({
        title: "Статус пайщика",
        dataIndex: "HolderStatus",
        sorter: {
            compare: byField("HoldeStatus")
        },
        filters: getFilterList("HolderStatus", content),
        onFilter: (value, string) => string.HolderStatus == value,
    })
    if (fields.includes("Author")) arr.push({
        dataIndex: 'Author',
        title: "Автор",
        sorter: {
            compare: byField("Author")
        },
        render: (_, item) => ((item.Author != undefined && item.AuthorName != undefined) ? <a href={SITE + 'navigator/' + item.Author}>{item.AuthorName}</a> : "")
    })
    if (fields.includes("Annotation")) arr.push({
        dataIndex: 'Annotation',
        title: "Аннотация",
        render: (_, item) => (item.Annotation.slice(0,200))
    })
    if (fields.includes("CommentsNum")) arr.push({
        dataIndex: "CommentsNum",
        title: "Количество комментариев",
        sorter: {
            compare: byField("CommentsNum")
        }
    })
    if (fields.includes("ToComments")) arr.push({
        dataIndex: "ToComments",
        title: "Количество комментариев к тханкам",
        sorter: {
            compare: byField("ToComments")
        }
    })
    if (fields.includes("ViewNum")) arr.push({
        dataIndex: "ViewNum",
        title: "Количество просмотров",
        sorter: {
            compare: byField("ViewNum")
        }
    })
    if (fields.includes("Type")) arr.push({
        dataIndex: "Type",
        title: "Тип",
        sorter: {
            compare: byField("Type")
        },
        filters: getFilterList("Type", content, "thanka"),
        onFilter: (value, string) => string.Type == value,
        render: (_, item) => (item.Type != undefined ? russianTypes(item.Type) : "" )
    })
    if (fields.includes("LinksNum")) arr.push({
        dataIndex: "LinksNum",
        title: "Количество ссылок на тханки",
        sorter: {
            compare: byField("LinksNum")
        }
    })
    if (fields.includes("ThankaNum")) arr.push({
        dataIndex: "ThankaNum",
        title: "Количество тханок автора",
        sorter: {
            compare: byField("ThankaNum")
        }
    }) 

    return arr
}

export function getFilterList(field,content,type) {
    let list = []
    for (let i = 0; content != undefined && i < content.length && field != ""; i++) {
        if (!list.find(item => item.value == content[i][field])) {
            list.push({value: content[i][field], text: (type == "thanka" ? russianTypes(content[i][field]) : content[i][field])})
        }
    }

    return list
}

function RequestTable(props) {

    const {content, fields, picture, type} = props

    const [tableColumn, setTableColumn] = useState(getColumnNames(fields, picture, content, type))

    const [tableList, setTableList] = useState(content.slice())

    useEffect(() => {      
        setTableList(content.slice())
    },[content])

    return (
        <>
            <Table
                rowKey={(record) => record.ID || record.Id}
                columns={tableColumn}
                dataSource={tableList}
                bordered
                pagination={{position: ['bottomCenter']}}
                scroll={{x: true}}
            />
            <p>Получено {content.length} записей</p>
        </>
    )
}

function GetFilterField(array) {
    let list = []
    if (array != null && array.length != 0) {
        let field = (array[0]["Type"] != undefined 
            ? "Type" 
            : (array[0]["HolderStatus"] != undefined 
                ? "HolderStatus" 
                : ""
            )
        )
        for (let i = 0; i < array.length && field != ""; i++) {
            if (!list.includes(array[i][field])) {
                list.push(array[i][field])
            }
        }
    }

    return(list)
}

function FilterAndSort(props) {

    const {filterFields, setContent, content, queryName, fields, defaultField, defaultOrder} = props

    //изначальный массив, не изменяется. Без useState ломается.
    const [mainList, setMainList] = useState(content.slice())

    //массив для списка типов тханок
    const [filterArr, setFilterArr] = useState(useMemo(() => getFieldsArr(filterFields,fields,content,queryName),[filterFields,fields]))
    const [filterNum, setFilterNum] = useState(0)

    useEffect(() => {
        let n = 0;
        filterArr.forEach((filter) => {
            if (filter.min != "" && filter.max != "") n++;
        })
        setFilterNum(n)
    },[])

    //фильтрация по типам:
    //фильтруем по значению поля, соединяем в большой массив
    function filterArray(workArr) {
        let bank = []
        for (let i = 0; i < filterArr.length; i++)
        {
            let newArr = []
            if (filterArr[i].checked && filterArr[i].type == 'type') {
                if (queryName == 'shareholder') {
                    newArr = workArr.filter(item => item.HolderStatus == filterArr[i].field)
                } else {
                    newArr = workArr.filter(item => item.Type == filterArr[i].field)
                }
                bank = bank.concat(newArr)
            }
        }
        return bank
    }

    //проверка на соответствие числовым значениям, внутренний метод для filter
    //пришедший элемент прогоняется по всем полям, получаем подошел/не подошел
    function filterByField(elem) {
        let flag = 0;
        for (let j = 0; j < filterArr.length; j++) {
            if (filterArr[j].checked) {
                if (filterArr[j].type == 'number') {
                    flag += +((+elem[filterArr[j].field] >= +filterArr[j].min) && (+elem[filterArr[j].field] <= +filterArr[j].max))
                } else if (filterArr[j].type == 'date') {
                    flag += +((elem[filterArr[j].field] >= filterArr[j].min) && (elem[filterArr[j].field] <= filterArr[j].max))
                } else if (filterArr[j].type == 'string' || filterArr[j].type == 'type') {
                    flag++;
                }
            } else {
                flag++;
            }
        }
        return (flag == filterArr.length)
    }
    
    //фильтрация 
    function fieldCharArray(workArr) {
        return workArr.filter(filterByField)
    }

    //выбор поля сортировки
    const [sortField, setSortField] = useState(fields[0]);
    //выбор порядка сортировки
    const [sortOrder, setSortOrder] = useState('asc');

    //фильтрация, сначала типы, потом поля
    const onClickButton = (e) => {
        let workArr = mainList.slice()
        //let filterArr1 = filterFields.length > 0 ? filterArray(workArr).slice() : mainList.slice()
        let filterArr2 = filterNum > 0 ? fieldCharArray(workArr).slice() : mainList.slice()
        setContent(filterArr2.sort(byField(sortField,sortOrder)))
    }

    return(
        <>
            {(filterFields.length > 0 || filterNum > 0) &&
                <RequestFilter filterArr = {filterArr} setFilterArr = {setFilterArr} setList = {setContent} list = {content} queryName = {queryName} fields = {fields}/>
            }
            <button onClick={onClickButton.bind(this)}>Показать</button>
            <ThankaSearch content = {content} setData = {setContent} type = {queryName}/>
        </>
    )

}

function RequestInfo(props) {

    const {request} = props

    let fields = request.Fields.split(",")
    let translateFields = []
    fields.forEach((field) => translateFields.push(request_lang_switch(field)))

    return (
        <div>
            <h4>Параметры запроса</h4>
            <ul>
                <li>Тип запроса: {request_lang_switch(request.QueryName)}</li>
                <li>Категория запроса: {request_lang_switch(request.Categories)}</li>
                <li>Выбранные поля: {translateFields.join(", ")}</li>
                {request.QueryName != 'shareholder' && request.QueryName != 'products' && 
                    <>
                    <li>Искомые слова: {request.SearchStrings}</li>
                    {/*<li>Показывать картинки: {request.Picture}</li>*/}
                    <li>Поле сортировки: {request_lang_switch(request.SortField)}</li>
                    <li>Порядок сортировки: {request_lang_switch(request.SortOrder)}</li>
                    {request.StartDate != undefined && request.EndDate != undefined &&
                        <li>Временной период: c {dateMonthWord(request.StartDate)} по {dateMonthWord(request.EndDate)}</li>
                    }
                </>
                }
                { request.QueryName == 'products' && request.TvtData != undefined &&
                    <>
                    <li>Точка выдачи товаров: <b>{request.TvtData.Name}</b> по адресу <b>{request.TvtData.Address}</b></li>
                    </>
                }
            </ul>
        </div>
    )
}

function RequestViewer(props) {

    const { content, request, hash } = props

    //массив данных
    const [listContent, setListContent] = useState(content)
    //поля запроса
    const [fields, setFields] = useState(request.Fields.split(","))
    //список текстовых значений для фильтрации
    const [list, setList] = useState(useMemo(() => (/*request.QueryName != "products" ? */GetFilterField(content)/* : GetFilterCategoryField(content)*/),[]))


    useEffect(() => {
        let arr = []
        for (let i = 0; i < listContent.length; i++) {

            arr.push(listContent[i].Name)
        }
        nameFilterByWords(arr)
    },[])
    
    return (
        <div>
            <RequestInfo request = {request} />
            { listContent != null ? 
            <>
                { request.Categories != "referrer" && content.length > 0 &&
                <>
                    <FilterAndSort 
                        filterFields = {list} 
                        setContent = {setListContent} 
                        content = {listContent} 
                        queryName = {request.QueryName} 
                        fields = {fields} 
                        defaultField = {request.SortField} 
                        defaultOrder = {request.SortOrder}
                    />
                </>
                }
                <RequestTable 
                    content = {listContent} 
                    fields = {fields} 
                    setContent = {setListContent} 
                    picture = {request.Picture} 
                    hash = {hash} 
                    type = {request.QueryName} 
                    amount = {listContent.length}
                />
            </> 
            :
            <>
                <p>Записи не найдены</p>
            </>
            }
        </div>
    )
}

export default RequestViewer;
