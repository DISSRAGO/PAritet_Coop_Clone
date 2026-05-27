import React, { useState } from "react";
import "../../style/thanka.css";

//написать нормальный поиск слов по словам
export function ThankaSearch(props) {

    const { content, setData, type } = props

    const [main, setMain] = useState(content.slice())

    //как сделать фильтры на галочки?
    const [idSearch, setIdSearch] = useState(type != "tvt" && type != "shareholder" ? true : false)
    const [nameSearch, setNameSearch] = useState(type != "shareholder" ? true : false)
    const [nameHSearch, setNameHSearch] = useState(type == "shareholder" ? true : false)
    const [accountSearch, setAccountSearch] = useState(type == "shareholder" ? true : false)
    const [annSearch, setAnnSearch] = useState(type != "tvt" && type != "shareholder" ? true : false)
    const [descSearch, setDescSearch] = useState(type != "shareholder" ? true : false)
    const [addrSearch, setAddrSearch] = useState(type == "tvt" ? true : false)

    const [text, setText] = useState("")

    function getLogicValue(elem) {
        return (
            (idSearch && (elem.ID != undefined ? elem.ID.indexOf(text) !== -1 : elem.Id.indexOf(text) !== -1)) ||
            (nameSearch && (elem.Name.toLowerCase().indexOf(text.toLowerCase()) !== -1)) ||
            (nameHSearch && (elem.HolderName.toLowerCase().indexOf(text.toLowerCase()) !== -1)) ||
            (annSearch && (elem.Annotation != undefined && elem.Annotation.toLowerCase().indexOf(text.toLowerCase()) !== -1)) || 
            (descSearch && (elem.Description != undefined && elem.Description.toLowerCase().indexOf(text.toLowerCase()) !== -1)) ||
            (addrSearch && (elem.Address != undefined && elem.Address.toLowerCase().indexOf(text.toLowerCase()) !== -1)) ||
            (accountSearch && (elem.AccountNumber != undefined && elem.AccountNumber.toLowerCase().indexOf(text.toLowerCase()) !== -1))
        )
    }

    const search = (e) => {
        if (text != "") {
            let arr = main.slice()
            setData(arr.filter((elem) => getLogicValue(elem)))
        } else {
            setData(main.slice())
        }
    }

    return (
        <div className="requestEditor">
            <h4>Поиск</h4>
            <div>
                {type != "tvt" && type != 'shareholder' &&
                    <label className="labelIcons"><input type="checkbox" defaultChecked={idSearch} onChange={(e) => setIdSearch(!idSearch)}/>По номеру</label>
                }
                { type != 'shareholder' &&
                    <label className="labelIcons"><input type="checkbox" defaultChecked={nameSearch} onChange={(e) => setNameSearch(!nameSearch)}/>По названию</label> 
                }
                { type == 'shareholder' &&
                <>
                    <label className="labelIcons"><input type="checkbox" defaultChecked={nameHSearch} onChange={(e) => setNameHSearch(!nameHSearch)}/>По имени</label> 
                    <label className="labelIcons"><input type="checkbox" defaultChecked={accountSearch} onChange={(e) => setAccountSearch(!accountSearch)}/>По номеру счета</label> 
                </>    
                }
                {type != "tvt" && type != 'shareholder' &&
                    <label className="labelIcons"><input type="checkbox" defaultChecked={annSearch} onChange={(e) => setAnnSearch(!annSearch)}/>По аннотации</label>
                }
                { type != 'shareholder' &&
                    <label className="labelIcons"><input type="checkbox" defaultChecked={descSearch} onChange={(e) => setDescSearch(!descSearch)}/>По описанию</label>
                }
                {type == "tvt" && type != 'shareholder' &&
                    <label className="labelIcons"><input type="checkbox" defaultChecked={addrSearch} onChange={(e) => setAddrSearch(!addrSearch)}/>По адресу</label>
                }
            </div>
            <div>
                <label>Найти слово или фразу: <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyUp={(e) => search()}></input></label>
            </div>
            <button onClick={(e) => search()}>Искать</button>
        </div>
    )
}