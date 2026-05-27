import React, { useEffect, useRef, useState, memo } from "react";
import { DIRPATH } from "../../utils/url.js";
import { useTypedSelector } from "../../hooks/useTypedSelector.ts";
import { Stage, Layer, Rect, Circle, Arrow, Text } from "react-konva";
import axios from "axios";
import { useSpring, animated } from "@react-spring/konva";

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

const contourColour = "#606060";
const radius = 30;
const imgDim = 350;

const babyColor = "#006BA6";
const authorColor = "#0496FF";
const fromColor = "#8EBC82";
const toColor = "#FFBC42";
const linkColor = "#F69248";
const elemColor = "#EC674E";
const sectorLinkColor = "#D81159";
const sectorParentsColor = "#8F2D56";

import { PATH } from "../../utils/url.js";

function countLinks(data) {

    let c =
        data.Children != undefined && data.Children != null
            ? data.Children.length
            : 0;
    let f =
        data.LinksFrom != undefined && data.LinksFrom != null
            ? data.LinksFrom.length
            : 0;
    let t =
        data.LinksTo != undefined && data.LinksTo != null ? data.LinksTo.length : 0;
    let e =
        data.Elements != undefined && data.Elements != null
            ? data.Elements.length
            : 0;
    let s =
        data.LinksSectors != undefined && data.LinksSectors != null
            ? data.LinksSectors.length
            : 0;
    let ss =
        data.SectorLink != "" &&
            data.SectorLink != null &&
            data.SectorLink != undefined
            ? 1
            : 0;

    let pa = 0
    if (
        data.Thanka.ParentId != "" &&
        data.Thanka.ParentId != undefined &&
        data.Thanka.ParentPrivacy > 0
    ) pa++

    if (
        data.Thanka.Author != data.Thanka.ParentId &&
        data.Thanka.Author != "" &&
        data.Thanka.Author != undefined &&
        data.Thanka.AuthorPrivacy > 0
    ) pa++

    if (
        data.SectorLink != "" &&
        data.SectorLink != undefined &&
        data.SectorLink.Removed == 0
    ) pa++

    return { num: c + f + t + e + s + ss + pa, c: c, f: f, t: t, e: e, s: s, ss: ss };
}

function thankaArrays(data, w, h, cx, cy) {
    let numofLinks = countLinks(data);
    let arr = LongCircle(w, h, cx, cy, numofLinks.num);

    let nodes = [];
    let num = 0;

    let links = [];

    nodes.push({
        Id: data.Id,
        Description: data.Thanka.Annotation,
        Name: data.Thanka.Name,
        Image: data.CenterImage,
        Type: "center",
        familyX: cx,
        familyY: cy,
        x: cx,
        y: cy,
        
    });

    if (
        data.Thanka.ParentId != "" &&
        data.Thanka.ParentId != undefined &&
        data.Thanka.ParentPrivacy > 0
    ) {
        nodes.push({
            Id: data.Thanka.ParentId,
            Description: data.Thanka.ParentAnnotation,
            Name: data.Thanka.ParentName,
            Image: data.ParentImage,
            familyX: cx,
            familyY: cy,
            x: cx,
            y: cy - radius * 4,
            
        });
        links.push({
            from: data.Thanka.ParentId,
            to: data.Id,
            type: "child",
            x1: cx,
            y1: cy - radius * 4,
            x2: cx,
            y2: cy,
            color: babyColor,
        });
    }

    if (
        data.Thanka.Author != data.Thanka.ParentId &&
        data.Thanka.Author != "" &&
        data.Thanka.Author != undefined &&
        data.Thanka.AuthorPrivacy > 0
    ) {
        nodes.push({
            Id: data.Thanka.Author,
            Description: data.Thanka.AuthorAnnotation,
            Name: data.Thanka.AuthorName,
            Image: data.AuthorImage,
            familyX: cx,
            familyY: cy,
            x: cx,
            y: cy + radius * 4,
            
        });
        links.push({
            from: data.Thanka.Author,
            to: data.Id,
            type: "author",
            x1: cx,
            y1: cy + radius * 4,
            x2: cx,
            y2: cy,
            color: authorColor,
        });
    }
    if (
        data.SectorLink != "" &&
        data.SectorLink != undefined &&
        data.SectorLink.Removed == 0
    ) {
        nodes.push({
            Id: data.SectorLink.ID,
            Description: data.SectorLink.Annotation,
            Name: data.SectorLink.Name,
            Image: data.SectorLink.Image,
            familyX: cx,
            familyY: cy,
            x: arr[num].x,
            y: arr[num].y,
            
        });
        links.push({
            from: data.SectorLink.ID,
            to: data.Id,
            type: "sectorlink",
            x2: arr[num].x,
            y2: arr[num].y,
            x1: cx,
            y1: cy,
            color: sectorLinkColor,
        });
        num++;
    }
    for (let i = 0; data.Children != null && i < data.Children.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.Children[i].ID) === -1) {
            nodes.push({
                Id: data.Children[i].ID,
                Description: data.Children[i].Annotation,
                Name: data.Children[i].Name,
                Image: data.Children[i].Image,
                familyX: cx,
                familyY: cy,
                docPath: data.Children[i].DocumentPath,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.Id,
                to: data.Children[i].ID,
                type: "child",
                x1: cx,
                y1: cy,
                x2: arr[num].x,
                y2: arr[num].y,
                color: babyColor,
            });
        }
    }
    for (let i = 0; data.LinksFrom != null && i < data.LinksFrom.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksFrom[i].ID) === -1) {
            nodes.push({
                Id: data.LinksFrom[i].ID,
                Description: data.LinksFrom[i].Annotation,
                Name: data.LinksFrom[i].Name,
                Image: data.LinksFrom[i].Image,
                familyX: cx,
                familyY: cy,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.Id,
                to: data.LinksFrom[i].ID,
                type: "from",
                x1: cx,
                y1: cy,
                x2: arr[num].x,
                y2: arr[num].y,
                color: fromColor,
            });
        }
    }

    for (let i = 0; data.LinksTo != null && i < data.LinksTo.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksTo[i].ID) === -1) {
            nodes.push({
                Id: data.LinksTo[i].ID,
                Description: data.LinksTo[i].Annotation,
                Name: data.LinksTo[i].Name,
                Image: data.LinksTo[i].Image,
                familyX: cx,
                familyY: cy,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.LinksTo[i].ID,
                to: data.Id,
                type: "to",
                x1: arr[num].x,
                y1: arr[num].y,
                x2: cx,
                y2: cy,
                color: toColor,
            });
        }
    }

    for (let i = 0; data.LinksSectors != null && i < data.LinksSectors.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksSectors[i].ID) === -1) { 
        nodes.push({
            Id: data.LinksSectors[i].ID,
            Description: data.LinksSectors[i].Annotation,
            Name: data.LinksSectors[i].Name,
            Image: data.LinksSectors[i].Image,
            x: arr[num].x,
            y: arr[num].y,
            familyX: cx,
            familyY: cy,
            
        });
        links.push({
            from: data.Id,
            to: data.LinksSectors[i].ID,
            type: "sectorParents",
            x1: arr[num].x,
            y1: arr[num].y,
            x2: cx,
            y2: cy,
            color: sectorParentsColor,
        });
        }
    }

    for (let i = 0; data.Elements != null && i < data.Elements.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.Elements[i].ID) === -1) {
            nodes.push({
                Id: data.Elements[i].ID,
                Description: data.Elements[i].Annotation,
                Name: data.Elements[i].Name,
                Image: data.Elements[i].Image,
                x: arr[num].x,
                y: arr[num].y,
                familyX: cx,
                familyY: cy,
                
            });
            links.push({
                from: data.Id,
                to: data.Elements[i].ID,
                type: "elements",
                x1: cx,
                y1: cy,
                x2: arr[num].x,
                y2: arr[num].y,
                color: elemColor,
            });
        }
    }

    return { nodes: nodes, links: links };
}

function thankaArrays2(data, x, y, cx, cy, w, h) {
    let numofLinks = countLinks(data);
    let arr = HalfCircle(x, y, cx, cy, numofLinks.num, w, h);

    let nodes = [];
    let num = 0;

    let links = [];

    //ну и што тут за херня
    nodes.push({
        Id: data.Id,
        Description: data.Thanka.Annotation,
        Name: data.Thanka.Name,
        Image: data.CenterImage,
        Type: "center",
        x: x,
        y: y,
        familyX: x, 
        familyY: y,
    });
    if (
        data.Thanka.ParentId != "" &&
        data.Thanka.ParentId != undefined &&
        data.Thanka.ParentPrivacy > 0
    ) {
        nodes.push({
            Id: data.Thanka.ParentId,
            Description: data.Thanka.ParentAnnotation,
            Name: data.Thanka.ParentName,
            Image: data.ParentImage,
            familyX: x,
            familyY: y,
            x: arr[num].x,
            y: arr[num].y,
            
        });
        links.push({
            from: data.Thanka.ParentId,
            to: data.Id,
            type: "child",
            x1: arr[num].x,
            y1: arr[num].y,
            x2: x,
            y2: y,
            color: babyColor,
        });
        num++
    }

    if (
        data.Thanka.Author != data.Thanka.ParentId &&
        data.Thanka.Author != "" &&
        data.Thanka.Author != undefined &&
        data.Thanka.AuthorPrivacy > 0
    ) {
        nodes.push({
            Id: data.Thanka.Author,
            Description: data.Thanka.AuthorAnnotation,
            Name: data.Thanka.AuthorName,
            Image: data.AuthorImage,
            familyX: x,
            familyY: y,
            x: arr[num].x,
            y: arr[num].y,
            
        });
        links.push({
            from: data.Thanka.Author,
            to: data.Id,
            type: "author",
            x1: arr[num].x,
            y1: arr[num].y,
            x2: x,
            y2: y,
            color: authorColor,
        });
        num++
    }
    if (
        data.SectorLink != "" &&
        data.SectorLink != undefined &&
        data.SectorLink.Removed == 0
    ) {
        nodes.push({
            Id: data.SectorLink.ID,
            Description: data.SectorLink.Annotation,
            Name: data.SectorLink.Name,
            Image: data.SectorLink.Image,
            familyX: x,
            familyY: y,
            x: arr[num].x,
            y: arr[num].y,
            
        });
        links.push({
            from: data.SectorLink.ID,
            to: data.Id,
            type: "sectorlink",
            x2: arr[num].x,
            y2: arr[num].y,
            x1: x,
            y1: y,
            color: sectorLinkColor,
        });
        num++;
    }
    for (let i = 0; data.Children != null && i < data.Children.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.Children[i].ID) === -1) {
            nodes.push({
                Id: data.Children[i].ID,
                Description: data.Children[i].Annotation,
                Name: data.Children[i].Name,
                Image: data.Children[i].Image,
                familyX: x,
                familyY: y,
                docPath: data.Children[i].DocumentPath,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.Id,
                to: data.Children[i].ID,
                type: "child",
                x1: x,
                y1: y,
                x2: arr[num].x,
                y2: arr[num].y,
                color: babyColor,
            });
        }
    }
    for (let i = 0; data.LinksFrom != null && i < data.LinksFrom.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksFrom[i].ID) === -1) {
            nodes.push({
                Id: data.LinksFrom[i].ID,
                Description: data.LinksFrom[i].Annotation,
                Name: data.LinksFrom[i].Name,
                Image: data.LinksFrom[i].Image,
                familyX: x,
                familyY: y,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.Id,
                to: data.LinksFrom[i].ID,
                type: "from",
                x1: x,
                y1: y,
                x2: arr[num].x,
                y2: arr[num].y,
                color: fromColor,
            });
        }
    }

    for (let i = 0; data.LinksTo != null && i < data.LinksTo.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksTo[i].ID) === -1) {
            nodes.push({
                Id: data.LinksTo[i].ID,
                Description: data.LinksTo[i].Annotation,
                Name: data.LinksTo[i].Name,
                Image: data.LinksTo[i].Image,
                familyX: x,
                familyY: y,
                x: arr[num].x,
                y: arr[num].y,
                
            });
            links.push({
                from: data.LinksTo[i].ID,
                to: data.Id,
                type: "to",
                x1: arr[num].x,
                y1: arr[num].y,
                x2: x,
                y2: y,
                color: toColor,
            });
        }
    }

    for (let i = 0; data.LinksSectors != null && i < data.LinksSectors.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.LinksSectors[i].ID) === -1) { 
        nodes.push({
            Id: data.LinksSectors[i].ID,
            Description: data.LinksSectors[i].Annotation,
            Name: data.LinksSectors[i].Name,
            Image: data.LinksSectors[i].Image,
            x: arr[num].x,
            y: arr[num].y,
            familyX: x,
            familyY: y,
            
        });
        links.push({
            from: data.Id,
            to: data.LinksSectors[i].ID,
            type: "sectorParents",
            x1: arr[num].x,
            y1: arr[num].y,
            x2: x,
            y2: y,
            color: sectorParentsColor,
        });
        }
    }

    for (let i = 0; data.Elements != null && i < data.Elements.length; i++, num++) {
        if (nodes.findIndex(n => n.Id == data.Elements[i].ID) === -1) {
            nodes.push({
                Id: data.Elements[i].ID,
                Description: data.Elements[i].Annotation,
                Name: data.Elements[i].Name,
                Image: data.Elements[i].Image,
                x: arr[num].x,
                y: arr[num].y,
                familyX: x,
                familyY: y,
                
            });
            links.push({
                from: data.Id,
                to: data.Elements[i].ID,
                type: "elements",
                x1: x,
                y1: y,
                x2: arr[num].x,
                y2: arr[num].y,
                color: elemColor,
            });
        }
    }

    return { nodes: nodes, links: links };
}

const Node = memo(function Node(props) {
    const {
        x,
        y,
        id,
        imgexist,
        name,
        annotation,
        openNode,
        type,
        nodeSlip,
        onPreview,
        offPreview,
    } = props;

    const [image, setImage] = useState(null);
    const imgref = useRef(null);

    let img = new Image();

    useEffect(() => {
        if (imgexist == 1) img.src = DIRPATH + "/image" + id + ".jpg";
        else img.src = DIRPATH + "/unfound.jpg";

        img.onload = function () {
            imgref.current = img;
            setImage(imgref.current);
        };
    }, []);

    const onDblClick = (e) => {
        let url = props.docPath != undefined ? props.docPath : id;
        window.location.assign("/navigator/" + url);
    };

    /* const select = useSpring({
            config: { duration: 500 },
            from: {
                x: id == nodeSlip.id ? nodeSlip.oldX : x,
                y: id == nodeSlip.id ? nodeSlip.oldY : y
            },
            to: {
                x: id == nodeSlip.id ? nodeSlip.newX : x,
                y: id == nodeSlip.id ? nodeSlip.newY : y
            },
        });*/

    return (
        <>
            <Circle
                x={x}
                y={y}
                radius={radius}
                stroke={contourColour}
                strokeWidth={type == "center" ? 4 : 2}
                key={id}
                id={id}
                name={name}
                annotation={annotation}
                type={type}
                familyX={props.familyX}
                familyY={props.familyY}
                docPath={props.docPath}
                fillPatternImage={image}
                fillPatternRepeat={"no-repeat"}
                fillPatternScaleX={(2 * radius) / imgDim}
                fillPatternScaleY={(2 * radius) / imgDim}
                fillPatternX={-radius}
                fillPatternY={-radius}
                onMouseOver={onPreview}
                onMouseMove={onPreview}
                onMouseOut={offPreview}
                onDblClick={onDblClick}
                onClick={openNode}
            />
        </>
    );
});

function Annotation(props) {
    const { preview, isPreview, w, h } = props;

    return (
        <>
            {isPreview && (
                <>
                    <Rect
                        fill="white"
                        stroke={"white"}
                        x={10}
                        y={10}
                        height={h - 20}
                        width={w / 4}
                    />
                    <Text
                        fontSize={16}
                        x={10}
                        y={10}
                        text={preview.id + ": " + preview.name}
                        padding={5}
                        width={w / 4}
                    />
                    <Text
                        text={preview.annotation}
                        width={w / 4}
                        padding={5}
                        x={10}
                        y={10 + 30}
                    />
                </>
            )}
        </>
    );
}

function radToDeg(rad) {
    return rad / (Math.PI / 180);
}

function FindCentersLineCoordinates(cx, cy, r, n1, n2) {
    let arr = [];
    let x, y, arg, sin, cos;

    //лево от -90 до 90
    let n11 = n1 > 1 ? n1 - 1 : n1;

    for (let j = 0; j < n1; j++) {
        arg = Math.PI / 2 - (Math.PI * j) / n11;
        sin = Math.sin(arg);
        cos = Math.cos(arg);

        x = cx + r * cos;
        y = cy - r * sin;

        arr.push({
            x: x,
            y: y,
        });
    }
    //право от -90 до -270
    let n22 = n2 > 1 ? n2 - 1 : n2;

    for (let j = 0; j < n2; j++) {
        arg = Math.PI + Math.PI / 2 - (Math.PI * j) / n22;

        sin = Math.sin(arg);
        cos = Math.cos(arg);

        x = cx + r * cos;
        y = cy - r * sin;

        arr.push({
            x: x,
            y: y,
        });
    }

    return arr;
}

//высчитываем короткое ребрышко по центральным точкам
const Ribs = memo(function Ribs(props) {
    const { x1, y1, x2, y2, color } = props;

    const [S, setS] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let vec = {
            x: x2 - x1,
            y: y2 - y1,
        };

        let len = Math.sqrt(Math.abs(vec.x * vec.x + vec.y * vec.y));
        let m = radius / len;

        setS({
            x: vec.x * m,
            y: vec.y * m,
        });
    }, [x1, x2, y1, y2]);

    return (
        <Arrow
            points={[x1 + S.x, y1 + S.y, x2 - S.x, y2 - S.y]}
            stroke={color}
            fill={color}
            strokeWidth={2}
            key={x1}
        />
    );
});

//удлиннение ребра
function getNewCenterCoordinates(fatherx, fathery, x, y, a, type, w, h) {

    let res = {x: x, y: y};

    let vec = {
        x: x - fatherx,
        y: y - fathery,
    };

    let len = Math.sqrt(Math.abs(vec.x * vec.x + vec.y * vec.y));

    if (type == "short") {
        len *= 3
    } else {
       // len *= 3/2
    }

    let S = {}

    if (len != 0) {
        S = {
            x: vec.x * a / len,
            y: vec.y * a / len,
        };
        if (type == 'closer') {
            res.x = x - S.x
            res.y = y - S.y
        } else {
            res.x = x + S.x
            res.y = y + S.y
        }
    }

    if (w != undefined && h != undefined) {
        if (res.x > w) res.x = w
        if (res.x < -w) res.x = -w
        if (res.y > h) res.y = h
        if (res.y < -h) res.y = -h
    }

    return res;    
}

function LongCircle(w, h, cx, cy, n) {
    let a = w / 2 - radius;

    let arr = [];
    let dot = {};

    let bigRad = w > h ? h / 2 - 2 * radius : w / 2 - 2 * radius;

    let half = Math.floor(n / 2);
    let res = FindCentersLineCoordinates(cx, cy, bigRad, half, n - half);

    let i = 0;
    //это право
    for (i; i < half; i++) {
        dot = {
            x: res[i].x + a / 2 - radius,
            y: res[i].y,
        };
        arr.push(dot);
    }
    //это лево
    for (i; i < n; i++) {
        dot = {
            x: res[i].x - a / 2 + radius,
            y: res[i].y,
        };
        arr.push(dot);
    }

    return arr;
}

//x,y - координаты точки, от которой будут лучики
//cx, cy - координаты центра, к которому принадлежит открываемый кружочек
function HalfCircle(x, y, cx, cy, n, w, h) {
    let a = w / 2 - radius;

    let arr = [];
    let dot = {};

    let bigRad = w > h ? h / 2 - 2 * radius : w / 2 - 2 * radius;

    let half = Math.floor(n / 2);
    let res = FindCoordinates(x, y, cx, cy, bigRad, n);


    /*let i = 0;
    //это право
    for (i; i < half; i++) {
        dot = {
            x: res[i].x + a / 2 - radius,
            y: res[i].y,
        };
        arr.push(dot);
    }
    //это лево
    for (i; i < n; i++) {
        dot = {
            x: res[i].x - a / 2 + radius,
            y: res[i].y,
        };
        arr.push(dot);
    }
*/
    return res;
}

//Решение квадратного уравнения
function getQuadricResult(a,b,c) {

    let D = b * b - 4 * a * c
    if (D > 0) {
        return {
            x1: (-b + Math.sqrt(D)) / (2 * a), 
            x2: (-b - Math.sqrt(D)) / (2 * a)
        }
    } else {
        return {
            x1: undefined,
            x2: undefined
        }
    }
}

function FindCoordinates(x, y, cx, cy, r, n) {
    let arr = [];
    let arg, sin, cos, k, b, k2, b2, result, atan

    //уравнение прямой от центра к новой точке

    if (cx == x) {
        k = undefined
        b = 0
        result = {
            x1: x - r,
            y1: y,
            x2: x + r,
            y2: y,
        }
        atan = 0
    } else {
        k = (cy-y)/(cx-x)
        b = cy - k * cx
        if (k == 0) {
            result = {
                x1: x,
                y1: y - r,
                x2: x,
                y2: y + r,
            }
            atan = Math.PI / 2
        } else {
            k2 = -1 / k
            b2 = y - k2 * x
            result = getQuadricResult(k2*k2+1, 2*(k2*b2-y*k2-x), -(r*r-x*x-y*y+2*y*b2-b2*b2))
            if (result.x1 != undefined && result.x2 != undefined) {
                result.y1 = k2 * result.x1 + b2
                result.y2 = k2 * result.x2 + b2
            }
            atan = Math.atan(k2)
        }
    }
    //перпендикулярная прямая

    console.log("x >= cx "+(x >= cx),"y >= cy "+(y >= cy), "atan "+ radToDeg(atan), atan)
    if (x >= cx && y < cy || x < cx && y >= cy || y < cy && x < cx) {

        for (let j = 0; j < n; j++) {            
            arg = atan + Math.PI / n * j
            console.log("+ "+radToDeg(arg))

            sin = Math.sin(arg);
            cos = Math.cos(arg);

            arr.push({
                x: x + r * cos,
                y: y - r * sin,
            });
        }
    } else {
        for (let j = 0; j < n; j++) {
            arg = atan - Math.PI / n * j
            console.log("- "+radToDeg(arg))

            sin = Math.sin(arg);
            cos = Math.cos(arg);

            arr.push({
                x: x + r * cos,
                y: y - r * sin,
            });
        }
    }
    return arr;
}

function Legend(props) {
    const { w, h } = props;

    const [xOfLines, setXOfLines] = useState(w - 200 + 10);

    const [arrows, setArrows] = useState([]);
    const colors = [
        babyColor,
        authorColor,
        fromColor,
        toColor,
        linkColor,
        elemColor,
        sectorLinkColor,
        sectorParentsColor,
    ];
    const names = [
        "Потомки",
        "Авторство",
        "Исходящие ссылки",
        "Входящие ссылки",
        "Взаимные ссылки",
        "Углы",
        "Ссылки от меня",
        "Ссылки на меня" /*,'Неоткрытый узел','Открытый узел'*/,
    ];
    const [texts, setTexts] = useState([]);
    const [circles, setCircles] = useState([]);

    useEffect(() => {
        setXOfLines(w - 200 + 10);
    }, [w]);

    useEffect(() => {
        let arr = [];
        let distance = 30;
        for (let i = 0; i < colors.length; i++) {
            arr.push({
                points: [xOfLines, distance, xOfLines + 30, distance],
                stroke: colors[i],
                strokeWidth: 4,
            });
            distance += 20;
        }
        setArrows(arr);

        arr = [];
        distance = 30 - 8;
        for (let i = 0; i < names.length; i++) {
            arr.push({
                fontSize: 16,
                x: xOfLines + 40,
                y: distance,
                text: names[i],
                width: 200,
            });
            distance += 20;
        }
        setTexts(arr);
    }, [xOfLines]);

    return (
        </*div texts = {texts} arrows = {arrows}*/>
            <Rect
                fill="white"
                stroke={"white"}
                x={w - 200}
                y={10}
                height={h - 20}
                width={200}
            />
            {arrows.length > 0 &&
                arrows.map((arrow) => (
                    <Arrow
                        points={arrow.points}
                        stroke={arrow.stroke}
                        strokeWidth={arrow.strokeWidth}
                    />
                ))}
            {texts.map((text) => (
                <Text
                    fontSize={text.fontSize}
                    x={text.x}
                    y={text.y}
                    text={text.text}
                    width={text.width}
                />
            ))}
            {/*<Circle 
                x={xOfLines + 15}
                y={160}
                radius={15}
                stroke={contourColour}
                strokeWidth={2}
            />
            <Circle 
                x={xOfLines + 15}
                y={200}
                radius={15}
                stroke={contourColour}
                strokeWidth={4}
            />*/}
        </>
    );
}

function killNodesDubles(arr, node) {

    let flag = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].Id == node.Id) {
            if (node.Type == "center") {
                arr[i] = node;
            }
            flag = 1;
        }
    }
    if (!flag) arr.push(node);

    return arr;
}

function killLinksDoubles(arr, link) {
    let flag = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].from == link.from && arr[i].to == link.to) {
            if ((arr[i].type == "from" && link.type == "to") ||
                (arr[i].type == "to" && link.type == "from")) {
                arr[i].type = "link";
                arr[i].color = linkColor;
            }
            flag = 1;
            break;
        }
    }

    if (!flag) arr.push(link);

    return arr;
}

//построение матрицы смежности
function buildMatrix(arrLinks, arrNodes, w, h) {
    let nodes = []
    //let matrix = []
    let F = []
    for (let i = 0; i < arrNodes.length; i++) {
        //matrix[i] = []
        F[i] = []
        nodes.push({id: arrNodes[i].Id, deg: 0})
        //for (let j = 0; j < arrNodes.length; j++) {
            //matrix[i][j] = 0
        //}
    }

    //for (let i = 0; i < arrNodes.length; i++) {
        
    //}

    for (let i = 0; i < arrLinks.length; i++) {
        let to = arrLinks[i].to
        let from = arrLinks[i].from
        let toIndex = nodes.findIndex(node => node.id == to)
        let fromIndex = nodes.findIndex(node => node.id == from)
        
        //matrix[toIndex][fromIndex] = 1
        //matrix[fromIndex][toIndex] = 1

        nodes[toIndex].deg += 1
        nodes[fromIndex].deg += 1
    }

    /*for (let i = 0; i < arrNodes.length; i++) {
        nodes[i].deg = 0
        for (let j = 0; j < arrNodes.length; j++) {
            nodes[i].deg += matrix[i][j]
        }
    }*/

    for (let i = 0; i < arrNodes.length; i++) {
        for (let j = i+1; j < arrNodes.length; j++) {
            let vIndex = nodes.findIndex(node => node.id == arrNodes[i].Id)
            let wIndex = nodes.findIndex(node => node.id == arrNodes[j].Id)
            let degv = nodes[vIndex].deg
            let degw = nodes[wIndex].deg
            let len = Math.floor(Math.abs(arrNodes[i].x - arrNodes[j].x) * Math.abs(arrNodes[i].x - arrNodes[j].x) + Math.abs(arrNodes[i].y - arrNodes[j].y) * Math.abs(arrNodes[i].y - arrNodes[j].y))
            F[i][j] = Math.floor(len != 0 ? 1000000 * degv*degw/len : 0)

            if (F[i][j] != 0) {
                let res = getNewCenterCoordinates(arrNodes[i].x, arrNodes[i].y, arrNodes[j].x, arrNodes[j].y, 1/F[i][j] * 50, "short", w*0.9*5, h*0.9*5)
                if ((w/2-res.x)*(w/2-res.x)+(h/2-res.y)*(h/2-res.y) > 200*200 && nodes[j].deg > 1) {
                    arrNodes[j].x = res.x != NaN ? res.x : arrNodes[j].x
                    arrNodes[j].y = res.y != NaN ? res.y : arrNodes[j].y
                }
            }   
            if (nodes[i].deg > 5 && (arrNodes[i].x != w/2 || arrNodes[i].y != h/2)) {
                let res = getNewCenterCoordinates(w/2, h/2, arrNodes[i].x, arrNodes[i].y, 1, "closer")
                if ((w/2-res.x)*(w/2-res.x)+(h/2-res.y)*(h/2-res.y) > 200*200) {
                    arrNodes[i].x = res.x != NaN ? res.x : arrNodes[i].x
                    arrNodes[i].y = res.y != NaN ? res.y : arrNodes[i].y
                }
            }
        }  
    }

    return arrNodes
}

function rewriteLinks(arrLinks, arrNodes) {
    for (let i = 0; i < arrNodes.length; i++) {
        for (let j = 0; j < arrLinks.length; j++) {
            if (arrLinks[j].from == arrNodes[i].Id) {
                arrLinks[j].x1 = arrNodes[i].x;
                arrLinks[j].y1 = arrNodes[i].y;
            }
            if (arrLinks[j].to == arrNodes[i].Id) {
                arrLinks[j].x2 = arrNodes[i].x;
                arrLinks[j].y2 = arrNodes[i].y;
            }
        }
    }

    return arrLinks;
}

function Mindmap(props) {
    const { data } = props;

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const [size, setSize] = useState({
        w:
            window.innerWidth < 1200
                ? window.innerWidth - 30
                : window.innerWidth * 0.9 - 30,
        h: window.innerHeight - 200,
    });
    const ref = useRef();

    const resizeHandler = () => {
        const { clientHeight, clientWidth } = ref.current || {};
        if (clientHeight != undefined && clientWidth != undefined) {
            setSize({ h: clientHeight, w: clientWidth });
        }
    };

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    const auth = useTypedSelector((state) => state.user.headerInfo);

    const [scale, setScale] = useState({ x: 1, y: 1 });

    const onWheel = (e) => {
        e.evt.preventDefault();
        //уменьшать
        if (e.evt.deltaY > 0 && scale.x > 0.1) {
            setScale({ x: scale.x * 0.9, y: scale.y * 0.9 });
            //увеличивать
        } else if (e.evt.deltaY < 0 && scale.x < 1.7) {
            setScale({ x: scale.x / 0.9, y: scale.y / 0.9 });
        }
    };

    const [nodes, addNodes] = useState([]);
    const [links, addLinks] = useState([]);

    const [change, setChange] = useState(0);

    const [nodeSlip, setNodeSlip] = useState({});

    useEffect(() => {
        if (size.w != undefined && size.h != undefined) {
            if (change == 0) {
                let temp = thankaArrays(data, size.w, size.h, size.w / 2, size.h / 2);
                addNodes(temp.nodes);
                addLinks(temp.links);
            }
        }
    }, [size.w, size.h]);

    const [preview, setPreview] = useState({ id: "", name: "", annotation: "" });
    const [isPreview, setIsPreview] = useState(false);

    const onPreview = (e) => {
        setIsPreview(true);
        setPreview({
            id: e.target.attrs.id,
            name: e.target.attrs.name,
            annotation: e.target.attrs.annotation != undefined ? e.target.attrs.annotation.replace(/(<([^>]+)>)/gi, "") : "",
        });
    };
    const offPreview = (e) => {
        setIsPreview(false);
    };

    const openNode = (e) => {
        e.evt.preventDefault();

        setSystemMessageText("");
        setSystemMessageType("");

        let attrs = e.target.attrs;

        if (attrs.type != 'center') {

            setChange(1);

            let id = attrs.id;
            let path = attrs.docPath == undefined ? id : attrs.docPath;
            let n = nodes;
            let l = links;

            axios({
                method: "post",
                url: PATH + "thanka/getThanka.php",
                data: JSON.stringify({
                    id: auth.data.id,
                    login: auth.data.login,
                    address: "/navigator/" + path,
                }),
                headers: { "content-type": "application/json" },
            }).then((result) => {
                if (result.data.PrivacyLevel > 0) {
                    setSystemMessageText("");
                    setSystemMessageType("");
                    
                    //здесь надо state прописать
                    let res = {
                        x: attrs.x,
                        y: attrs.y,
                    };

                    //if (countLinks(result.data).num > 0) {
                        res = getNewCenterCoordinates(
                            attrs.familyX,
                            attrs.familyY,
                            attrs.x,
                            attrs.y,
                            size.w / 2
                        )

                    //} 
                    /*else {
                        res = getNewCenterCoordinates(
                            attrs.familyX,
                            attrs.familyY,
                            attrs.x,
                            attrs.y,
                            size.w / 2,
                            "short"
                        )
                    }*/
                    let temp = thankaArrays2(result.data, res.x, res.y, attrs.x, attrs.y, size.w, size.h);

                    for (let i = 0; i < temp.nodes.length; i++) {
                        n = killNodesDubles(n, temp.nodes[i]);
                    }

                    addNodes(n);

                    for (let i = 0; i < temp.links.length; i++) {
                        l = killLinksDoubles(l, temp.links[i]);
                    }

                    //buildMatrix(links,nodes, size.w, size.h)

                    l = rewriteLinks(l, n);
                    addLinks(l);

                } else {
                    setSystemMessageText("нет доступа");
                    setSystemMessageType("error");
                }
            }).catch((error) => {
                setSystemMessageText("Возникла ошибка");
                setSystemMessageType("error");
            });
        }
    };

    return (
        <>
            <SystemMessage
                messageText={systemMessageText}
                setMessageText={setSystemMessageText}
                status={systemMessageType}
                setStatus={setSystemMessageType}
            />
            {size.w != undefined && size.h != undefined && (
                <>
                    <Stage className="annotationLayer" width={size.w} height={size.h}>
                        <Layer>
                            <Annotation
                                h={size.h}
                                w={size.w}
                                preview={preview}
                                isPreview={isPreview}
                            />
                            <Legend h={size.h} w={size.w} />
                        </Layer>
                    </Stage>
                    <Stage
                        width={size.w}
                        height={size.h}
                        draggable={true}
                        scale={scale}
                        onwheel={onWheel}
                    >
                        <Layer>
                            <Graph
                                links={links}
                                nodes={nodes}
                                openNode={openNode}
                                nodeSlip={nodeSlip}
                                w={size.w}
                                h={size.h}
                                setPreview={setPreview}
                                setIsPreview={setIsPreview}
                                onPreview={onPreview}
                                offPreview={offPreview}
                            />
                        </Layer>
                    </Stage>
                </>
            )}
        </>
    );
}

function Graph(props) {
    const {
        links,
        nodes,
        openNode,
        nodeSlip,
        w,
        h,
        setPreview,
        setIsPreview,
        onPreview,
        offPreview,
    } = props;

    return (
        <>
            {links.map((link) => (
                <Ribs
                    x1={link.x1}
                    y1={link.y1}
                    x2={link.x2}
                    y2={link.y2}
                    color={link.color}
                //key = {link.key}
                />
            ))}
            {nodes.map((node) => (
                <Node
                    nodeSlip={nodeSlip}
                    x={node.x}
                    y={node.y}
                    imgexist={node.Image}
                    id={node.Id}
                    name={node.Name}
                    annotation={node.Description}
                    openNode={openNode}
                    //key = {node.key}
                    type={node.Type}
                    w={w}
                    h={h}
                    familyX={node.familyX}
                    familyY={node.familyY}
                    setPreview={setPreview}
                    setIsPreview={setIsPreview}
                    onPreview={onPreview}
                    offPreview={offPreview}
                    docPath={node.docPath}
                />
            ))}
        </>
    );
}

export default Mindmap;
