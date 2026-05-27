import React from 'react';
import RightCurrent from './RightCurrent.jsx';
import "../../style/thanka.css"

function Right(props) {

    const {data, style, isLite} = props

    return (
        <>
        <div id={!isLite ? 'thanka-right' : 'thanka-rightLite'} style={style}>
            <RightCurrent data={data} style={props.currStyle} seeLeftLinks = {props.seeLeftLinks} isLite = {isLite}/>
            <RightChild data={data} childrenName={props.childrenName}
                childrenDescription={props.childrenDescription} style={props.childStyle} />
        </div>
        </>
    );
}

function RightChild(props) {
    return (
        <div id="childThanka" style={props.style}>
            <div id='childName'><strong>{props.childrenName}</strong></div>
            <div id='childAnnounce'>
                <p dangerouslySetInnerHTML={{__html: props.childrenDescription}} />
            </div>
        </div>
    );
}

export default Right;