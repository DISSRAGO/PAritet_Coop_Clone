import React, { useEffect, useState } from "react";
import axios from "axios";
import { PATH, DIRPATH } from "../../utils/url.js";
import TextEditorJD from "../../components/TextEditor/Jodit.jsx"
import LocationAttrs from "../../components/Location/Location.jsx";
import "../../style/thanka.css";

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

function PDFDownloader(props) {
    const {selectedPDF, setSelectedPDF } = props;

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const onChangePDF = (e) => {
        if (e.target.files[0].type == 'application/pdf') {

            var formData = new FormData();
            formData.append("file", e.target.files[0]);
            formData.append("selectedPDF", selectedPDF)

            axios({
                method: "post",
                url: PATH + 'pdfDownloader.php',
                headers: { "content-type": "multipart/form-data" },
                data: formData
            })
            .then((result) => {
                setSelectedPDF(result.data.filename);
                setSystemMessageText("Файл загружен");
                setSystemMessageType("success")
            })
            .catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageType("error")
            })
        } else {
            setSystemMessageText("Выберите другой файл");
            setSystemMessageType("warning")
        }
    };

    const deletePDF = (e) => {
        axios({
            method: "post",
            url: PATH + 'deletePDF.php',
            headers: { "content-type": "multipart/form-data" },
            data: {selectedPDF: selectedPDF}
        })
        .then((result) => {
            setSelectedPDF("");
            setSystemMessageText("Файл удален");
            setSystemMessageType("success")
        })
        .catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    return (
        <>
        <p>Загрузить файл PDF:</p>
        {(selectedPDF != null && selectedPDF != undefined && selectedPDF != "") && 
            <>
                <iframe src = {DIRPATH+"/pdf/"+selectedPDF}/>
                <button onClick={deletePDF}>Удалить файл</button>
            </>
        }
        <input
            id="file"
            type="file"
            onChange={onChangePDF}
        />
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </>
    )
}

function CogObjectEditor(props) {

    const {selectedType, type, data, 
            selectedDateEvent,setSelectedDateEvent,
            setSelectedLocation,
            selectedPDF, setSelectedPDF,
            selectedRealAuthor, setSelectedRealAuthor,
            selectedURL, setSelectedURL,
            birthDate, setBirthDate,
            telNumber, setTelNumber,
            email, setEmail,
            descriptionRef,
            avatarNameref
        } = props

    const LocationEvent = data.LocationEvent !== undefined && props.type == 'edit' ?
        data.LocationEvent : [{ ID: "", Name: "" }, { ID: "", Name: "" }, { ID: "", Name: "" }];

    const [locationButton, pushLocationButton] = useState(false)
    
    return(
        <>
            {selectedType == 'avatar' &&
            <>
                <p>Имя (как к вам обращаться): </p>
                <input
                    defaultValue={type == 'edit' ? data.Object.Name : ''}
                    ref={avatarNameref}
                    onChange={(e) => { avatarNameref.current = e.target.value; }}
                />
                <p>Дата рождения: </p>
                <input type="date" defaultValue={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                <p>Номер телефона: </p>
                <input defaultValue={telNumber} onChange={(e) => setTelNumber(e.target.value)} />
                <p>Электронная почта: </p>
                <input defaultValue={email} onChange={(e) => setEmail(e.target.value)} />
            </>
        }
        
        {(selectedType == "article" || selectedType == "document") && 
            <>
                <p>Содержание:</p>
                <TextEditorJD
                    refs={descriptionRef}
                    onChange={(e) => {descriptionRef.current = e}}
                    defaultValue={type == 'edit' ? data.Object.Description : ''}
                />
                <p>Автор:</p>
                <input defaultValue={selectedRealAuthor} onChange={(e) => setSelectedRealAuthor(e.target.value)}/>
                <p>Источники:</p>
                <input defaultValue={selectedURL} onChange={(e) => setSelectedURL(e.target.value)}/>
            </>
        }
        {selectedType == "article" && (
            <>
                
                <p>Дата события:</p>
                <input
                    name="Date"
                    type="date"
                    defaultValue={selectedDateEvent}
                    onChange={(e) => setSelectedDateEvent(e.target.value)}
                />
                { !locationButton && type == 'edit' &&
                    <button onClick={pushLocationButton.bind(this, true)}>Изменить локацию</button> 
                }
                { (locationButton || type != 'edit') &&
                <LocationAttrs
                    type={type}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    data={data}
                    LocationEvent={LocationEvent}
                />
                }
                {selectedPDF != undefined &&
                    <PDFDownloader selectedPDF = {selectedPDF} setSelectedPDF = {setSelectedPDF}/>
                }
            </>
        )}
        </>
    )
}

export default CogObjectEditor