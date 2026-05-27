import React, { useEffect, useRef, useState, useMemo } from "react";
import { useActions } from '../../hooks/useActions';
import { DIRPATH } from "../../utils/url.js";
import { useMediaQuery } from 'react-responsive'

const strokeColour = '#606060';
//const strokeColour = '#eaeaea';

function Elements(props, imgDim, width, height) {

    const w = width;
    const h = height;

    const {data} = props

    if (data.Elements == null) return (<></>);

    let thankaArray = [];

    let len = data.Elements.length;
    if (len > 4) len = 4;

    for (let i = 0; i < len; i++) {
        thankaArray[i] = {
            Id: data.Elements[i].ID,
            Description: data.Elements[i].Annotation,
            Name: data.Elements[i].Name
        }
    }

    let images = [];

    for (let i = 0; i < len; i++) {
        images[i] = new Image;
        if (data.Elements[i].Image == 1) images[i].src = DIRPATH + '/image' + thankaArray[i].Id + '.jpg?' + data.Hash;
        else images[i].src = DIRPATH + '/unfound.jpg?' + data.Hash;
    }

    //Координаты левых верхних углов
    let coord = [];
    coord[0] = { x: 0, y: 0 }
    coord[1] = { x: w / 2, y: 0 }
    coord[2] = { x: 0, y: h / 2 }
    coord[3] = { x: w / 2, y: h / 2 }

    //----------------------------------- 
    function generateShapes() {
        let arr = [];
        for (let i = 0; i < len; i++) {
            arr.push({
                x: coord[i].x,
                y: coord[i].y,
                width: w / 2,
                height: h / 2,
                Id: thankaArray[i].Id,
                Name: thankaArray[i].Name,
                Description: thankaArray[i].Description,
                Image: data.Elements[i].Image,
                headerName: thankaArray[i].Name,
                stroke: strokeColour,
                strokeWidth: 3,
                fillPatternImage: images[i],
                fillPatternScaleX: (w / 2) / imgDim,
                fillPatternScaleY: (h / 2) / imgDim,
                isSelect: false
            })
        }
        return arr;
    }

    return generateShapes()
}

function Center(props) {

    const { inR, outR, w, h, data, childrenId, mousePosition, isPreviewImage, isLite } = props;

    const imgref = useRef(null);
    const imgPrevref = useRef(null);

    let img = new Image();

    if (data.CenterImage == 1) {
        img.src = DIRPATH + '/image' + data.Id + '.jpg?' + data.Hash;
    } else img.src = DIRPATH + '/unfound.jpg?' + data.Hash;

    useEffect(() => {
        if (img != null) {
            img.onload = function () {
                imgref.current = img;
                setCircle({
                    x: w / 2,
                    y: h / 2,
                    radius: data.Thanka.CirclesNum == 0 ? outR : inR,
                    image: imgref.current
                })
            }
        }
    }, [img.onload, w, inR, outR])

    //вот здесь появляется Id нужного сектора
    let imagePreview = new Image;

    const [circle, setCircle] = useState({})
    const Circleref = useRef()

    useEffect(() => {
        const ctxC = Circleref.current.getContext('2d');
        
        if (isPreviewImage) {
                imagePreview.src = DIRPATH + '/image' + childrenId + '.jpg?' + data.Hash;
        } else {
                imagePreview.src = DIRPATH + '/unfound.jpg?' + data.Hash;
        }
        imagePreview.onload = function () {
            imgPrevref.current = imagePreview;
        }
        //if (Circleref.current) {
            //const ctxC = Circleref.current.getContext('2d');
            if (circle.image != null) {
                ctxC.clearRect(0, 0, w, h)
                ctxC.strokeStyle = strokeColour;
                ctxC.lineWidth = 6;
                ctxC.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                ctxC.clip();
                if (childrenId != null)
                    ctxC.drawImage(imagePreview, w / 2 - circle.radius, h / 2 - circle.radius, circle.radius * 2, circle.radius * 2);
                if ((mousePosition.circle === false && mousePosition.elem === false && mousePosition.center === false) ||
                    mousePosition.center || ((mousePosition.circle === false && mousePosition.elem === false) 
                    || childrenId == null)) {
                    ctxC.drawImage(circle.image, w / 2 - circle.radius, h / 2 - circle.radius, circle.radius * 2, circle.radius * 2);
                }
                ctxC.stroke();
            }
        //}
    }, [childrenId, circle.image, circle, mousePosition.center, mousePosition.elem, mousePosition.circle, mousePosition.sector])

    return (
        <canvas className={!isLite ? "canvas" : "canvasLite"}
            ref={Circleref}
            width={w}
            height={h}
            onMouseMove={props.onMouseMove}
            onClick={props.onClick}
            onPointerOut={props.onPointerOut}
            onPointerMove={props.onMouseMove}
        />
    );
}

function thankaArrays(data) {
    console.log("THANKA ARRAYS INPUT " + JSON.stringify({
        thankaId: data?.Id,
        visibleElements: data?.Thanka?.VisibleElements,
        circlesNum: data?.Thanka?.CirclesNum,
        sectorsNum: data?.Thanka?.SectorsNum,
        documentPart: data?.Thanka?.DocumentPart,
        objectType: data?.Object?.Type,
        childrenCount: data?.Children?.length,
        childrenImage: data?.ChildrenImage,
        children: data?.Children?.map((item, idx) => ({
            idx,
            id: item?.ID,
            image: item?.Image,
            name: item?.Name
        }))
    }));

    let c = data.Thanka.CirclesNum; //количество кругов; дефолт = 1
    let n = data.Thanka.SectorsNum; //количество секторов в настройках
    let narr = [];

    if (c === undefined) c = 1;
    if (n === undefined) n = 12;

    let realn = []; //истинное количество секторов
    realn[0] = 0;
    let childrenImage = [];
    let thankaArray = [];
    let images = [];

    //СКОЛЬКО СЕКТОРОВ В КАЖДОМ КРУГЕ
    //у главы все его сектора это сиблинги
    if (data.Thanka.DocumentPart == true) {
        if (data.Object.Type != "document") {
            c = 1;
            //взять значение родителя
            narr[0] = data.Thanka.ParentsSectors;
            narr[1] = 0;
        }
        //у главы-документа два круга
        if (data.Object.Type == "document") {
            c = 2;
            narr[0] = data.Thanka.ParentsSectors;
            narr[1] = n;
        }

        childrenImage[0] = data.DocImage.slice();
        childrenImage[1] = data.ChildrenImage != undefined ? data.ChildrenImage.slice() : 0;

        thankaArray[0] = [];
        for (let j = 0; j < narr[0]; j++) {
            if (data.DocumentsParts != null && j < data.DocumentsParts.length) {
                thankaArray[0][j] = {
                    Id: data.DocumentsParts[j].ID,
                    Description: data.DocumentsParts[j].Annotation,
                    Name: data.DocumentsParts[j].Name,
                    URL: data.DocumentsParts[j].DocumentPath
                };
            } else {
                thankaArray[0][j] = {
                    Id: -1,
                    Name: "",
                };
            }
        }

        thankaArray[1] = [];
        for (let j = 0; j < narr[1]; j++) {
            if (data.Children != null && j < data.Children.length) {
                thankaArray[1][j] = {
                    Id: data.Children[j].ID,
                    Description: data.Children[j].Annotation,
                    Name: data.Children[j].Name,
                    URL: data.Children[j].DocumentPath
                };
            } else {
                thankaArray[1][j] = {
                    Id: 0,
                    Name: "создать тханку",
                };
            }
        }
    } else { //НОРМАЛЬНЫЕ ТХАНКИ
        let rn = data.Children != null ? data.Children.length : 0;

        for (let i = 0; i < c; i++) {
            narr[i] = n;
        }

        //раскладываем сектора по кружочкам
        for (let i = 0; i < c; i++) {
            if (rn > n) {
                realn[i] = n;
                rn = rn - n;
            } else if (rn <= n) {
                realn[i] = rn;
                rn = 0;
            } else if (rn == 0) {
                realn[i] = 0;
            }
        }

        for (let i = 0; i < c; i++) {
            thankaArray[i] = [];
            for (let j = 0; j < n; j++) {
                if (j < realn[i]) {
                    thankaArray[i][j] = {
                        Id: data.Children[j + n * i].ID,
                        Description: data.Children[j + n * i].Annotation,
                        Name: data.Children[j + n * i].Name,
                        URL: data.Children[j + n * i].DocumentPath == undefined ?
                            data.Children[j + n * i].ID :
                            data.Children[j + n * i].DocumentPath
                    };
                } else {
                    thankaArray[i][j] = {
                        Id: data.Object.Type == 'hashtag' ? -1 : 0,
                        Name: data.Object.Type == 'hashtag' ? "" : "создать тханку",
                    };
                }
            }
        }

        for (let i = 0; i < c; i++) {
            childrenImage[i] = [];
            for (let j = 0; j < realn[i]; j++) {
                childrenImage[i][j] = data.Children[j + i * n].Image;
            }
        }
        console.log("THANKA ARRAYS DISTRIBUTION " + JSON.stringify({
            thankaId: data?.Id,
            c,
            n,
            narr,
            realn,
            thankaArray: thankaArray.map((circle, i) =>
                circle.map((sector, j) => ({
                circle: i,
                sector: j,
                id: sector?.Id,
                name: sector?.Name
                }))
            ),
            childrenImage
        }));
    }

    //почему тут одинарный массив выдается
    for (let i = 0; i < c; i++) {
        images[i] = [];
        for (let j = 0; j < narr[i]; j++) {
            images[i][j] = new Image();
            if (thankaArray[i][j].Id != 0 && thankaArray[i][j].Id != -1) {
                if (childrenImage[i][j] == 1) {
                    images[i][j].src = DIRPATH + "/image" + thankaArray[i][j].Id + ".jpg?" + data.Hash;
                    thankaArray[i][j].Image = 1
                }
                else {
                    thankaArray[i][j].Image = 0
                    images[i][j].src = DIRPATH + "/unfound.jpg?" + data.Hash;
                }
            } else {
                images[i][j].src = DIRPATH + "/empty.jpg";
                thankaArray[i][j].Image = 0
            }
            console.log("SECTOR IMAGE DECISION " + JSON.stringify({
                thankaId: data?.Id,
                circle: i,
                sector: j,
                sectorId: thankaArray[i][j]?.Id,
                sectorName: thankaArray[i][j]?.Name,
                childImageFlag: childrenImage[i]?.[j],
                finalImageFlag: thankaArray[i][j]?.Image,
                src: images[i][j]?.src
            }));
        }
    }

    return { thankaArray: thankaArray, images: images, narr: narr, childrenImage: childrenImage, c: c }
}

function radToDeg(rad) {
    return rad / (Math.PI / 180);
}

function ImageCoordinates(width, inR, outR, j, SectorsNum) {
    //координаты и размеры изображений
    let x, y, xb, yb, x2, y2, xb2, yb2;
    x = x2 = xb = xb2 = width / 2;
    y = y2 = yb = yb2 = width / 2;

    let arg = Math.PI / 2 - (Math.PI * 2 * j) / SectorsNum;
    if (radToDeg(arg) >= 360) { arg -= Math.PI * 2 };
    let sin = Math.sin(arg);
    let cos = Math.cos(arg);

    let arg2 = Math.PI / 2 - (Math.PI * 2 * (j + 1)) / SectorsNum;
    if (radToDeg(arg2) >= 360) { arg2 -= Math.PI * 2 };
    let sin2 = Math.sin(arg2);
    let cos2 = Math.cos(arg2);

    //те два узла, которые... первые? Они раньше появляются, если ходить по часовой стрелке, во
    x += inR * cos;
    xb += outR * cos;
    y -= inR * sin;
    yb -= outR * sin;

    //а это вторая пара узлов, которые соприкасаются со следущим сектором по часовой сетке
    //да, это не самая эффективная реализация :D
    x2 += inR * cos2;
    xb2 += outR * cos2;
    y2 -= inR * sin2;
    yb2 -= outR * sin2;

    //координаты нужного квадратика, в который вписан сектор
    let ximg = Math.min(x, xb, x2, xb2);
    let yimg = Math.min(y, yb, y2, yb2);
    let ximg2 = Math.max(x, xb, x2, xb2);
    let yimg2 = Math.max(y, yb, y2, yb2);

    //размеры и координаты центра
    let wimg = Math.max(ximg2 - ximg, yimg2 - yimg);
    let himg = wimg;

    return {
        W: Number(Math.round(wimg)) + 10,
        H: Number(Math.round(himg)) + 10,
    };
}

function generateShapes(narr, radius, thankaArray, images, c, w) {

    let array = [];
    for (let i = 0; i < c; i++) {
        array[i] = [];
        for (let j = 0; j < narr[i]; j++) {
            let imgCoord = ImageCoordinates(w, radius[i], radius[i + 1], j, narr[i]);
            array[i][j] = {
                i: i,
                j: j,
                Id: thankaArray[i][j].Id,
                Name: thankaArray[i][j].Name,
                Description: thankaArray[i][j].Description,
                Image: thankaArray[i][j].Image,
                innerRadius: Number(radius[i]),
                outerRadius: Number(radius[i + 1]),
                rotation: Number(- 90 + (360 / narr[i]) * j),
                startAngle: degToRad(Number(- 90 + (360 / narr[i]) * j)),
                endAngle: degToRad(Number(- 90 + (360 / narr[i]) * (j + 1))),
                angle: 360 / narr[i],
                fillPatternImage: images[i][j],
                height: imgCoord.H,
                width: imgCoord.W
            };
        }
    }
    return array;
}

function OneSector(ctxS, sector, w, h) {

    let startAngle = degToRad(sector.rotation)
    let stopAngle = degToRad(sector.rotation + sector.angle);
    let midAngle = (startAngle + stopAngle) / 2;
    let midRad = sector.innerRadius + (sector.outerRadius - sector.innerRadius) / 2;

    //точка центра
    let sin = Math.sin(midAngle);
    let cos = Math.cos(midAngle);
    let x = w / 2 + midRad * cos;
    let y = h / 2 + midRad * sin;

    ctxS.save();
    ctxS.beginPath();
    ctxS.arc(w / 2, h / 2, sector.innerRadius, startAngle, stopAngle, false);
    ctxS.arc(w / 2, h / 2, sector.outerRadius, stopAngle, startAngle, true);
    ctxS.closePath();
    ctxS.clip()
    ctxS.drawImage(sector.fillPatternImage, x - sector.width / 2, y - sector.height / 2, sector.width, sector.height);
 
    ctxS.restore()
    ctxS.stroke();
}

function OneSectorBig(ctxS, sector, w, h, n) {
    let startAngle = degToRad(sector.rotation - 10)
    let stopAngle = degToRad(sector.rotation + sector.angle + 10);
    let midAngle = (startAngle + stopAngle) / 2;

    let inR = sector.innerRadius - 15;
    let outR = sector.outerRadius + 15;

    let coord = ImageCoordinates(w, inR, outR, sector.j, n)

    let midRad = inR + (outR - inR) / 2;

    //точка центра
    let sin = Math.sin(midAngle);
    let cos = Math.cos(midAngle);
    let x = w / 2 + midRad * cos;
    let y = h / 2 + midRad * sin;

    ctxS.save();
    ctxS.beginPath();
    ctxS.arc(w / 2, h / 2, inR, startAngle, stopAngle, false);
    ctxS.arc(w / 2, h / 2, outR, stopAngle, startAngle, true);
    ctxS.closePath();
    ctxS.clip()
    ctxS.drawImage(sector.fillPatternImage, x - (coord.W + 70) / 2, y - (coord.H + 70) / 2, coord.W + 70, coord.H + 70);

    ctxS.restore()
    ctxS.stroke();
}

function Header(ctxT, name, offsetX, offsetY) {
    ctxT.fillStyle = 'white'
    ctxT.strokeWidth = 1;
    ctxT.strokeStyle = 'black';
    ctxT.font = "bold 16px arial";
    ctxT.fillRect(offsetX + 5, offsetY - 10, ctxT.measureText(name).width + 5, 20)
    ctxT.strokeRect(offsetX + 5, offsetY - 10, ctxT.measureText(name).width + 5, 20)
    ctxT.fillStyle = 'black'
    ctxT.fillText(name, offsetX + 7, offsetY + 5)
}

function Sectors(props) {
    const Sectorsref = useRef()

    const { w, h, inR, outR, data, setSectorsDoubl, isLite } = props;

    let sectorsArr = useMemo(() => thankaArrays(data), []);
    let narr = sectorsArr.narr;
    let c = sectorsArr.c;
    let radius = [];

    //считаем расстояния между окружностями
    let sectDist = (outR - inR) / c;

    radius[0] = inR - 3;
    for (let i = 1; i < c + 1; i++) {
        radius[i] = radius[i - 1] + sectDist;
    }

    const [sectors, setSectors] = useState(generateShapes(narr, radius, sectorsArr.thankaArray, sectorsArr.images, sectorsArr.c, w))

    useEffect(() => {
        setSectors(generateShapes(narr, radius, sectorsArr.thankaArray, sectorsArr.images, sectorsArr.c, w))
        setSectorsDoubl(generateShapes(narr, radius, sectorsArr.thankaArray, sectorsArr.images, sectorsArr.c, w))
    }, [w])

    //первая загрузка
    useEffect(() => {
        const ctxS = Sectorsref.current.getContext('2d');
        for (let i = 0; i < sectorsArr.c; i++) {
            for (let j = 0; j < narr[i]; j++) {
                ctxS.lineWidth = 3;
                ctxS.strokeStyle = strokeColour;
                sectors[i][j].fillPatternImage.onload = function () {
                    OneSector(ctxS, sectors[i][j], w, h);
                }
            }
        }
    },[])

    //все остальные
    useEffect(() => {
        const ctxS = Sectorsref.current.getContext('2d');
        for (let i = 0; i < sectorsArr.c; i++) {
            for (let j = 0; j < narr[i]; j++) {
                ctxS.lineWidth = 3;
                ctxS.strokeStyle = strokeColour;
                //sectors[i][j].fillPatternImage.onload = function () {
                    OneSector(ctxS, sectors[i][j], w, h);
                //}
            }
        }
    },[sectors])

    return (
        <canvas className={!isLite ? "canvas" : "canvasLite"}
            ref={Sectorsref} 
            width={w} 
            height={h} 
            onMouseMove={props.onMouseMove} 
            onPointerDown={props.onMouseMove}
            onPointerMove={props.onMouseMove}
            onClick={props.onClick} 
            onTouchStart={props.onMouseMove}
            onTouchEnd={props.onPointerOut}
            onPointerOut={props.onPointerOut} 
            onPointerUp={props.onPointerOut}
        />
    );
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function getRadius(w) {
    const big = 480;
    const lil = 320;
    const tiny = 250;
    switch (w) {
        case big: {
            return {inR: big / 4 - 20, outR: big / 2 - 20}
        }
        case lil: {
            return {inR: lil / 4 - 20, outR: lil / 2 - 10}
        }
        case tiny: {
            return {inR: tiny / 4 - 20, outR: tiny / 2 - 20}
        }
        default: {
            return {inR: big / 4 - 20, outR: big / 2 - 20}
        }
    }
}

function Canvas(props) {

    const {data, isBigScreen, isTinyScreen, isLite, mainId, isSite} = props

    const big = 480;
    const lil = 320;
    const tiny = 250;

    const [size, setSize] = useState({ w: isBigScreen ? big : (isTinyScreen ? tiny : lil), h: isBigScreen ? big : (isTinyScreen ? tiny : lil)});
    const ref = useRef();
    
    const resizeHandler = () => {
        const { clientHeight, clientWidth } = ref.current || {};
        if (clientHeight != undefined && clientWidth != undefined) {
            setSize({ h: clientWidth, w: clientWidth });
        }
    };

    useEffect(() => {
            window.addEventListener("resize", resizeHandler);
            resizeHandler();
            return () => {
                window.removeEventListener("resize", resizeHandler);
            };
    }, [])
    
    const Elemref = useRef()
    const bigRef = useRef()
    const titleRef = useRef()

    const imgDim = 350;

    let arr = useMemo(() => Elements(props, imgDim, size.w, size.h), [size.w, size.h]);
    let sectorsArr = useMemo(() => thankaArrays(data), []);
    let narr = sectorsArr.narr;
    let c = sectorsArr.c;

    let access = "";
    switch (data.PrivacyLevel) {
        case 3: //можно создавать тханки
        case 5: //админ + создание тханок
        case 6: //владелец  
            { access = true; break; }
        default: { access = false; break; }
    }

    const [radius, setRadius] = useState([])
    const [sectors, setSectors] = useState([])

    useEffect(() => {
        let inR = getRadius(size.w).inR
        let outR = getRadius(size.w).outR

        let radius = [];
        //считаем расстояния между окружностями
        let sectDist = (outR - inR) / c;
        radius[0] = inR - 3;
        for (let i = 1; i < c + 1; i++) {
            radius[i] = radius[i - 1] + sectDist;
        }
        setRadius(radius)

        let sectors = [];
        for (let i = 0; i < narr.length; i++) {
            sectors[i] = []
            for (let j = 0; j < narr[i]; j++) {
                sectors[i][j] = {}
                sectors[i][j].startRadius = radius[i];
                sectors[i][j].endRadius = radius[i + 1];
                sectors[i][j].startAngle = - (Math.PI / 2) + (Math.PI * 2 * j / narr[i]);
                sectors[i][j].endAngle = - (Math.PI / 2) + (Math.PI * 2 * (j + 1) / narr[i]);
            }
        }
        setSectors(sectors)
    },[size])

    const [sectorsDoubl, setSectorsDoubl] = useState(generateShapes(narr, radius, sectorsArr.thankaArray, sectorsArr.images, c, size.w))

    const { getPreview } = useActions();

    //инициализация
    useEffect(() => {
        console.log("VISIBLE ELEMENTS INIT " + JSON.stringify({
            thankaId: data?.Id,
            visibleElements: data?.Thanka?.VisibleElements,
            elementsCount: data?.Elements?.length,
            arrLength: arr?.length
        }));
        if (Elemref.current && data.Thanka.VisibleElements) {
            const ctx = Elemref.current.getContext('2d');
            ctx.strokeStyle = strokeColour;
            ctx.lineWidth = 4;

            //углы
            for (let i = 0; i < arr.length; i++) {
                arr[i].fillPatternImage.onload = function () {
                    var tempCanvas = document.createElement("canvas"),
                        tCtx = tempCanvas.getContext("2d");
                    tempCanvas.width = size.w / 2;
                    tempCanvas.height = size.h / 2;
                    tCtx.drawImage(
                        arr[i].fillPatternImage, 
                        0, 
                        0, 
                        arr[i].fillPatternImage.width, 
                        arr[i].fillPatternImage.height, 
                        0, 
                        0, 
                        size.w / 2, 
                        size.h / 2
                    );
                    let pattern = ctx.createPattern(tempCanvas, 'repeat');
                    ctx.fillStyle = pattern;
                    ctx.fillRect(arr[i].x, arr[i].y, size.w / 2, size.h / 2);
                    ctx.strokeRect(arr[i].x, arr[i].y, size.w / 2, size.h / 2);
                }
            }
        }
    }, [])

    //ресайз
    useEffect(() => {
        if (Elemref.current && data.Thanka.VisibleElements) {
            console.log("VISIBLE ELEMENTS RESIZE", {
                thankaId: data?.Id,
                visibleElements: data?.Thanka?.VisibleElements,
                sizeW: size?.w,
                sizeH: size?.h,
                arrLength: arr?.length
            });
            const ctx = Elemref.current.getContext('2d');
            ctx.strokeStyle = strokeColour;
            ctx.lineWidth = 4;

            //углы
            for (let i = 0; i < arr.length; i++) {
                    var tempCanvas = document.createElement("canvas"),
                        tCtx = tempCanvas.getContext("2d");
                    tempCanvas.width = size.w / 2;
                    tempCanvas.height = size.h / 2;
                    tCtx.drawImage(
                        arr[i].fillPatternImage, 
                        0, 
                        0, 
                        arr[i].fillPatternImage.width, 
                        arr[i].fillPatternImage.height, 
                        0, 
                        0, 
                        size.w / 2, 
                        size.h / 2
                    );
                    let pattern = ctx.createPattern(tempCanvas, 'repeat');
                    ctx.fillStyle = pattern;
                    ctx.fillRect(arr[i].x, arr[i].y, size.w / 2, size.h / 2);
                    ctx.strokeRect(arr[i].x, arr[i].y, size.w / 2, size.h / 2);
                }
        }
    }, [size.w, size.h])

    const [mousePosition, setMouse] = useState({
        sector: false,
        circle: false,
        center: false,
        elem: false,
    })

    const [selectedSector, setSector] = useState({
        sector: false,
        circle: false,
    })

    function onMouseMove(e) {
        const ctx = bigRef.current.getContext('2d');
        const ctxT = titleRef.current.getContext('2d');
        ctx.strokeStyle = strokeColour;
        ctx.lineWidth = 3;
        ctxT.clearRect(0, 0, size.w + 100, size.h)

        if (mousePosition.sector === false) {
            ctx.clearRect(0, 0, size.w, size.h)
        }

        var offsetX = e.nativeEvent.offsetX;
        var offsetY = e.nativeEvent.offsetY;

        var coords = {
            x: offsetX - size.w / 2,
            y: offsetY - size.h / 2,
        };

        let R = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        if (R > radius[c]) {
            if (coords.x < 0 && coords.y < 0) {
                setMouse({ circle: false, sector: false, center: false, elem: 0 })
            }
            if (coords.x > 0 && coords.y < 0) {
                setMouse({ circle: false, sector: false, center: false, elem: 1 })
            }
            if (coords.x < 0 && coords.y > 0) {
                setMouse({ circle: false, sector: false, center: false, elem: 2 })
            }
            if (coords.x > 0 && coords.y > 0) {
                setMouse({ circle: false, sector: false, center: false, elem: 3 })
            }
            let i = mousePosition.elem;
            if (arr[i] && arr[i].Id != undefined) {
                getPreview(
                    arr[i].Id,
                    arr[i].Name,
                    arr[i].Description,
                    arr[i].Image
                );
                Header(ctxT, arr[i].Name, offsetX, offsetY)
            }
        }

        let teta = Math.atan2(coords.y, coords.x)
        if (radToDeg(teta) > -180 && radToDeg(teta) < -90) {
            teta += (Math.PI * 2)
        }

        for (let i = 0; i < narr.length; i++) {
            for (let j = 0; j < narr[i]; j++) {
                if (teta > sectors[i][j].startAngle && teta < sectors[i][j].endAngle && R > sectors[i][j].startRadius && R < sectors[i][j].endRadius) {
                    console.log("HOVER SECTOR", {
                        thankaId: data?.Id,
                        circle: i,
                        sector: j,
                        sectorId: sectorsArr?.thankaArray?.[i]?.[j]?.Id,
                        sectorName: sectorsArr?.thankaArray?.[i]?.[j]?.Name,
                        sectorImage: sectorsArr?.thankaArray?.[i]?.[j]?.Image,
                        startRadius: sectors?.[i]?.[j]?.startRadius,
                        endRadius: sectors?.[i]?.[j]?.endRadius
                    });
                    if ((sectorsArr.thankaArray[i][j].Id !== -1 && sectorsArr.thankaArray[i][j].Id != data.Id)
                        && (access == true || (access != true && sectorsArr.thankaArray[i][j].Id != 0)) ) {
                        if (mousePosition.circle != i || mousePosition.sector != j) {
                            setMouse({ circle: i, sector: j, center: false, elem: false })
                        }
                        if (mousePosition.circle !== selectedSector.circle || mousePosition.sector !== selectedSector.sector) { 
                            ctx.clearRect(0, 0, size.w, size.h)
                            OneSectorBig(ctx, sectorsDoubl[i][j], size.w, size.h, narr[i]);
                            setSector({circle: i, sector: j})
                            if (sectorsArr.thankaArray[i][j].Id != 0 && sectorsArr.thankaArray[i][j].Id != -1) {
                                getPreview(
                                    sectorsArr.thankaArray[i][j].Id,
                                    sectorsArr.thankaArray[i][j].Name,
                                    sectorsArr.thankaArray[i][j].Description,
                                    sectorsArr.thankaArray[i][j].Image
                                );
                            } else getPreview(null);
                        }
                    } else {
                        setMouse({ circle: false, sector: false, center: true, elem: false })
                    }
                    if (sectorsArr.thankaArray[i][j].Id !== -1 && (access == true || (access != true && sectorsArr.thankaArray[i][j].Id != 0))) {
                        Header(ctxT, sectorsArr.thankaArray[i][j].Name, offsetX, offsetY)
                    }
                    break;
                }
            }
        }

        if (R < radius[0]) {
            setMouse({ circle: false, sector: false, center: true, elem: false })
            if (!isLite) {
                Header(ctxT, 'вернуться назад', offsetX, offsetY)
            }
        }
    }
//?lite=true
    function onClick(e) {
        
        let address = "";
        if (mousePosition.center && (!isLite || isLite && data.Id != mainId)) {
            if (data.Thanka.DocumentPart == true) {
                let addr = "";
                let addrarr = data.Thanka.DocumentPath.split("/");
                for (let i = 0; i < addrarr.length - 1; i++) {
                    addr += "/" + addrarr[i];
                }
                address = "/navigator" + addr;
            } else {
                address = '/navigator/' + data.Thanka.ParentId;
            }
        }
        if (mousePosition.elem !== false) {
            address = '/navigator/' + data.Elements[mousePosition.elem].ID;
        }
        if (mousePosition.circle !== false && mousePosition.sector !== false) {
            let i = mousePosition.circle;
            let j = mousePosition.sector;
            if (sectorsArr.thankaArray[i][j].Id == 0 && access == true && !isLite) window.location.assign("/create");
            else if (sectorsArr.thankaArray[i][j].Id !== 0 && sectorsArr.thankaArray[i][j].Id !== -1) {
                address = "/navigator/" + sectorsArr.thankaArray[i][j].URL;
            }
        }
        if (address != "") {
            if (isLite && !isSite) {
                address += "?lite=true"
                window.location.assign(address);
            } 
            if (isLite && isSite) {
                window.open(address);
            } 
            if (!isLite) {
                window.location.assign(address);
            }
        }
    }

    function mouseOut() {
        const ctxT = titleRef.current.getContext('2d');
        const ctx = bigRef.current.getContext('2d');
        ctx.clearRect(0, 0, size.w, size.h)
        ctxT.clearRect(0, 0, size.w + 10, size.h)
        setMouse({ circle: false, sector: false, center: false, elem: false })
    }

    return (
        <div ref={ref}>
            <canvas className={!isLite ? "canvas" : "canvasLite"}
                ref={Elemref}
                width={size.w} height={size.h}
                onMouseMove={onMouseMove}
                onPointerMove={onMouseMove}
                onClick={onClick}
                onPointerOut={props.onPointerOut}
            />
            <Center
                data={data}
                width={size.w}
                height={size.h}
                inR={getRadius(size.w).inR}
                outR={getRadius(size.w).outR}
                w={size.w} h={size.h}
                onMouseMove={onMouseMove}
                onPointerMove={onMouseMove}
                onClick={onClick}
                onPointerOut={props.onPointerOut}
                childrenId={props.childrenId}
                isPreview={props.isPreview}
                isPreviewImage={props.isPreviewImage}
                mousePosition={mousePosition}
                isLite = {isLite}
            />
            <Sectors
                data={data}
                width={size.w} height={size.h}
                imgDim={imgDim}
                w={size.w} h={size.h}
                inR={getRadius(size.w).inR}
                outR={getRadius(size.w).outR}
                onMouseMove={onMouseMove}
                onPointerMove={onMouseMove}
                onClick={onClick}
                onPointerOut={props.onPointerOut}
                setSectorsDoubl = {setSectorsDoubl}
                isLite = {isLite}
            />
            <canvas className={!isLite ? "canvas" : "canvasLite"}
                ref={bigRef}
                width={size.w} height={size.h}
                onMouseMove={onMouseMove}
                onPointerMove={onMouseMove}
                onClick={onClick}
                onPointerOut={props.onPointerOut}
            />
            <canvas className={!isLite ? "canvas" : "canvasLite"}
                ref={titleRef}
                width={size.w + 10} height={size.h}
                onMouseMove={onMouseMove}
                onPointerMove={onMouseMove}
                onClick={onClick}
                onPointerOut={props.onPointerOut}
                onMouseOut={mouseOut}
            />
        </div>
    );
}

export default Canvas;
