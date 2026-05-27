import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import JoditEditor from "jodit-react";

const TextEditorJD = (props, { placeholder }) => {
    const [content, setContent] = useState("");

    const config = {
        readonly: false, // all options from https://xdsoft.net/jodit/doc/,
        removeButtons: [
            //'font', 
            //'fontsize', 
            'brush', 
            //'paragraph', 
            //'dots', 
            //'hr', 
            'copyformat', 
            'eraser', 
            //'underline', 
            'strikethrough',
            'classSpan', 
            //'lineHeight', 
            'superscript', 
            'subscript', 
            'file', 
            'paste', 
            'cut', 
            'copy', 
            'selectall', 
            'indent', 
            'print', 
            'about',
            'source', 
            'outdent', 
            //'symbols'
        ],
        placeholder: placeholder || "Введите текст",
        askBeforePasteHTML: true,
        //askBeforePasteFromWord: true,
        //processPasteFromWord: true,
        defaultActionOnPaste: "INSERT_AS_HTML",
        uploader: {
            insertImageAsBase64URI: true,
        },
    };

    return (
        useMemo( () => ( 
            <JoditEditor
                refs={props.refs}
                config={config}
                value={props.defaultValue}
                tabIndex={1} // tabIndex of textarea
                onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                onChange={props.onChange}
            />
    ), [] )
    );
};

export default TextEditorJD;
