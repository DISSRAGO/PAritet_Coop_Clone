import React, { useEffect, useState, useRef } from 'react';
import { useMediaQuery } from 'react-responsive'

import TableInterface from '../../components/Table/TableInterface.jsx'
import TableVersions from '../../components/Table/TableVersions.jsx'
import TableList from '../Table/TableList.jsx';
import ContentList from './ContentList.jsx';
import Canvas from '../Iconostas/Canvas.jsx'
import SubscriberService from './Subscribe.jsx';
import Mindmap from '../Iconostas/Mindmap.jsx';

import anchor from "../../icons/anchor.png"
import people from "../../icons/people.png"

import Comment from '../Society/Comment.jsx';
import "../../style/thanka.css"

import { useTypedSelector } from '../../hooks/useTypedSelector.ts'; 

function Left(props) {

    const {data, tableStyle, interfaceType} = props

    /*const [size, setSize] = useState({w: window.innerWidth < 1200 ? window.innerWidth - 30 : window.innerWidth * 0.9 - 30, h: window.innerHeight - 200});
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
    }, []);*/

    const TableData = useTypedSelector((state) => state.ThankaReducer.TableData);

    const isBigScreen = useMediaQuery({query : '(min-width: 980px)'});
    const isTinyScreen = useMediaQuery({query : '(max-width: 300px)'});

    const [seeLeftLinks, setLeftLinks] = useState(false)

    const [seeSubs, setSeeSubs] = useState(false)
    
    return (
    <>
    {interfaceType == 'map' && 
        <div id="mindmap">
            <Mindmap 
                data={data} 
            />
        </div>
    }
    {interfaceType !== 'map' &&
        <div id='thanka-left'>  
            {data.Id != '' && data.Id !== undefined &&
            <>{ interfaceType == 'iconostas' &&
                <div id='graphicInterface'> 
                        <Canvas 
                            isBigScreen = {isBigScreen}
                            isTinyScreen = {isTinyScreen}
                            data={data} 
                            onPointerOut={props.onPointerOut} 
                            hash = {data.Hash} 
                            isPreview={props.isPreview} 
                            childrenId={props.childrenId}
                            isPreviewImage={props.isPreviewImage}
                        />
                       </div> 
                    }
                
                <div className = 'tableinterface'>
                    { (interfaceType == 'simpleTable' || interfaceType == 'tableMove' || interfaceType == 'tableLink')&&
                    <TableInterface data={data} style={tableStyle} state={interfaceType} type={'view'} 
                        list={data.Children}/>
                    }
                    { (interfaceType == 'tableCollection' || interfaceType == 'tableList') &&
                    <TableList data={data} style={tableStyle} state={interfaceType} type={'view'} 
                        list={TableData.data}/>
                    }
                    { interfaceType == 'tableVersion' &&
                    <TableVersions data={data} style={tableStyle} state={interfaceType} type={'view'} 
                        list={TableData.data} 
                        />
                    }
                </div>    
                
                <div className='leftService'>
                    {data.Thanka.Privacy == 3 &&
                        <h4><label className='labelIcons'>Показать подписки <input title={'Подписчики'} onClick={(e) => setSeeSubs(!seeSubs)} type='image' src={people} /></label></h4>
                    }
                    { seeSubs &&
                        <SubscriberService  data = {data}/>
                    }
                    <h4><label className='labelIcons'>Показать ссылки <input title={'Другие пути'} onClick={(e) => setLeftLinks(!seeLeftLinks)} type='image' src={anchor} /></label></h4>
                    { /*window.innerWidth > 980 && */seeLeftLinks && ( data.LinksFrom != null ?
                        <div className = 'leftLink'>
                            <ContentList 
                                header = {'Ссылки от текущей тханки'}
                                content={data.LinksFrom} 
                                privacy = {data.PrivacyLevel} 
                                mainId = {data.Id} 
                                hash = {data.Hash} 
                                style = {props.style}
                                type = {"leftLink"} 
                            />
                        </div>
                        :
                        <p>Ссылки не найдены</p>
                    )
                    }
                    { ((data.PrivacyLevel >= 1 && data.Thanka.Comments == true) || (data.PrivacyLevel == 6)) && isBigScreen &&
                        <>
                            <Comment thanka = {data.Id} avatarlist = {data.AvatarList} auth = {props.auth.data} adminprivacy = {data.PrivacyLevel}/>
                        </>
                    }
                </div>
                </>
            }
        </div>
        }
        </>
    );
}

export default Left;
