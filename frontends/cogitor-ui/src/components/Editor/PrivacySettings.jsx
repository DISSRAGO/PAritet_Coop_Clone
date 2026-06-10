import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import TableInterface from "../../components/Table/TableInterface.jsx";
import { PATH, DIRPATH } from "../../utils/url.js";
import "../../style/thanka.css";

import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

import { EditorTableViewer } from "../../components/Table/TableInterface.jsx";

// Компонент «Углы» (Elements) — 4 слота под выбор тханки.
// Порядок ровно как в каноне (KOGI.Metody:669) и в Canvas.jsx:
//   [0] LeftUp, [1] RightUp, [2] LeftBottom, [3] RightBottom.
// Источник списка — data.MyThankaList.RegisteredObject (см. _h_get_thanka:377):
// бэк уже подгружает в каждое открытие тханки список тханок владельца.
// «не задано» (ID="") — это валидный «пустой» угол: Canvas рисует пустой
// слот, бэк через SetElements делает идемпотентный DELETE+INSERT по 4 кодам.
function Elements(props) {

    const { data, elemArr, setElements } = props;

    //таблица-подсказка для стихий
    const [isTableVision, setTableVision] = useState(false);

    // Гарантируем длину 4, иначе select по i=2/3 уйдёт в undefined и
    // потеряет VisibleElements при первом submit без правок углов.
    const padTo4 = (arr) => {
        const out = Array.isArray(arr) ? arr.slice(0, 4) : [];
        while (out.length < 4) out.push("");
        return out;
    };

    const [selectedElements, setSelectedElements] = useState(padTo4(elemArr));

    useEffect(() => {
        // При первом приходе elemArr (после async _corner_elements_for) — 
        // подтягиваем выбранные углы. Не затираем, если пользователь уже
        // успел руками что-то выбрать.
        if (Array.isArray(elemArr) && elemArr.length > 0) {
            const padded = padTo4(elemArr);
            const isEmpty = selectedElements.every((v) => !v);
            if (isEmpty) setSelectedElements(padded);
        }
    }, [elemArr]);

    const onChangeElements = (e) => {
        const elements = selectedElements.slice(0);
        const i = Number(e.target.name);
        elements[i] = e.target.value || "";
        setSelectedElements(elements);
    };

    // раньше setElements(...) вызывался прямо в render — это вызывало React-предупреждение
    // «Cannot update a component while rendering a different component». Переносим в effect.
    useEffect(() => {
        setElements(selectedElements);
    }, [selectedElements]);

    // Источник опций — MyThankaList владельца. Бэк в _h_get_thanka кладёт
    // его как SOAP-обёртку {RegisteredObject:[...]}, но routers/thanka.py
    // в normalize_get_thanka_result:430 распаковывает в плоский массив
    // через registered(). Поэтому на фронте приходит уже list,
    // а не dict (это тот же паттерн, что и data.Elements / data.Children).
    // На всякий случай поддерживаем оба варианта.
    let myThankaRaw = (data && data.MyThankaList) || [];
    if (myThankaRaw && !Array.isArray(myThankaRaw) && myThankaRaw.RegisteredObject) {
        myThankaRaw = myThankaRaw.RegisteredObject;
    }
    const myThankaList = Array.isArray(myThankaRaw)
        ? myThankaRaw
        : (myThankaRaw ? [myThankaRaw] : []);

    // EditorTableViewer (таблица-подсказка стихий) — оставляем как было,
    // подкачка getCatalogs независима от выбора углов.
    const [list, setList] = useState(data.Elements)
    useEffect(() => {
        axios({
            method: "post",
            url: PATH + "thanka/thanka.php",
            headers: { "content-type": "multipart/form-data" },
            data: {method: "getCatalogs"},
        }).then((result) => {
            setList(result.data.List)
        }).catch((error) => {
            /* подсказочная таблица не критична */
        })
    },[])

    const labels = [
        "Левый верхний",
        "Правый верхний",
        "Левый нижний",
        "Правый нижний",
    ];

    const renderSelect = (i) => (
        <select
            name={i}
            value={selectedElements[i] || ""}
            onChange={onChangeElements}
            className="corner-select"
        >
            <option value="">— не задано —</option>
            {myThankaList.map((t) => (
                <option key={t.ID} value={t.ID}>
                    {t.Name || t.ID}
                </option>
            ))}
        </select>
    );

    return (
        <>
            <table id="elements">
                <tbody>
                    <tr>
                        <td><label>{labels[0]}<br/>{renderSelect(0)}</label></td>
                        <td><label>{labels[1]}<br/>{renderSelect(1)}</label></td>
                    </tr>
                    <tr>
                        <td><label>{labels[2]}<br/>{renderSelect(2)}</label></td>
                        <td><label>{labels[3]}<br/>{renderSelect(3)}</label></td>
                    </tr>
                </tbody>
            </table>
            <button className="tableButton" onClick={(e) => setTableVision(!isTableVision)}>Открыть таблицу</button>
            {data.Id != "" && data.Id !== undefined && isTableVision && (
                <>
                <EditorTableViewer state={'tableEditor'} list={list} />
                </>
            )}
        </>
    );
}

export function ThankaPic(props) {

    const {setSelectedPictureSend, setPicCoord, selectedPicCoord, dataId, dataHash, dataCenterImage, type, backgroundImage} = props;

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none")

    const [isPic, setPic] = useState(false)
    const [naturalSize, setSize] = useState({ width: null, height: null })

    const cropperRef = useRef(null);
    const onCrop = () => {
        const cropper = cropperRef.current?.cropper;
        const ctx = thumbref.current.getContext('2d');

        ctx.fillRect(0,0,150,150)
        
        setSize({ height: cropper.canvasData.naturalHeight, width: cropper.canvasData.naturalWidth });

        setPicCoord({
            left: Math.round(cropper.cropBoxData.left - cropper.canvasData.left),
            top: Math.round(cropper.cropBoxData.top - cropper.canvasData.top),
            width: cropper.cropBoxData.width,
            height: cropper.cropBoxData.height
        })

    };

    let img = new Image();

    if (type == 'edit' && dataCenterImage !== 0) {
        img.src = DIRPATH + "/image" + dataId + ".jpg?" + dataHash;
    } else if (type == 'sitepage' && backgroundImage != null && backgroundImage != undefined) {
        img.src = backgroundImage.src
    } else {
        img.src = DIRPATH + "/new.jpg";
    }
    
    const onChangePicture = (e) => {
        if (e.target.files.length > 0 && (e.target.files[0].type == 'image/jpeg' || e.target.files[0].type == 'image/png')) {
            setSelectedPicture(URL.createObjectURL(e.target.files[0]));
            setPic(true)
            setPreview(false)
            setSelectedPictureSend(e.target.files[0]);
        } else {
            setSystemMessageText("Выберите другое изображение");
            setSystemMessageType("error")
        }
    };

    const [prevSize, setPrevSize] = useState({x: 150, y: 150})

    const [preview, setPreview] = useState(false)
    const [selectedPicture, setSelectedPicture] = useState(img.src);
    
    const thumbref = useRef()
    useEffect(() => {
        if (thumbref.current) {
            const ctx = thumbref.current.getContext('2d');
            ctx.strokeRect(0,0,prevSize.x, prevSize.y)

            let image = new Image
            image.src = selectedPicture
            if (selectedPicture != null && isPic) {
                let top = 0;
                let left = 0;
                let sizeH = 0;
                let sizeW = 0;
                let coeff = 0;
                if (naturalSize.width >= naturalSize.height * 2) {
                    sizeW = 800;
                    sizeH = naturalSize.height * sizeW / naturalSize.width;
                } else {
                    sizeH = 400;
                    sizeW = naturalSize.width * sizeH / naturalSize.height;
                }

                coeff = naturalSize.width / sizeW;
                top = selectedPicCoord.top * coeff;
                left = selectedPicCoord.left * coeff;
                sizeW = selectedPicCoord.width * coeff;
                sizeH = selectedPicCoord.height * coeff;

                if (sizeW != sizeH && selectedPicCoord.height) {
                    setPrevSize({x: selectedPicCoord.width * 150 / selectedPicCoord.height, y: 150})
                }

                // Guard: createImageBitmap падает с RangeError, если ширина или
                // высота кропа = 0 (это бывает, пока пользователь ещё не выбрал
                // область кропа после загрузки картинки).
                if (sizeW > 0 && sizeH > 0) {
                    Promise.all([
                        createImageBitmap(image, left, top, sizeW, sizeH).then(imageBitmap => {
                            ctx.drawImage(imageBitmap, 0, 0, sizeW, sizeH, 0, 0, prevSize.x, prevSize.y)
                        })
                    ]).catch(() => { /* картинка ещё не готова — пропускаем */ })
                }
            }
            if (selectedPicture != null && !isPic) {
                ctx.drawImage(img, 0, 0, 350, 350, 0, 0, prevSize.x, prevSize.y)
            }
        }
    }, [preview, naturalSize, selectedPicture, isPic])

    useEffect(() => {
        setSelectedPicture(img.src)

        if (props.type == 'edit' && dataCenterImage !== 0) {
            img.src = DIRPATH + "/image" + dataId + ".jpg?" + dataHash;
            setPic(false)
        } else if (type == 'sitepage' && backgroundImage != null && backgroundImage != undefined) {
            img.src = backgroundImage.src
            setPic(false)
        } else {
            img.src = DIRPATH + "/new.jpg";
            setPic(false)
        }
    },[backgroundImage])


    return(
        <div>
        <p>Изображение для обложки:</p>
        {isPic && !preview &&
            <Cropper
                src={selectedPicture}
                style={{ height: 400, width: 800 }}
                // Cropper.js options
                checkCrossOrigin={false}
                viewMode={1}
                movable={false}
                scalable={false}
                zoomable={false}
                initialAspectRatio={type == "sitepage" ? 'free' : 1}
                aspectRatio={type == "sitepage" ? 'free' : 1}
                guides={false}
                crop={onCrop}
                ref={cropperRef}
            />
        }
        <canvas id='thumbnail' ref={thumbref} width={prevSize.x} height={prevSize.y} />
        {isPic && !preview && 
            <button onClick={() => setPreview(true)}>Сохранить</button>
        }
        <input
            id="image"
            type="file"
            capture
            onChange={onChangePicture}
        />
       
        <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageType} setStatus = {setSystemMessageType} />
        </div>
    )
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/*function IconThumbnail(props) {
    const thumbref = useRef()
    const w = 200;

    const {sectors, circles, angles} = props;

    useEffect(() => {
        if (thumbref.current) {
            const ctx = thumbref.current.getContext('2d');
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, w, w);

            if (angles) {
                ctx.strokeRect(0, 0, w/2, w/2);
                ctx.strokeRect(w/2, 0, w, w/2);
                ctx.strokeRect(0, w/2, w/2, w);
                ctx.strokeRect(w/2, w/2, w, w);
                ctx.strokeRect(0, 0, w, w);
            }
            ctx.arc(w/2, w/2, 50, 0, 2 * Math.PI);
            
            ctx.fill();
            for (let i = 0; i < circles; i++) {
                for (let j = 0; j < sectors; j++) {
                    let startAngle = degToRad(Number(- 90 + (360 / sectors) * j));
                    let stopAngle = degToRad(Number(- 90 + (360 / sectors) * (j + 1)));
                    ctx.beginPath();
                    ctx.arc(w / 2, w / 2, 50 + i * 40 / circles, startAngle, stopAngle, false);
                    ctx.arc(w / 2, w / 2, 50 + (i + 1) * 40 / circles, stopAngle, startAngle, true);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke()
                }
            }
        }
    },[sectors, circles, angles])

    return (
        <canvas className="iconthumb"
            ref = {thumbref}
            width = {w}
            height = {w}
        />
    )
}*/

export function PrivacySettins(props) {

    const {selectedPrivacy, setSelectedPrivacy,
            selectedChild, setSelectedChild,
            selectedComments, setSelectedComments,
            selectedType, data, selectedCircles, selectedSectors, selectedAngles,
            setSelectedCircles, setSelectedSectors, setSelectedAngles,
            type, elemArr, setSelectedElements, setSelectedPictureSend,
            setPicCoord, selectedPicCoord
        } = props

    const onChangePrivacy = (e) => {
        setSelectedPrivacy(e.target.value);
        if (e.target.value == 2) {
            setSelectedChild(0);
            setSelectedComments(0);
        }
    };

    return (
    <>
        {/* <IconThumbnail sectors = {selectedSectors} circles = {selectedCircles} angles = {selectedAngles}/> */} 


        <ThankaPic 
            setSelectedPictureSend = {setSelectedPictureSend} 
            setPicCoord = {setPicCoord} 
            selectedPicCoord = {selectedPicCoord}
            dataId = {data.Id}
            dataHash = {data.Hash}
            dataCenterImage = {data.CenterImage}
            type = {type}
        />

        <p>Кто может просматривать тханку:</p>
        {selectedType == 'cabinet' ?
            <p className="privacy-label">
                <input type = "radio" name = "privacy" value={2} disabled = {"disabled"} defaultChecked = {true}/>
                Только я
            </p>
            :
            <>
                <p className="privacy-label"><label><input type = "radio" name = "privacy" value={0} onChange={onChangePrivacy} checked={selectedPrivacy == 0}/>Все</label></p>
                {selectedType != "hashtag" &&
                <>
                    <p className="privacy-label"><label><input type = "radio" name = "privacy" value={1} onChange={onChangePrivacy} checked={selectedPrivacy == 1}/>Только авторизованные пользователи</label></p>
                    <p className="privacy-label"><label><input type = "radio" name = "privacy" value={2} onChange={onChangePrivacy} checked={selectedPrivacy == 2}/>Только я</label></p>
                    <p className="privacy-label"><label><input type = "radio" name = "privacy" value={3} onChange={onChangePrivacy} checked={selectedPrivacy == 3}/>Только подписчики</label></p>
                </>
                }
            </>
        }

        {(selectedType == "document" || type == "add" || ((type == "create" && selectedType != "document") ||
            (type == "edit" && data.Thanka.DocumentPart != true))) &&
            <>
                {(selectedType != 'hashtag' && selectedPrivacy != 2) && 
                    <p>Могут ли другие пользователи создавать тханки:
                        <input
                            defaultValue={selectedChild}
                            type={"checkbox"}
                            onChange={(e) => setSelectedChild(Number(e.target.checked))}
                            checked={selectedChild}
                        />
                    </p>
                }
                { selectedPrivacy != 2 && 
                    <p>Могут ли другие пользователи оставлять комментарии:
                        <input
                            defaultValue={selectedComments}
                            type={"checkbox"}
                            onChange={(e) => setSelectedComments(Number(e.target.checked))}
                            checked={selectedComments}
                        />
                    </p>
                }

                <p>Количество секторов:</p>
                <input defaultValue={selectedSectors} type = "number" className="circleSector" min = {1} max = {30}
                    onChange={(e) => setSelectedSectors(e.target.value)}
                />

                <p>Количество кругов:</p>
                <input defaultValue={selectedCircles} type = "number" className="circleSector" min = {1} max = {5}
                    onChange={(e) => setSelectedCircles(e.target.value)}
                />
            </>
        }

      
      { selectedPrivacy != 2 && 
        <>
            <p>Привязка к каталогам</p>
            <label>Показывать углы
                <input
                    defaultValue={selectedAngles}
                    type={"checkbox"}
                    onChange={(e) => setSelectedAngles(Number(e.target.checked))}
                    checked={selectedAngles}
                />
            </label>
            <label>Углы
                <Elements data={data} list={data.Elements} setElements={setSelectedElements} elemArr={elemArr} />
            </label>
        </>  
        } 
    </>
    )
}