import React, { useState, useRef } from 'react';
import axios from "axios";
import {PATH, SITE} from "../../utils/url.js";

import CogObjectEditor from '../Editor/CogObjEditor.jsx';

import { DateForEditorZero, TrueDateForEditor } from '../../utils/language_ru.js';

import "../../style/thanka.css"

function CogEditor(props) {

    let data = props.data;

    let type = data.SectorLink != undefined ? "link" : data.Object.Type;

    const descriptionRef = useRef(data.Object.Description);
    let today = new Date();
    today = today.getFullYear()+"-"+(today.getMonth() + 1)+"-"+today.getDate();

    const [selectedDateEvent, setSelectedDateEvent] = useState(
                    data.Object.DateEvent != null && 
                    data.Object.DateEvent != undefined &&
                    data.Object.DateEvent != "" ? TrueDateForEditor(data.Object.DateEvent) : today);

    const [selectedLocation, setSelectedLocation] = useState(
        data.LocationEvent != undefined &&
        data.LocationEvent != null &&  
        data.LocationEvent[2] != null &&
        data.LocationEvent[2] != undefined ? 
        data.LocationEvent[2].ID : "1"
    );

    let dataToEditor = {};
    dataToEditor.Object = {};
    dataToEditor.Thanka = {};

    const nameref = useRef(data.Object.Name);
    const [birthDate, setBirthDate] = useState(data.Object.BirthDate);
    const [telNumber, setTelNumber] = useState(data.Object.TelephoneNumber);
    const [email, setEmail] = useState(data.Object.Email);
    const [realAuthor, setRealAuthor] = useState(data.Object.RealAuthor);
    const [url, setURL] = useState(data.Object.URL);
    const [message, setMessage] = useState("");

    const Save = (e) => {
        e.preventDefault();

        dataToEditor.Id = data.Id;
        dataToEditor.Thanka.Author = data.Thanka.Author;
        dataToEditor.EditorType = "object";

        if (type == "article" || type == "document") {
            dataToEditor.Object.Description = (
                descriptionRef.current.value !== undefined ? 
                descriptionRef.current.value : 
                descriptionRef.current
            );
            dataToEditor.Object.RealAuthor = realAuthor
            dataToEditor.Object.URL = url
        }
        if (type == "article") {
            dataToEditor.Object.DateEvent = selectedDateEvent;
            dataToEditor.LocationEvent = selectedLocation;
        }
        if (type == "avatar") {
            dataToEditor.Object.Name = (
                nameref.current.value !== undefined ? 
                nameref.current.value : 
                nameref.current
            );
            dataToEditor.Object.BirthDate = birthDate;
            dataToEditor.Object.TelephoneNumber = telNumber;
            dataToEditor.Object.Email = email;
        }

        axios({
            method: "post",
            url: PATH + "thanka/setThanka.php",
            //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
            headers: { "content-type": "multipart/form-data" },
            data: dataToEditor,
        }).then((result) => {

            props.function();
        }).catch((error) => {

            setMessage("Произошла ошибка");
        })
    };

    const SaveNewVersion = (e) => {
        e.preventDefault();

        dataToEditor.Id = data.Id;
        dataToEditor.EditorType = "newversion"

        if (type == "article") {
            dataToEditor.Object.Description = (
                descriptionRef.current.value !== undefined ? 
                descriptionRef.current.value : 
                descriptionRef.current
            );
            dataToEditor.Object.DateEvent = selectedDateEvent;
            dataToEditor.LocationEvent = selectedLocation;
        }

        axios({
            method: "post",
            url: PATH + "thanka/setThanka.php",
            //данные отправятся в $_POST и $_FILES, а то мы не вытащим оттуда картинку
            headers: { "content-type": "multipart/form-data" },
            data: dataToEditor,
        }).then((result) => {
            //props.function();
            props.setState("view");
            setMessage("Успешно");
        }).catch((error) => {
            setMessage("Произошла ошибка");
        })
    };

    return ( 
        <div className='innerEditor'>
            <CogObjectEditor 
                selectedDateEvent = {selectedDateEvent} setSelectedDateEvent = {setSelectedDateEvent}
                selectedLocation = {selectedLocation} setSelectedLocation = {setSelectedLocation}
                selectedRealAuthor = {realAuthor} setSelectedRealAuthor = {setRealAuthor}
                selectedURL = {url} setSelectedURL = {setURL}
                birthDate = {birthDate} setBirthDate = {setBirthDate}
                telNumber = {telNumber} setTelNumber = {setTelNumber}
                email = {email} setEmail = {setEmail}
                selectedType = {type} data = {data} type = {"edit"}
                descriptionRef = {descriptionRef}
            />
            <button onClick = {Save}>Сохранить</button>
            { type == 'article' && <button onClick = {SaveNewVersion}>Сохранить как новую версию</button> }
            <button onClick={() => props.setState("view")}>Отменить</button>
            <h3>{message}</h3>
        </div>
    );
}

export default CogEditor;
