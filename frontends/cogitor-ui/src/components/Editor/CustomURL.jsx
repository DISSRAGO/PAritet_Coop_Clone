import React, { useState } from "react";
import axios from "axios";
import { PATH, SITE } from "../../utils/url.js";

// Компонент ввода и проверки кастомного URL тханки. Вынесен из
// EditorComponent.jsx без изменения поведения. Реэкспортируется из
// EditorComponent.jsx, чтобы внешние потребители (EditorSite.jsx)
// продолжали работать без правок.
export function CustomURL(props) {

    const { customURL, setCustomURL, type, checkedURL, setCheckedURL, defaultURL } = props

    //const [url, setUrl] = useState("")
    const [error, showError] = useState(false)
    const [errorText, setErrorText] = useState("Недопустимые символы")
    const regexp = /[aA-zZ0-9\-\_]+/

    const onChangeUrl = (e) => {
        setErrorText("Недопустимые символы")
        //условия посмотреть, не работает на изначально плохих строках
        let reg = e.target.value != "" && regexp.exec(e.target.value) != null ? regexp.exec(e.target.value) : null
        setCustomURL(e.target.value)
        if ((e.target.value != "" && reg == null) || (reg != null && reg[0] != reg['input'])) {
            showError(true)
        }
        else if ((e.target.value == "") || (reg != null && e.target.value != "" && reg[0] == reg['input'])) {
            showError(false)
        }
        if (defaultURL != e.target.value) {
            setCheckedURL(false)
        }
    }

    function checkURL() {
        if (customURL != defaultURL) {
            axios({
                method: "post",
                url: PATH + 'thanka/thanka.php',
                headers: { "content-type": "multipart/form-data" },
                data: { method: "checkCustomURL", url: (type == 'avatar' ? '@' + customURL.toLowerCase() : customURL.toLowerCase())},
            }).then((result) => {
                if (result.data.result) {
                    setErrorText("Данный адрес уже занят")
                    showError(true)
                } else {
                    setErrorText("Данный адрес можно использовать")
                    showError(true)
                    setCheckedURL(true)
                }
            }).catch((error) => {
            })
        } else {
            setErrorText("Текущий адрес")
            showError(true)
            setCheckedURL(true)
        }
    }

    return(
        <>
        <p>Введите желаемый URL-адрес:</p>
        <input /*defaultValue={url}*/ onChange={onChangeUrl} value = {customURL}/>
        {error && <p>{errorText}</p>}
        <button  onClick = {(e) => checkURL()} disabled = {error || customURL == ""}>Проверить</button>
        <button onClick = {(e) => {setCustomURL(""); setErrorText(""); setCheckedURL(true)}}>Удалить</button>
        <p>Полный URL-адрес страницы будет выглядеть:<input readOnly value={type == 'avatar' ? SITE+'@'+customURL : SITE+customURL}/></p>
        </>
    )
}

export default CustomURL;
