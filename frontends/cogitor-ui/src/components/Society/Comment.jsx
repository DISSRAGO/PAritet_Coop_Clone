import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import axios from "axios";
import { PATH, SITE } from "../../utils/url.js";
import TextEditorJD from '../TextEditor/Jodit.jsx';

import { DIRPATH } from '../../utils/url.js';

import { dateMonthWord } from '../../utils/language_ru.js';

import { SystemMessage } from '../Viewer/SystemMessage.jsx';

import removeimg from '../../icons/remove.png';
import lock from '../../icons/lock.png';
import add from '../../icons/add.png';
import edit from '../../icons/edit.png';
import question from '../../icons/question.png';
import post from "../../icons/post.png";
import problem from "../../icons/problem.png";
import idea from "../../icons/idea.png";
import add_comment from "../../icons/add_comment.png"

function CommentType(props) {
    return (
        <div className='commentType'>
            <input type='radio' value="post" id="post" name='type' onChange={props.onChange} />
            <label for="post"><img src={post} width={20} />Высказывание</label>
            <input type='radio' value="idea" id="idea" name='type' onChange={props.onChange} />
            <label for="idea"><img src={idea} width={20} />Идея</label>
            <input type='radio' value="question" id="question" name='type' onChange={props.onChange} />
            <label for="question"><img src={question} width={20} />Вопрос</label>
            <input type='radio' value="problem" id="problem" name='type' onChange={props.onChange} />
            <label for="problem"><img src={problem} width={20} />Проблема</label>
        </div>
    )
}

function isMyComment(myAvatars, commentAuthor) {

    let res = false;
    if (myAvatars != null) {
        for (let i = 0; i < myAvatars.length; i++) {
            if (myAvatars[i].ID == commentAuthor) res = true;
        }
    }
    return res;
}

function isEditorTime(dateNow, dateComment) {
    let date = +new Date(dateNow)
    let dateComm = +new Date(dateComment);
    return ((date - dateComm) < 10 * 60 * 1000)
}

function CommentHeader(props) {

    const comment = props.comment;
    let img = <></>

    switch (comment.Type) {
        case 'question': {
            img = <img src={question} width={20} title='Вопрос' />
            break;
        }
        case 'idea': {
            img = <img src={idea} width={20} title='Идея' />
            break;
        }
        case 'problem': {
            img = <img src={problem} width={20} title='Проблема' />
            break;
        }
        default: {
            img = <img src={post} width={20} title='Высказывание' />
        }
    }

    return (
        <p>
            {img}
            <a href={SITE + 'navigator/' + comment.Author}>
                {comment.Image == 1 ?
                    <img src={DIRPATH + "/image" + comment.Author + ".jpg?" + Math.floor(Math.random() * 1000)} width={50} />
                    :
                    <img src={DIRPATH + "/empty.jpg"} width={50} />
                }
            </a>
            <a href={SITE + 'navigator/' + comment.Author}>{comment.AuthorName + "  "}</a>
            {dateMonthWord(comment.Date)}
            {(comment.Edited == true || comment.Edited == 'true') && (" ред.")}

        </p>
    );
}

function CommentTree(props) {

    const { comments, avatarlist, getComments, theme } = props

    const [propComments, setPropComments] = useState(comments.slice())
    const [commentsList, setCommentsList] = useState(comments.slice())
    const [commentsNum, setCommentsNum] = useState(comments.length > 5 ? 5 : comments.length)

    const [editFlag, setEdit] = useState(false);

    useEffect(() => {
        let arr = comments.slice()
        arr.forEach(elem => {
            (elem.Children == undefined && elem.Children == null) ||
                (elem.Children != undefined && elem.Children != null && elem.Children.length == 0) ?
                elem.childVisible = true :
                elem.childVisible = false
        });
        setPropComments(arr.slice())
        setCommentsNum(comments.length > 5 ? 5 : comments.length)
        setCommentsList(arr.slice(0, (comments.length > 5 ? 5 : comments.length)))
    }, [comments])

    useEffect(() => {
        setCommentsList(propComments.slice(0, commentsNum))
    }, [propComments])

    const ShowComments = (n) => {
        setCommentsList(propComments.slice(0, +commentsNum + +n))
        setCommentsNum(+commentsNum + +n)
    }

    const SetVisibleChild = (i) => {
        let arr = propComments.slice()
        arr[i].childVisible = true
        setPropComments(arr)
    }

    return (
        <>
            {commentsList.map((comment, i) => (
                <div className='comment'>
                    <OneComment
                        comment={comment}
                        privacy={props.adminprivacy}
                        editFlag={editFlag}
                        theme={theme}
                        setEdit={setEdit}
                        getComments={getComments}
                        avatarlist={avatarlist}
                    />
                    {comment.childVisible == true ?
                        <>
                            {comment.Children != null && Array.isArray(comment.Children) && comment.Children.map((child) => (
                                <div className='childcomment'>
                                    <OneComment
                                        comment={child}
                                        privacy={props.adminprivacy}
                                        editFlag={editFlag}
                                        theme={theme}
                                        setEdit={setEdit}
                                        getComments={getComments}
                                        avatarlist={avatarlist}
                                    />
                                </div>
                            ))}
                        </> :
                        <div>
                            <a onClick={() => SetVisibleChild(i)}><h4>Раскрыть комментарии</h4></a>
                        </div>
                    }
                    {props.adminprivacy >= 2 &&
                        <>
                            {comment.Author != undefined &&
                            <>
                                {/*<input 
                                    onClick={() => props.setEditorState("answerblock" + comment.ID)}
                                    type='image' src={add} title='добавить комментарий'
                                />*/}
                                <h4><a onClick={() => props.setEditorState("answerblock" + comment.ID)}>Ответить</a></h4>
                                </>
                            }
                            {props.editorState == "answerblock" + comment.ID &&
                                <CommentCreator
                                    parent={comment.ID}
                                    avatarlist={avatarlist}
                                    auth={props.auth}
                                    theme={theme}
                                    setEditorState={props.setEditorState}
                                    getComments={getComments}
                                />
                            }
                        </>
                    }
                </div>
            ))}
            {commentsNum != propComments.length &&
                <>
                    <a onClick={() => ShowComments((+propComments.length - +commentsNum) > 10 ? 10 : (+propComments.length - +commentsNum))}>Показать еще {(+propComments.length - +commentsNum) > 10 ? 10 : (+propComments.length - +commentsNum)} комментариев</a>
                </>
            }
        </>
    );
}

function OneComment(props) {

    const { comment, privacy, editFlag, theme, setEdit, getComments, avatarlist } = props

    return (
        <>
            {comment.Author != undefined &&
                <CommentHeader comment={comment} />
            }
            {editFlag != comment.ID &&
                <p dangerouslySetInnerHTML={{ __html: comment.Text }} />
            }
            {privacy >= 1 &&
                <OneCommentFunctions comment={comment} privacy={privacy} editFlag={editFlag} theme={theme} setEdit={setEdit} getComments={getComments} avatarlist={avatarlist} />
            }
        </>
    )
}

function OneCommentFunctions(props) {

    const { comment, privacy, editFlag, theme, setEdit, getComments, avatarlist } = props

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    function deleteComment(id) {
        axios({
            method: "post",
            url: PATH + 'community/community.php',
            headers: { "content-type": "multipart/form-data" },
            data: { ID: id, method: "deleteComment" },
        }).then((result) => {
            getComments(theme)
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageStatus("error")
        })
    }

    let date = new Date()

    return (
        <>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            {(isMyComment(avatarlist, comment.Author) == true || privacy == 4 || privacy == 5) &&
                comment.Author != undefined &&
                <>
                    {editFlag != comment.ID ?
                        <>
                            <input
                                onClick={deleteComment.bind(this, comment.ID)}
                                type='image' src={removeimg}
                                width={20} title='удалить комментарий'
                            />
                            {isEditorTime(date, comment.Date) &&
                                <input
                                    onClick={setEdit.bind(this, comment.ID)}
                                    type='image' src={edit}
                                    width={20} title='изменить комментарий'
                                />
                            }
                        </>
                        :
                        <CommentEditor
                            ID={comment.ID}
                            avatar={comment.Author}
                            text={comment.Text}
                            theme={theme}
                            setEdit={setEdit}
                            getComments={getComments}
                        />
                    }
                </>
            }
        </>
    )
}

function CommentCreator(props) {

    let list = props.avatarlist;

    const [selectedAvatar, setSelectedAvatar] = useState(list !== null ? list[0].ID : "");

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    const textRef = useRef('');
    const onChangeDesc = (e) => {
        textRef.current = e;
    };

    const CreateComment = (e) => {
        e.preventDefault();

        let Text = (
            textRef.current.value !== undefined ?
                textRef.current.value :
                textRef.current
        );
        let Parent = props.parent;
        let Avatar = selectedAvatar;
        let Login = props.auth.login;
        let UserId = props.auth.id;
        let Theme = props.theme;

        if (Text != "") {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php?',
                headers: { "content-type": "multipart/form-data" },
                data: {
                    Parent: Parent,
                    Text: Text,
                    Avatar: Avatar,
                    Login: Login,
                    UserId: UserId,
                    Theme: Theme,
                    Type: type,
                    method: "createComment"
                }
            }).then((result) => {
                props.setEditorState("none");
                props.getComments(props.theme);
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            });
        } else {
            setSystemMessageText("Введите комментарий");
            setSystemMessageStatus("warning")
        }
    }

    const [type, setType] = useState("post");
    function onChangeType(e) {
        setType(e.target.defaultValue);
    }

    return (
        <>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            {list != null &&
                <select onChange={(e) => setSelectedAvatar(e.target.value)}>
                    {list.map((avatar) => (
                        <option value={avatar.ID}>{avatar.Name}</option>
                    ))}
                </select>
            }
            <CommentType onChange={onChangeType} />
            <TextEditorJD
                refs={textRef}
                onChange={onChangeDesc}
                defaultValue={""}
            />
            <button onClick={CreateComment}>Оставить комментарий</button>
            <button onClick={(e) => props.setEditorState("none")}>Отменить</button>
        </>
    );
}

function CommentEditor(props) {

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    const textRef = useRef('');
    const onChangeDesc = (e) => {
        textRef.current = e;
    };

    const SaveComment = (e) => {
        e.preventDefault();

        let Text = (
            textRef.current.value !== undefined ?
                textRef.current.value :
                textRef.current
        );

        if (Text != "") {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php?',
                headers: { "content-type": "multipart/form-data" },
                data: { ID: props.ID, Text: Text, method: "editComment" }
            }).then((result) => {
                props.setEdit(false);
                props.getComments(props.theme);
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            });
        } else {
            setSystemMessageText("Введите комментарий");
            setSystemMessageStatus("warning")
        }
    }

    return (
        <>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            <TextEditorJD
                refs={textRef}
                onChange={onChangeDesc}
                defaultValue={props.text}
            />
            <button onClick={SaveComment}>Сохранить</button>
        </>
    );
}

function Comment(props) {

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    const [themes, setThemes] = useState([]);
    const [editorState, setEditorState] = useState("none");

    const getThemes = (thanka) => {
        let themes_array = []
        axios({
            //без ? идет не туда, так что, наверное, он нужен
            method: "post",
            url: PATH + 'community/community.php?',
            headers: { "content-type": "multipart/form-data" },
            data: { ThankaId: thanka, Privacy: props.adminprivacy, method: "getThemes" }
        }).then((result) => {
            if (result.data.ThemeList !== null) {
                setThemes(result.data.ThemeList);
                themes_array = result.data.ThemeList
                setSelectedTheme(result.data.ThemeList[0].ID);
                getComments(result.data.ThemeList[0].ID, 0);
            }
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageStatus("error")
        });
        return themes_array
    }

    //const themes = useMemo(() => getThemes(props.thanka),[])

    useEffect(() => {
        getThemes(props.thanka);
    }, []);

    function getComments(theme, i) {
        //if (theme != selectedTheme) {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php?',
                headers: { "content-type": "multipart/form-data" },
                data: { Theme: theme, method: "getComments" }
            }).then((result) => {
                setComments(result.data.CommentList);
                if (result.data.CommentList != null && themes[i] != null && themes[i] != undefined && themes[i].Active != 'false') {
                    let arr = themes.slice();
                    arr[i].Active = true
                    setSelectedTheme(theme)
                }
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            })
        //}
    }

    const [selectedTheme, setSelectedTheme] = useState("");
    const [comments, setComments] = useState([]);
    const onClickTheme = (ID, i) => {
        getComments(ID, i);
        setSelectedTheme(ID);
    }

    const [themePrivacy, setThemePrivacy] = useState(0);
    const activeButton = { 'background-color': '#e0e0e0' };
    const passiveButton = { 'background-color': '#f0f0f0' };

    const [privateStyle, setPrivate] = useState(passiveButton);
    const [commonStyle, setCommon] = useState(passiveButton);

    function selectPrivacy(privacy) {
        setThemePrivacy(privacy);
        if (privacy == 2) {
            setPrivate(activeButton);
            setCommon(passiveButton);
        } else {
            setPrivate(passiveButton);
            setCommon(activeButton);
        }
    }

    const createTheme = (e) => {
        if (themeName != "") {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php?',
                headers: { "content-type": "multipart/form-data" },
                data: { ThankaId: props.thanka, Name: themeName, Type: "comment", Privacy: themePrivacy, method: "createTheme" }
            }).then((result) => {
                setThemeCreateStyle("none");
                getThemes(props.thanka);
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            })
        } else {
            setSystemMessageText("Введите название темы");
            setSystemMessageStatus("warning")
        }
    }

    function deleteTheme(id, i) {
        if (id != "") {
            axios({
                //без ? идет не туда, так что, наверное, он нужен
                method: "post",
                url: PATH + 'community/community.php',
                headers: { "content-type": "multipart/form-data" },
                data: { Theme: id, method: "deleteTheme" }
            }).then((result) => {
                let arr = themes.slice()
                arr[i].Removed = 1;
                setThemes(arr);
            }).catch((error) => {
                setSystemMessageText("Произошла ошибка");
                setSystemMessageStatus("error")
            })
        } else {
            //setMessage("Введите название темы")
        }
    }

    const [themeName, setThemeName] = useState("");

    const [themeCreateStyle, setThemeCreateStyle] = useState('none');
    const onClickOpenButton = (e) => {
        if (themeCreateStyle == "none")
            setThemeCreateStyle("block");
        if (themeCreateStyle == "block")
            setThemeCreateStyle("none");
    }

    // const 
    /*
        const [commentsTop, setCommentsTop] = useState(commentsRef.current != undefined && commentsRef.current.offsetTop)
        useEffect(() => {
            commentsRef.current.offsetTop = commentsRef.current.offsetTop > commentsTop ? commentsRef.current.offsetTop : commentsTop
        },[commentsRef.current && commentsRef.current.offsetTop])*/

    return (
        <div className='socialblock'>
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageStatus} setStatus={setSystemMessageStatus} />
            {themes.length > 0 &&
                <>
                <h4>Комментарии</h4>
                <div className='comment'>
                    {themes.map((theme, i) => (
                        <>
                            {theme.Removed != true &&
                                <div className='themeName' onClick={() => onClickTheme(theme.ID, i)}>
                                    <a style={selectedTheme == theme.ID ? { fontStyle: 'italic' } : {}}>{theme.Name}</a>
                                    {theme.Privacy == 2 &&
                                        <img src={lock} />
                                    }
                                    {(theme.Active == "false" || theme.Active == false) && props.adminprivacy >= 4 &&
                                        <input
                                            onClick={() => deleteTheme(theme.ID, i)}
                                            type='image' src={removeimg} title='удалить тему'
                                            style={{ width: '15px', margin: "0px", padding: "0px" }}
                                        />
                                    }
                                </div>
                            }
                        </>
                    ))}
                    {props.adminprivacy >= 2 &&
                        <input
                            onClick={onClickOpenButton}
                            type='image' src={add_comment} title='Чтобы написать комментарий, нужно создать или выбрать тему'
                            style={{ width: '20px', margin: "0 10px", padding: "0px" }}
                        />
                    }
                </div>
                </>
            }
            <>
                {themeCreateStyle == "block" &&
                    <>
                        {props.adminprivacy == 6 &&
                            <div>
                                <button onClick={selectPrivacy.bind(this, 2)} style={privateStyle}>Только для меня</button>
                                <button onClick={selectPrivacy.bind(this, 0)} style={commonStyle}>Общий</button>
                            </div>
                        }
                        <div>
                            <input onChange={(e) => setThemeName(e.target.value)} />
                            <button onClick={createTheme}>Сохранить</button>
                        </div>
                    </>
                }
            </>
            {comments != null &&
                <CommentTree
                    avatarlist={props.avatarlist}
                    auth={props.auth}
                    theme={selectedTheme}
                    comments={comments}
                    getComments={getComments}
                    adminprivacy={props.adminprivacy}
                    editorState={editorState}
                    setEditorState={setEditorState}
                />
            }
            {editorState == "none" && selectedTheme != "" && selectedTheme != undefined && props.adminprivacy >= 2 &&
                <h4><a onClick={() => setEditorState("block")}>Добавить комментарий</a></h4>
            }
            {editorState == "block" &&
                <CommentCreator
                    avatarlist={props.avatarlist}
                    auth={props.auth}
                    theme={selectedTheme}
                    setEditorState={setEditorState}
                    getComments={getComments}
                />
            }
        </div>
    );
}

export default Comment;
export { CommentHeader, CommentType }
