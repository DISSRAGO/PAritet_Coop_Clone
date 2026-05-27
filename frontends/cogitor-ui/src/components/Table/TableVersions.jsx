import React, { useEffect, useState } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector.ts';
import axios from 'axios';
import {PATH} from "../../utils/url.js";
import { useActions } from '../../hooks/useActions.ts';
import { dateMonthWord } from '../../utils/language_ru.js';

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

function TableVersions(props) {
    
    const auth = useTypedSelector((state) => state.user.headerInfo);
    const { getVersion } = useActions();

    const [arrData, setArrData] = useState(props.list != null && props.list != undefined ? props.list.slice() : []);
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    let style = {display: 'none'};
    switch (props.state) {
        case 'unvisible': {
            style = {display: 'none'};
            break;
        }
        default: {
            style = {display: 'table'};
            break;
        }
    }

    function getVersionFunc(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: id, method: "getVersion"},
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            getVersion(result.data);
        }).catch((error) => {
          setSystemMessageText("Произошла ошибка");
          setSystemMessageType("error")
        })
    }

    function removeVersion(id, i) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: id, method: "removeVersion" },
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            let arr = arrData.slice()
            arr.splice(i,1);
            setArrData(arr)
            setSystemMessageText("Удалено");
            setSystemMessageType("success")
        }).catch((error) => {
          setSystemMessageText("Произошла ошибка");
          setSystemMessageType("error")
        })
    }

    return (
    <>
      <table className="table" style={style}>
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th>{"Дата создания"}</th>
            <th>{"Является ли главной"}</th>
            <th>{"Является ли запечатанной"}</th>
            <th>{"Действие"}</th>
          </tr>
          {arrData.map((arr, i) => (
            <tr>
              <td>{arr.ID}</td>
              <td>{arr.DateCreate !== undefined && dateMonthWord(arr.DateCreate)}</td>
              <td>{arr.MainVersion == true ? "да" : "нет"}</td>
              <td>{arr.StampVersion == true ? "да" : "нет"}</td>
              <td>
                <button onClick = {getVersionFunc.bind(this, arr.ID)}>{'Просмотреть'}</button>
                {   arr.MainVersion == false &&
                    <button onClick = {removeVersion.bind(this, arr.ID, i)} >{'Удалить'}</button>}
              </td>
            </tr>
          ))}
        </tbody>
       
      </table>
      <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />    
      </>
    );
}

export default TableVersions;
