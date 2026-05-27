import React, { useEffect, useState, useContext } from 'react';
import { useMediaQuery } from 'react-responsive'
import {PATH, SITE} from "../../utils/url.js";
import axios from 'axios';
import "../../style/thanka.css"

import answers from '../../icons/comments.png';
import comments from '../../icons/post.png';

import {CommentHeader} from "../../components/Society/Comment.jsx"

function Preview(props) {
    return(
        <>
        {/*props.selectedId == props.id &&*/
        <div className='popupPreview'>
            <div /*style={props.preview == true ? {display: "block"} : {display: "none"}}*/>
            <h3>{props.Name}</h3>
            <p dangerouslySetInnerHTML={{ __html: props.Annotation}} />
            <p dangerouslySetInnerHTML={{ __html: props.Desc}} />
            </div>
        </div>
        }
        </>
    )
}

function LeftMenu(props) {
    return(
        <>
            <div className='leftMenu'>
                <button className='menuItem' onClick={props.setState.bind(this, "comments")} style={props.state == "comments" ? {backgroundColor: "#bdbebd"} : {}}>
                    <img src={comments}/>
                    {"Мои Комментарии"}
                </button>
                <button className='menuItem' onClick={props.setState.bind(this, "answers")} style={props.state == "answers" ? {backgroundColor: "#bdbebd"} : {}}> 
                    <img src={answers}/>
                    {"Ответы"}
                </button>
            </div>
        </>
    )
    
}

function CommentPage() {
    const [state, setState] = useState("comments")

    return (
        <section>
            <LeftMenu setState = {setState} state = {state}/>
            <WorkPart state = {state}/>
        </section>
    )
}

function WorkPart(props) {
    return (
        <div className='RightWork'>
            {props.state == "comments" &&
                <Comments />
            }
            {props.state == "answers" &&
                <Answers />
            }
        </div>
    )
}

function Comments() {

    const [comments, setComments] = useState([])

    useEffect(() => {
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'community/community.php?',
            headers: { "content-type": "multipart/form-data" },
            data: { Cabinet: sessionStorage.getItem("cabinet"), method: "getAllComments" }
        }).then((result) => {
            setComments(result.data.CommentList.slice())
        }).catch((error) => {
            //setMessage('Произошла ошибка')
        });
    },[])

    const [preview, showPrewiew] = useState(false)
    const [selectedId, setId] = useState(null)
    const [selectedName, setName] = useState(null)
    const [selectedAnnotation, setAnnotation] = useState(null)
    const [selectedDesc, setDesc] = useState(null)

    function showPopUp(id,name,annotation,desc) {
        showPrewiew(true)
        setId(id)
        setAnnotation(annotation)
        setName(name)
        setDesc(desc)
    } 

    function hidePopUp() {
        showPrewiew(false)
        setId(null)
        setAnnotation(null)
        setName(null)
        setDesc(null)
    } 

return(
    <>
    <h3>Мои комментарии</h3>
    {comments != undefined && comments.map((comment) => (
        <>
        <p>К теме 
            <a href={SITE + "navigator/" + comment.Thanka}
                onMouseOver={showPopUp.bind(this, comment.Thanka,comment.ThankaName,comment.ThankaAnnotation,comment.ThankaDesc)} 
                onMouseOut={hidePopUp.bind(this)} 
            >
            {" " + comment.ThemeName}
            </a>
        </p>
        <div className='commentStory'>
            {comment.Author != undefined &&
                <CommentHeader comment={comment} />
            }
            <p dangerouslySetInnerHTML={{ __html: comment.Text }} />
        </div>
        
        </>
    ))}
    <Preview Name = {selectedName} preview={preview} selectedId={selectedId} Annotation = {selectedAnnotation} Desc = {selectedDesc}/>
    </>
)

}

function Answers() {
    const [comments, setComments] = useState([])

    useEffect(() => {
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'community/community.php?',
            headers: { "content-type": "multipart/form-data" },
            data: { Cabinet: sessionStorage.getItem("cabinet"), method: "getAnswers"}
        }).then((result) => {
            setComments(result.data.CommentList.slice())
        }).catch((error) => {
            //setMessage('Произошла ошибка')
        });
    },[])

    const [preview, showPrewiew] = useState(false)
    const [selectedId, setId] = useState(null)
    const [selectedName, setName] = useState(null)
    const [selectedAnnotation, setAnnotation] = useState(null)
    const [selectedDesc, setDesc] = useState(null)

    function showPopUp(id,name,annotation,desc) {
        showPrewiew(true)
        setId(id)
        setAnnotation(annotation)
        setName(name)
        setDesc(desc)
    } 

    function hidePopUp() {
        showPrewiew(false)
        setId(null)
        setAnnotation(null)
        setName(null)
        setDesc(null)
    } 

return(
    <>
    <h3>Мои ответы</h3>
    {comments != undefined && comments.map((comment) => (
        <>
        <p>К теме 
            <a href={SITE + "navigator/" + comment.Thanka}
                onMouseOver={showPopUp.bind(this, comment.Thanka,comment.ThankaName,comment.ThankaAnnotation,comment.ThankaDesc)} 
                onMouseOut={hidePopUp.bind(this)} 
            >
                {" " + comment.ThemeName}
            </a>
        </p>
        <div className='commentStory'>
            {comment.Author != undefined &&
                <CommentHeader comment={comment} />
            }
            <p dangerouslySetInnerHTML={{ __html: comment.Text }} />
        </div>
        </>
    ))}
    <Preview Name = {selectedName} preview={preview} selectedId={selectedId} Annotation = {selectedAnnotation} Desc = {selectedDesc}/>
    </>
)
}

export default CommentPage