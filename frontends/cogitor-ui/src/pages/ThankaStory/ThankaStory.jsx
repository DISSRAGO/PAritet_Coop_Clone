import React, { useEffect, useState, useContext } from 'react';
import { useMediaQuery } from 'react-responsive'
import {PATH, SITE} from "../../utils/url.js";
import axios from 'axios';
import "../../style/thanka.css"

import { useTypedSelector } from '../../hooks/useTypedSelector.ts';
import { useActions } from '../../hooks/useActions.ts';
import { AuthContext } from '../../context/AuthContext';
import { FetchStatus } from '../../store/types/fetchTypes';

import StoryList from '../../components/StoryPage/StoryList.jsx';

function StoryPage(props) {
    const auth = useTypedSelector((state) => state.user.headerInfo);

    const [list, setList] = useState("")
    const [hash, setHash] = useState("")

    function GetStory() {
        axios({
            method: "post",
            url: PATH + 'story/story.php',
            headers: { "content-type": "multipart/form-data" },
            data: {UserLogin: auth.data.login, UserId: auth.data.id, method: "getStory"},
        })
        .then((result) => {
            setList(result.data.StoryList)
            setHash(result.data.Hash)
        })
        .catch((error) => {
        })
    }

    useEffect(() => {
        if (auth.data.login != undefined && auth.data.id != undefined) {
            GetStory()
        }
    },[auth.data.login, auth.data.id])

    return (
        <div className='cogicontainer'>
            { auth.status == 3 &&
                <div className='error'>
                    <h3>Войдите в систему</h3>
                </div>
            }
            {list != "" &&
                <StoryList content = {list} hash= {hash} />
            }
        </div>
    )

}

export default StoryPage