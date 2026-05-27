import React, { useEffect, useState } from "react";
import "../../style/thanka.css";
import axios from "axios";
import { PATH } from "../../utils/url.js";

import { SimpleTvtList } from "../Table/TableList.jsx";

const ThankaFields = [
    { value: 'ID', text: 'Идентификатор' },
    { value: 'Name', text: 'Название' },
    { value: 'Annotation', text: 'Аннотация' },
    { value: 'Date', text: 'Дата' },
    { value: 'CommentsNum', text: 'Количество комментариев' },
    { value: 'ViewNum', text: 'Количество просмотров' },
    { value: 'Type', text: 'Тип' },
    { value: 'Author', text: 'Автор' }
];

const AuthorFields = [
    { value: 'ID', text: 'Идентификатор' },
    { value: 'Name', text: 'Имя автора' },
    { value: 'Annotation', text: 'Аннотация' },
    { value: 'Date', text: 'Дата' },
    { value: 'CommentsNum', text: 'Количество комментариев автора' },
    { value: 'ToComments', text: 'Комментарии' },
    { value: 'ViewNum', text: 'Количество просмотров тханок автора' },
    { value: 'LinksNum', text: 'Количество ссылок' },
    { value: 'ThankaNum', text: 'Количество тханок' }
];

const ShareHolderFields = [
    { value: 'HolderName', text: 'Имя пайщика' },
    { value: 'HolderAvatar', text: 'Аватар пайщика' },
    { value: 'Date', text: 'Дата' }
];

const InvitedFields = [
    { value: 'AccountNumber', text: 'Номер счета' },
    { value: 'HolderStatus', text: 'Статус пайщика' }
];

const ProductFields = [
    { value: 'Id', text: 'Идентификатор' },
    { value: 'Name', text: 'Название' },
    { value: 'Description', text: 'Описание' },
    { value: 'Producer', text: 'Производитель' },
    { value: 'Price', text: 'Цена' },
    { value: 'Category', text: 'Категория' }
];

const GroupFields = [
    { value: 'Id', text: 'Идентификатор' },
    { value: 'GroupName', text: 'Название' },
    { value: 'Description', text: 'Описание' },
]

function getValues(arr) {
    let values = []
    for (let i = 0; i < arr.length; i++) {
        values.push(arr[i].value)
    }
    return values
}

export function RequestEditor(props) {

    const { setParams, request, type } = props;
    const [template, setTemplate] = useState(type == "edit" ? request.QueryName : "thankabasic")

    return (
        <>
            <p>Получить информацио о:</p>
            <select onChange={(e) => setTemplate(e.target.value)} defaultValue={template}>
                <option value="thankabasic">тханках</option>
                <option value="thankaauthor">авторах</option>
                <option value="shareholder">пайщиках</option>
                <option value="products">товарах</option>
                <option value='groups'>группах</option>
            </select>

            {(template == 'thankabasic' || template == 'thankaauthor') &&
                <ThankaAuthorRequestEditor template={template} setParams={setParams} type={type} request={request} />
            }
            {template == 'shareholder' &&
                <ShareHolderRequestEditor template={template} setParams={setParams} type={type} request={request} />
            }
            {template == 'products' &&
                <ProductRequestEditor template={template} setParams={setParams} type={type} request={request} />
            }
            {template == 'groups' &&
                <GroupsRequestEditor template={template} setParams={setParams} type={type} request={request} />
            }
        </>
    )
}

function ThankaAuthorRequestEditor(props) {
    const { setParams, request, type, template } = props;

    const [fieldArr, setFieldArr] = useState(type == "edit" && request.Fields != null ? request.Fields.split(",") : (template == "thankabasic" ? getValues(ThankaFields) : getValues(AuthorFields)))
    const [category, setCategory] = useState(type == "edit" ? request.Categories : "")

    const onChangeCheck = (e, value) => {
        let arr = fieldArr.slice()
        if (e.target.checked) {
            arr.push(value)
        } else if (arr.indexOf(value) != -1) {
            arr.splice(arr.indexOf(value), 1)
        }
        setFieldArr(arr)
    }

    const onChangeAdmin = (e) => {
        if (e.target.checked) {
            setCategory("admin")
        } else {
            setCategory("")
        }
    }

    useEffect(() => {
        setFieldArr(type == "edit" && request.Fields != null ? request.Fields.split(",") : (template == "thankabasic" ? getValues(ThankaFields) : getValues(AuthorFields)))
    }, [template])

    const [picture, setPicture] = useState(type == "edit" && request.Picture == true ? 1 : 0)
    const [sortField, setSortField] = useState(type == "edit" ? request.SortField : "date")
    const [searchName, setSearchName] = useState(type == "edit" ? request.SearchStrings : "")
    const [sortOrder, setSortOrder] = useState(type == "edit" ? request.SortOrder : "asc")
    const [startDate, setStartDate] = useState(type == "edit" ? request.StartDate : "")
    const [endDate, setEndDate] = useState(type == "edit" ? request.EndDate : "")

    useEffect(() => {
        setParams({
            sortField: sortField,
            sortOrder: sortOrder,
            startDate: startDate,
            endDate: endDate,
            picture: picture,
            searchName: searchName,
            fieldArr: fieldArr,
            category: category,
            template: template
        })
    }, [fieldArr, sortField, sortOrder, startDate, endDate, picture, searchName, category, template]
    )

    return (
        <div className="requestEditor">
            <p>Поиск по:</p>
            <p>
                {template == 'thankabasic' ? <label>Название тханки</label> : <label>Имя автора</label>}
                <input type="text" onChange={(e) => setSearchName(e.target.value)} value={searchName} />
            </p>
            <p>Выбрать поля:</p>
            {template == 'thankabasic' &&
                <>
                    {ThankaFields.map((field) => (
                        <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                    ))}

                    <p>За период:</p>
                    {"с "}
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} defaultValue={startDate} />
                    {" до "}
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} defaultValue={endDate} />

                    <p>Сортировка:</p>
                    <div>
                        <label><input type="radio" id="date" name="field" value="date" onChange={(e) => setSortField(e.target.value)} checked={sortField == "date"} />По дате</label>
                        <label><input type="radio" id="view" name="field" value="view" onChange={(e) => setSortField(e.target.value)} checked={sortField == "view"} />По количеству просмотров</label>
                        <label><input type="radio" id="comment" name="field" value="comment" onChange={(e) => setSortField(e.target.value)} checked={sortField == "comment"} />По количеству комментариев</label>
                    </div>
                    <div>
                        <label><input type="radio" id="asc" name="sort" value="asc" onChange={(e) => setSortOrder(e.target.value)} checked={sortOrder == "asc"} />по возрастанию</label>
                        <label><input type="radio" id="desc" name="sort" value="desc" onChange={(e) => setSortOrder(e.target.value)} checked={sortOrder == "desc"} />по убываниию</label>
                    </div>
                </>
            }
            {template == 'thankaauthor' &&
                <>
                    <div>
                        {AuthorFields.map((field) => (
                            <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                        ))}
                    </div>
                    <div>
                        <label><input type="checkbox" onChange={onChangeAdmin} checked={category == "admin"} />Показать только администраторов портала</label>
                    </div>
                </>
            }
            <div>
                <label><input type="checkbox" onChange={(e) => setPicture(Number(e.target.checked))} checked={picture} />Показывать картинки</label>
            </div>
        </div>
    )
}

function ShareHolderRequestEditor(props) {
    const { setParams, request, type, template } = props;
    const [category, setCategory] = useState(type == "edit" ? request.Categories : "invited")

    const [fieldArr, setFieldArr] = useState(
        type == "edit" && request.Fields != null ?
            request.Fields.split(",") :
            (category == "invited" ?
                [...getValues(ShareHolderFields), ...getValues(InvitedFields)] :
                getValues(ShareHolderFields)
            )
    )

    const onChangeCategory = (e) => {
        setCategory(e.target.value)
    }
    const onChangeCheck = (e, value) => {
        let arr = fieldArr.slice()
        if (e.target.checked) {
            arr.push(value)
        } else if (arr.indexOf(value) != -1) {
            arr.splice(arr.indexOf(value), 1)
        }
        setFieldArr(arr)
    }

    useEffect(() => {
        setParams({
            category: category,
            template: template,
            fieldArr: fieldArr
        })
    }, [
        category, template, fieldArr
    ])

    useEffect(() => {
        if (category == "invited") {
            setFieldArr([...getValues(ShareHolderFields), ...getValues(InvitedFields)])
        } else {
            setFieldArr(getValues(ShareHolderFields))
        }
    }, [category])

    return (
        <div className="requestEditor">
            <p>Выбрать категорию:</p>
            <div>
                <label><input type="radio" name="shareHolder" onChange={onChangeCategory} checked={category == 'invited'} value={'invited'} />Приглашенные</label>
                <label><input type="radio" name="shareHolder" onChange={onChangeCategory} checked={category == 'referrer'} value={'referrer'} />Поручители</label>
                <label><input type="radio" name="shareHolder" onChange={onChangeCategory} checked={category == 'producer'} value={'producer'}></input>Поставщики</label>
                <label><input type="radio" name="shareHolder" onChange={onChangeCategory} checked={category == 'distributor'} value={'distributor'} />Дистрибьюторы</label>
            </div>
            <p>Выбрать поля:</p>
            <div>
                {ShareHolderFields.map((field) => (
                    <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                ))}
                {category == "invited" &&
                    <>
                        {InvitedFields.map((field) => (
                            <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                        ))}
                    </>
                }
            </div>
        </div>
    )
}

function ProductRequestEditor(props) {
    const { setParams, request, type, template } = props;
    const [picture, setPicture] = useState(type == "edit" && request.Picture == true ? 1 : 0)
    const [searchName, setSearchName] = useState(type == "edit" ? request.SearchStrings : "")

    const [myGoods, setMyGoods] = useState(type == "edit" && request.Categories == 'myGoods' ? 1 : 0)

    const [fieldArr, setFieldArr] = useState(
        type == "edit" && request.Fields != null ? request.Fields.split(",") : getValues(ProductFields)
    )

    const [tvtList, setTvtList] = useState([])
    const [tvtId, setTvtId] = useState(type == 'edit' ? request.TvtId : "")

    function getTvtList() {
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: { method: "getTvtList" },
        }).then((result) => {
            setTvtList(result.data)
        }).catch((error) => {
        })
    }

    function getProducerList() {
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: { method: "getProducerList", category: "producer" },
        }).then((result) => {
        }).catch((error) => {
        })
    }

    const onChangeCheck = (e, value) => {
        let arr = fieldArr.slice()
        if (e.target.checked) {
            arr.push(value)
        } else if (arr.indexOf(value) != -1) {
            arr.splice(arr.indexOf(value), 1)
        }
        setFieldArr(arr)
    }

    useEffect(() => {
        setParams({
            template: template,
            fieldArr: fieldArr,
            picture: picture,
            searchName: searchName,
            category: myGoods == true ? "myGoods" : "",
            specialProps: tvtId != "" ? ("tvt:" + tvtId) : ""
        })
    }, [fieldArr, picture, searchName, template, tvtId])

    useEffect(() => {
        setFieldArr(type == "edit" && request.Fields != null ? request.Fields.split(",") : getValues(ProductFields))
        getTvtList()
    }, [])

    return (
        <div className="requestEditor">
            <div>
                <p>Выбрать ТВТ:</p>
                <SimpleTvtList list={tvtList} setTvtId={setTvtId} tvtId={tvtId} tvtInfo={request.TvtData} />
                <p>Выбрать поля:</p>
                {ProductFields.map((field) => (
                    <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                ))
                }
            </div>
            <div>
                <label><input type="checkbox" onChange={(e) => setPicture(Number(e.target.checked))} checked={picture} />Показывать картинки</label>
            </div>
        </div>
    )
}

function GroupsRequestEditor(props) {
    const { setParams, request, type, template } = props;
    const [category, setCategory] = useState(type == "edit" ? request.Categories : "groups")

    const [fieldArr, setFieldArr] = useState(
        type == "edit" && request.Fields != null ?
            request.Fields.split(",") : getValues(GroupFields)
    )

    const onChangeCheck = (e, value) => {
        let arr = fieldArr.slice()
        if (e.target.checked) {
            arr.push(value)
        } else if (arr.indexOf(value) != -1) {
            arr.splice(arr.indexOf(value), 1)
        }
        setFieldArr(arr)
    }

    useEffect(() => {
        setParams({
            category: category,
            template: template,
            fieldArr: fieldArr
        })
    }, [
        category, template, fieldArr
    ])

    return (
        <div className="requestEditor">
            <p>Выбрать поля:</p>
            <div>
                {GroupFields.map((field) => (
                    <label><input type="checkbox" onChange={(e) => onChangeCheck(e, field.value)} checked={fieldArr.includes(field.value)} />{field.text}</label>
                ))}
            </div>
        </div>
    )
}