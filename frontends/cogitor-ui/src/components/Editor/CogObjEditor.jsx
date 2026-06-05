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

    // Локальный blob URL для превью только что выбранного файла
    // до того, как он успешно улетел на сервер и вернулся filename.
    // Чистим в useEffect через URL.revokeObjectURL, иначе течет память.
    const [localPreview, setLocalPreview] = useState({ url: "", name: "" });

    useEffect(() => {
        return () => {
            if (localPreview.url) URL.revokeObjectURL(localPreview.url);
        };
    }, [localPreview.url]);

    const onChangePDF = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setSystemMessageText("Выберите другой файл");
            setSystemMessageType("warning");
            return;
        }

        // Отрисовываем локальное превью сразу — до ответа бэка.
        if (localPreview.url) URL.revokeObjectURL(localPreview.url);
        setLocalPreview({ url: URL.createObjectURL(file), name: file.name });

        var formData = new FormData();
        formData.append("file", file);
        formData.append("selectedPDF", selectedPDF);

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
        });
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
            if (localPreview.url) URL.revokeObjectURL(localPreview.url);
            setLocalPreview({ url: "", name: "" });
            setSystemMessageText("Файл удален");
            setSystemMessageType("success")
        })
        .catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error")
        })
    }

    // Источник для iframe: предпочитаем реально загруженный файл с сервера,
    // но если сервер ещё не ответил — показываем локальный blob.
    const hasServerFile = selectedPDF != null && selectedPDF != undefined && selectedPDF != "";
    const previewSrc = hasServerFile ? (DIRPATH + "/pdf/" + selectedPDF) : localPreview.url;
    const previewName = hasServerFile ? selectedPDF : localPreview.name;

    return (
        <>
        <p>Загрузить файл PDF:</p>
        {previewSrc && (
            <div className="pdfPreview">
                <p className="pdfPreviewName">Текущий файл: {previewName}</p>
                <iframe
                    src={previewSrc}
                    title="PDF превью"
                    width="100%"
                    height="500"
                    style={{ border: "1px solid #ccc" }}
                />
                {hasServerFile && (
                    <button onClick={deletePDF}>Удалить файл</button>
                )}
            </div>
        )}
        <input
            id="file"
            type="file"
            accept="application/pdf"
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
            description, setDescription,
            avatarName, setAvatarName
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
                    value={avatarName || ''}
                    onChange={(e) => setAvatarName(e.target.value)}
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
                    onChange={(e) => setDescription(e)}
                    defaultValue={type == 'edit' ? (data.Object.Description || '') : ''}
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