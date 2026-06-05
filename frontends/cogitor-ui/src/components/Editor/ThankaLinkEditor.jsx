import React, { useState } from "react";
import axios from "axios";
import { PATH } from "../../utils/url.js";
import { SimpleTableList } from "../Table/TableList.jsx";

// Редактор поля «ссылка на другую тханку». При нажатии на кнопку
// подгружает список доступных тханок и показывает SimpleTableList,
// откуда пользователь выбирает ID. Вынесен из EditorComponent.jsx
// без изменения поведения.
function ThankaLinkEditor(props) {

    const { thankaLink, setThankaLink } = props

    const [thankaList, setThankaList] = useState([])
    const [hash, setHash] = useState()

    const [searchVisible, setSearchVisible] = useState(false)

    function getAllThanka() {
        setSearchVisible(true)
        axios({
            method: "post",
            url: PATH + 'request/request.php',
            headers: { "content-type": "multipart/form-data" },
            data: { method: "getAllThankas", type: "link" },
        }).then((result) => {
            setThankaList(typeof result.data.List == 'object' ? Object.values(result.data.List) : result.data.List)
            setHash(result.data.Hash)
        }).catch((error) => {
        })
    }

    return (
        <>
            <p>Введите номер тханки:</p>
            <input type="text" defaultValue={thankaLink} onChange={(e) => setThankaLink(e.target.value)} />
            <button onClick={() => getAllThanka()}>Открыть список тханок</button>
            {searchVisible &&
                <SimpleTableList list={thankaList} hash={hash} />
            }
        </>
    )
}

export default ThankaLinkEditor;
