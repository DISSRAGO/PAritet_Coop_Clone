import React, { useState } from 'react';
import axios from 'axios';
import {PATH} from "../../utils/url.js";
import { DIRPATH } from '../../utils/url.js';

import sortdown from '../../icons/sortdown.png';
import sortup from '../../icons/sortup.png';

import { SystemMessage } from '../Viewer/SystemMessage.jsx';

export function TableSort(props) {

    const {data, hash} = props;
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const [array, setArray] = useState(data);
    let arr = array.slice();
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
        let Sectors = ""
        for (let i = 0; i < arr.length; i++) {
            Sectors += arr[i].ID + ";"
        }

        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: {Sectors: Sectors, method: "sortSectors"},
            headers: {"content-type": "multipart/form-data"},
        }).then((result) => {
            setSystemMessageText("Перезагрузите страницу")
            setSystemMessageType("success")
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error")
        })

    }

    return (
    <>
    <div className='sortButtons'>
      <button onClick = {Save.bind(this)}>Сохранить</button>
      <button onClick = {props.setTableSort.bind(this, false)}>Отменить</button>
    </div>
      <table className="table">
        <tbody>
          <tr>
            <th>{"Номер"}</th>
            <th></th>
            <th>{"Название"}</th>
            <th>{"Действие"}</th>
          </tr>
          {array.map((arr, i) => (
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
    
      <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
    </>
    );
}

export default TableSort;