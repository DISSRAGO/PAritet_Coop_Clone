import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { PATH, DIRPATH, SITE } from "../../utils/url.js";
import ContentList from './ContentList.jsx';

import "../../style/thanka.css";

import { useActions } from '../../hooks/useActions.ts';
import { useTypedSelector } from '../../hooks/useTypedSelector.ts';

import CogObjectEditor from '../Editor/CogObjEditor.jsx';
import RequestViewer from './CogRequest.jsx';

import { DateForEditor } from '../../utils/language_ru.js';

import { SystemMessage } from './SystemMessage.jsx';

import { Menu } from 'antd';

import AddressForm from '../forms/AddressForm/AddressForm';

function normalDateSlash(date) {
    if (date != undefined && date != null && date != "") {
        let separator = "/";
        let datearr = date.split(separator);
        datearr[2] = datearr[2].slice(0, 4);

        return (datearr[1] + "." + datearr[0] + "." + datearr[2]);
    }
    return date;
}

export function PictureFromMPT(props) {
    const { Id, className } = props;

    const DIR_IMAGE = "https://m.paritet.coop/image/";

    return (
        <>
            {<div>
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.jpg`} onError={(e) => e.target.style.display = 'none'} />
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.jpeg`} onError={(e) => e.target.style.display = 'none'} />
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.png`} onError={(e) => e.target.style.display = 'none'} />
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.JPG`} onError={(e) => e.target.style.display = 'none'} />
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.JPEG`} onError={(e) => e.target.style.display = 'none'} />
                <img className={className} src={`${DIR_IMAGE}/goods/${Id}/0.PNG`} onError={(e) => e.target.style.display = 'none'} />
            </div>}
        </>
    );
}

export function getProductLinks(id) {
    const OLD_MARKET = "https://market.paritet.coop/";
    const NEW_MARKET = "https://m.paritet.coop/";

    const OLD_STEND = "https://stend.dom.nsk.ru/stend/group/251500/";
    const NEW_STEND = "http://opencart.stend.nsk.ru/";

    return {
        old: OLD_STEND + "ptgktrcgoodcard_" + id,
        new: NEW_STEND + "index.php?route=product/product&language=ru-ru&product_id=" + id
    };
}

function ProductViewer(props) {
    const { object, links } = props;

    const [category, setCategory] = useState([]);
    useEffect(() => {
        if (links != null) {
            let cat = [];
            for (let i = 0; i < links.length; i++) {
                if (links[i].Type != undefined && links[i].Type == 'category') {
                    cat.push(links[i]);
                }
            }
            setCategory(cat);
        }
    }, []);

    return (
        <>
            <p><b>{object.Name}</b></p>
            <PictureFromMPT Id={object.ProductId} className={"productImg"} />
            <p dangerouslySetInnerHTML={{ __html: object.ShortDescription }} />
            <p dangerouslySetInnerHTML={{ __html: object.Description }} />
            <p><b>{"Цена: "}</b>{object.Price + " паев"}</p>
            <p><b>{"Поставщик: "}</b> {object.ProducerAvatarId != undefined ?
                <a href={SITE + "navigator/" + object.ProducerAvatarId}>{object.ProducerName}</a> :
                object.ProducerName}
            </p>
            <p><a href={getProductLinks(object.ProductId).old}>старый Маркет</a></p>
            <p><a href={getProductLinks(object.ProductId).new}>новый Маркет</a></p>
            {category != [] &&
                <div className='contentList'>
                    <p><b>Категория: </b></p>
                    <table>
                        <tbody>
                            {category.map((elem) => (
                                <tr key={elem.ID}>
                                    <td className="pic">
                                        <a href={elem.address}>
                                            {elem.Image == 1 ?
                                                <img className='thankaPic' src={DIRPATH + "/image" + elem.ID + '.jpg?' + object.Hash} width={50} />
                                                :
                                                <img className='thankaPic' src={DIRPATH + "/empty.jpg"} width={50} />
                                            }
                                        </a>
                                    </td>
                                    <td className='tableName'>
                                        <a href={SITE + 'navigator/' + elem.ID}>{elem.ID + ": " + elem.Name}</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </>
    );
}

function CogObject(props) {
    const data = props.data || {};
    const auth = props.auth;
    const version = props.version || { data: null };

    const safeData = data || {};
    const object = safeData.Object || {};
    const thanka = safeData.Thanka || {};
    const request = safeData.Request || {};
    const sectorLink = safeData.SectorLink || {};

    const profileMenuTitles = ['Профиль', 'Адрес', 'Уведомления', 'Поручительство'];
    const profileMenuItems = profileMenuTitles.map((title) => ({
        key: title,
        label: title,
    }));
    const [selectedProfileTab, setSelectedProfileTab] = useState('Профиль');

    const guarantorSubjectsMenuTitles = ['Подтверждённые', 'Заявки'];
    const guarantorSubjectsMenuItems = guarantorSubjectsMenuTitles.map((title) => ({
        key: title,
        label: title,
    }));
    const [selectedGuarantorSubjectsTab, setSelectedGuarantorSubjectsTab] = useState('Подтверждённые');

    const [guarantorInfo, setGuarantorInfo] = useState(null);
    const [guarantorLoading, setGuarantorLoading] = useState(false);
    const [guarantorError, setGuarantorError] = useState('');
    const [guarantorLoginOrEmail, setGuarantorLoginOrEmail] = useState('');
    const [showGuarantorRequestForm, setShowGuarantorRequestForm] = useState(true);

    const [guaranteedSubjects, setGuaranteedSubjects] = useState([]);
    const [guaranteedSubjectsLoading, setGuaranteedSubjectsLoading] = useState(false);
    const [guaranteedSubjectsError, setGuaranteedSubjectsError] = useState('');

    const onProfileTabClick = (e) => {
        if (e?.key) setSelectedProfileTab(e.key);
    };

    const onGuarantorSubjectsTabClick = (e) => {
        if (e?.key) setSelectedGuarantorSubjectsTab(e.key);
    };

    let type = object.Type;

    const headerInfo = useTypedSelector ? useTypedSelector((state) => state?.user?.headerInfo) : null;

    const authSubjectId =
        auth?.data?.subjectId ||
        auth?.data?.subjectid ||
        auth?.subjectId ||
        auth?.subjectid ||
        headerInfo?.data?.subjectId ||
        headerInfo?.data?.subjectid ||
        headerInfo?.data?.SubjectId ||
        '';

    const viewedSubjectId =
        safeData?.subjectId ||
        safeData?.subjectid ||
        object?.subjectId ||
        object?.subjectid ||
        object?.AuthorSubjectId ||
        object?.authorSubjectId ||
        object?.author_subject_id ||
        thanka?.AuthorSubjectId ||
        thanka?.authorSubjectId ||
        thanka?.author_subject_id ||
        data?.AuthorSubjectId ||
        data?.authorSubjectId ||
        data?.author_subject_id ||
        '';

    const isProfilePage = window.location.pathname === '/profile';
    const currentSubjectId = viewedSubjectId || (isProfilePage ? authSubjectId : '');

    const guarantorApiBase = `${window.location.origin}/api/profile/guarantor`;

    const parseApiError = async (response) => {
        try {
            const payload = await response.json();
            if (typeof payload?.detail === 'string') return payload.detail;
            if (Array.isArray(payload?.detail)) {
                return payload.detail.map((x) => x?.msg || JSON.stringify(x)).join('; ');
            }
            return payload?.message || payload?.error || 'Ошибка запроса';
        } catch (e) {
            return 'Ошибка запроса';
        }
    };

    const loadGuarantor = async () => {
        if (!currentSubjectId) {
            setGuarantorError('Не найден subject_id профиля');
            setGuarantorInfo(null);
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError('');

        try {
            const response = await fetch(`${guarantorApiBase}?subject_id=${encodeURIComponent(currentSubjectId)}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            const info = result?.data || null;
            setGuarantorInfo(info);
            setShowGuarantorRequestForm(!info?.guarantorSubjectId);
        } catch (e) {
            setGuarantorInfo(null);
            setGuarantorError(e?.message || 'Не удалось загрузить поручителя');
        } finally {
            setGuarantorLoading(false);
        }
    };

    const loadGuaranteedSubjects = async () => {
        if (!authSubjectId) {
            setGuaranteedSubjects([]);
            setGuaranteedSubjectsError('');
            return;
        }

        setGuaranteedSubjectsLoading(true);
        setGuaranteedSubjectsError('');

        try {
            const response = await fetch(
                `${guarantorApiBase}/subjects?guarantor_subject_id=${encodeURIComponent(authSubjectId)}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            setGuaranteedSubjects(result?.data || []);
        } catch (e) {
            setGuaranteedSubjects([]);
            setGuaranteedSubjectsError(e?.message || 'Не удалось загрузить список поручительств');
        } finally {
            setGuaranteedSubjectsLoading(false);
        }
    };

    const requestGuarantor = async () => {
        if (!currentSubjectId) {
            setGuarantorError('Не найден actorSubjectId');
            return;
        }

        if (!guarantorLoginOrEmail || guarantorLoginOrEmail.trim() === '') {
            setGuarantorError('Укажите логин или email поручителя');
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError('');

        try {
            const response = await fetch(`${guarantorApiBase}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actorSubjectId: currentSubjectId,
                    guarantorLoginOrEmail: guarantorLoginOrEmail.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            setGuarantorInfo(result?.data || null);
            setGuarantorLoginOrEmail('');
            setShowGuarantorRequestForm(false);
            await loadGuaranteedSubjects();
        } catch (e) {
            setGuarantorError(e?.message || 'Не удалось запросить поручителя');
        } finally {
            setGuarantorLoading(false);
        }
    };

    const confirmGuarantorForSubject = async (subjectId) => {
        if (!authSubjectId) {
            setGuarantorError('Не найден subjectId текущего пользователя');
            return;
        }

        if (!subjectId) {
            setGuarantorError('Не найден subjectId для подтверждения');
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError('');

        try {
            const response = await fetch(`${guarantorApiBase}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actorSubjectId: authSubjectId,
                    subjectId: subjectId,
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();

            if (guarantorInfo?.subjectId === subjectId) {
                setGuarantorInfo(result?.data || null);
            }

            await loadGuarantor();
            await loadGuaranteedSubjects();
        } catch (e) {
            setGuarantorError(e?.message || 'Не удалось подтвердить поручительство');
        } finally {
            setGuarantorLoading(false);
        }
    };

    const rejectGuarantorForSubject = async (subjectId) => {
        if (!authSubjectId) {
            setGuarantorError('Не найден subjectId текущего пользователя');
            return;
        }

        if (!subjectId) {
            setGuarantorError('Не найден subjectId для отклонения');
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError('');

        try {
            const response = await fetch(`${guarantorApiBase}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actorSubjectId: authSubjectId,
                    subjectId: subjectId,
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            if (guarantorInfo?.subjectId === subjectId) {
                const result = await response.json();
                setGuarantorInfo(result?.data || null);
            }

            await loadGuarantor();
            await loadGuaranteedSubjects();
        } catch (e) {
            setGuarantorError(e?.message || 'Не удалось отклонить поручительство');
        } finally {
            setGuarantorLoading(false);
        }
    };

    const confirmCurrentGuarantor = async () => {
        const subjectIdForAction =
            guarantorInfo?.subjectId ||
            currentSubjectId;

        await confirmGuarantorForSubject(subjectIdForAction);
    };

    const rejectCurrentGuarantor = async () => {
        const subjectIdForAction =
            guarantorInfo?.subjectId ||
            currentSubjectId;

        await rejectGuarantorForSubject(subjectIdForAction);
    };

    useEffect(() => {
        if (type == 'avatar' && selectedProfileTab === 'Поручительство') {
            loadGuarantor();
            loadGuaranteedSubjects();
        }
    }, [selectedProfileTab, type, currentSubjectId, authSubjectId]);

    let location = '';
    if (Array.isArray(data.LocationEvent)) {
        for (let i = 0; i < Math.min(data.LocationEvent.length, 3); i++) {
            location += (data.LocationEvent[i]?.Name || '') + ', ';
        }
        if (location.endsWith(', ')) {
            location = location.slice(0, -2);
        }
    }

    let elements = [];
    let links = [];
    let arr = [];
    if (data.Content != null && (type == 'catalog' || type == 'category')) {
        arr = data.Content.slice();
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Type == "element") {
                elements.push(arr[i]);
            } else {
                links.push(arr[i]);
            }
        }
    }

    const confirmedSubjects = guaranteedSubjects.filter((item) => item.status === 'confirmed');
    const pendingSubjects = guaranteedSubjects.filter((item) => item.status === 'pending');
    const shownGuaranteedSubjects = selectedGuarantorSubjectsTab === 'Подтверждённые'
        ? confirmedSubjects
        : pendingSubjects;

    const [elementView, setElementView] = useState({ display: 'none' });
    const [elementbutton, setElementButton] = useState(true);

    function hideElements(e) {
        setElementView({ display: 'none' });
        setElementButton(true);
    }

    function showElements(e) {
        setElementView({ display: 'block' });
        setElementButton(false);
    }

    return (
        <>
            {type == 'cabinet' &&
                <>
                    <div className='personal'>
                        <p><b>Дата регистрации:</b> {normalDateSlash(object.RegDate)}</p>
                        <p><b>Логин:</b> {object.Login}</p>
                        <p><b>Дата рождения:</b> {normalDateSlash(object.BirthDate)}</p>
                        <p><b>Имя:</b> {object.Name}</p>
                        <p><b>Адрес:</b> {object.Address}</p>
                        <p><b>Электронная почта:</b> {object.Email}</p>
                        <p><b>Телефон:</b> {object.TelephoneNumber}</p>
                    </div>
                    <h4>Мои сайты: </h4>
                    <ContentList
                        content={data.SiteList}
                        privacy={data.PrivacyLevel}
                        mainId={data.Id}
                        type={"sitelist"}
                        hash={data.Hash}
                    />
                </>
            }

            {type == 'avatar' &&
                <div className='personal'>
                    <Menu
                        mode="horizontal"
                        items={profileMenuItems}
                        selectedKeys={[selectedProfileTab]}
                        onClick={onProfileTabClick}
                        style={{ marginBottom: 16 }}
                    />

                    {selectedProfileTab === 'Профиль' && (
                        <>
                            {object.Name != "" && object.Name != undefined &&
                                <p><b>Имя: </b>{object.Name}</p>
                            }

                            {object.BirthDate != "" && object.BirthDate != undefined &&
                                <p><b>Дата рождения: </b>{DateForEditor(object.BirthDate)}</p>
                            }

                            {object.Email != "" && object.Email != undefined &&
                                <p><b>Электронная почта: </b>{object.Email}</p>
                            }

                            {object.TelephoneNumber != "" && object.TelephoneNumber != undefined &&
                                <p><b>Телефон: </b>{object.TelephoneNumber}</p>
                            }

                            {(!safeData.SectorLink || Object.keys(sectorLink).length === 0) &&
                                <>
                                    <h4>Тханки этого автора: </h4>
                                    <ContentList
                                        content={data.MyThankaList}
                                        privacy={data.PrivacyLevel}
                                        mainId={data.Id}
                                        type={'avatar'}
                                        hash={data.Hash}
                                    />
                                </>
                            }

                            {data.PrivacyLevel == 6 &&
                                <>
                                    <h4>Мои подписки: </h4>
                                    <ContentList
                                        content={data.MySubscribeList}
                                        privacy={data.PrivacyLevel}
                                        mainId={data.Id}
                                        type={'avatar'}
                                        hash={data.Hash}
                                    />
                                </>
                            }
                        </>
                    )}

                    {selectedProfileTab === 'Адрес' && (
                        <div style={{ paddingTop: 8 }}>
                            <AddressForm
                                defaultAddress={safeData?.Address || object?.Address || ''}
                                isShowFlatInput={true}
                            />
                        </div>
                    )}

                    {selectedProfileTab === 'Уведомления' && (
                        <div style={{ paddingTop: 8 }}>
                            <p>Раздел уведомлений пока не подключён для viewer-профиля.</p>
                        </div>
                    )}

                    {selectedProfileTab === 'Поручительство' && (
                        <div style={{ paddingTop: 8 }}>
                            {!currentSubjectId &&
                                <p style={{ color: 'red' }}>Не удалось определить subject_id текущего профиля.</p>
                            }

                            {currentSubjectId && guarantorInfo?.guarantorSubjectId && !showGuarantorRequestForm && (
                                <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={() => setShowGuarantorRequestForm(true)}>Сменить</button>
                                    <button onClick={loadGuarantor}>Обновить</button>
                                </div>
                            )}

                            {currentSubjectId && showGuarantorRequestForm && (
                                <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        value={guarantorLoginOrEmail}
                                        onChange={(e) => setGuarantorLoginOrEmail(e.target.value)}
                                        placeholder="Логин или email поручителя"
                                        style={{ minWidth: 260, padding: 6 }}
                                    />
                                    <button onClick={requestGuarantor}>Запросить поручителя</button>
                                    <button onClick={loadGuarantor}>Обновить</button>
                                </div>
                            )}

                            {guarantorLoading &&
                                <p>Загрузка...</p>
                            }

                            {guarantorError &&
                                <p style={{ color: 'red' }}>{guarantorError}</p>
                            }

                            {!guarantorLoading && !guarantorError && !guarantorInfo && currentSubjectId &&
                                <p>Поручитель не назначен.</p>
                            }

                            {guarantorInfo &&
                                <div style={{ marginBottom: 24 }}>
                                    <p><b>Статус: </b>{guarantorInfo.status}</p>

                                    {guarantorInfo.guarantorDisplayName &&
                                        <p><b>Поручитель: </b>{guarantorInfo.guarantorDisplayName}</p>
                                    }

                                    {guarantorInfo.guarantorSubjectId &&
                                        <p><b>ID поручителя: </b>{guarantorInfo.guarantorSubjectId}</p>
                                    }

                                    {guarantorInfo.subjectId &&
                                        <p><b>ID субъекта: </b>{guarantorInfo.subjectId}</p>
                                    }

                                    {guarantorInfo.requestedAt &&
                                        <p><b>Запрошен: </b>{guarantorInfo.requestedAt}</p>
                                    }

                                    {guarantorInfo.confirmedAt &&
                                        <p><b>Подтверждён: </b>{guarantorInfo.confirmedAt}</p>
                                    }

                                    {guarantorInfo.rejectedAt &&
                                        <p><b>Отклонён: </b>{guarantorInfo.rejectedAt}</p>
                                    }

                                    {guarantorInfo.revokedAt &&
                                        <p><b>Отозван: </b>{guarantorInfo.revokedAt}</p>
                                    }

                                    {guarantorInfo.isDefault !== undefined &&
                                        <p><b>По умолчанию: </b>{guarantorInfo.isDefault ? 'Да' : 'Нет'}</p>
                                    }

                                    {guarantorInfo.status === 'pending' && guarantorInfo.guarantorSubjectId === authSubjectId &&
                                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button onClick={confirmCurrentGuarantor}>Подтвердить</button>
                                            <button onClick={rejectCurrentGuarantor}>Отклонить</button>
                                        </div>
                                    }
                                </div>
                            }

                            <div style={{ marginTop: 16 }}>
                                <h4>Подчинённые поручителя</h4>

                                <Menu
                                    mode="horizontal"
                                    items={guarantorSubjectsMenuItems}
                                    selectedKeys={[selectedGuarantorSubjectsTab]}
                                    onClick={onGuarantorSubjectsTabClick}
                                    style={{ marginBottom: 16 }}
                                />

                                {guaranteedSubjectsLoading &&
                                    <p>Загрузка списка поручительств...</p>
                                }

                                {guaranteedSubjectsError &&
                                    <p style={{ color: 'red' }}>{guaranteedSubjectsError}</p>
                                }

                                {!guaranteedSubjectsLoading && !guaranteedSubjectsError && shownGuaranteedSubjects.length === 0 &&
                                    <p>
                                        {selectedGuarantorSubjectsTab === 'Подтверждённые'
                                            ? 'Подтверждённых поручительств пока нет.'
                                            : 'Заявок на подтверждение пока нет.'}
                                    </p>
                                }

                                {!guaranteedSubjectsLoading && !guaranteedSubjectsError && shownGuaranteedSubjects.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {shownGuaranteedSubjects.map((item) => (
                                            <div
                                                key={`${item.subjectId}-${item.status}`}
                                                style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: 12,
                                                    borderRadius: 4,
                                                    background: '#fff'
                                                }}
                                            >
                                                <p><b>Пользователь: </b>{item.displayName || 'Без имени'}</p>
                                                <p><b>ID субъекта: </b>{item.subjectId}</p>
                                                <p><b>Статус: </b>{item.status}</p>

                                                {item.requestedAt &&
                                                    <p><b>Запрошен: </b>{item.requestedAt}</p>
                                                }

                                                {item.confirmedAt &&
                                                    <p><b>Подтверждён: </b>{item.confirmedAt}</p>
                                                }

                                                {item.isDefault !== undefined &&
                                                    <p><b>По умолчанию: </b>{item.isDefault ? 'Да' : 'Нет'}</p>
                                                }

                                                {item.status === 'pending' && (
                                                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        <button onClick={() => confirmGuarantorForSubject(item.subjectId)}>
                                                            Подтвердить
                                                        </button>
                                                        <button onClick={() => rejectGuarantorForSubject(item.subjectId)}>
                                                            Отклонить
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            }

            {type == 'catalog' &&
                <>
                    <h4>Добавлено вручную: </h4>
                    <ContentList content={links} privacy={data.PrivacyLevel} mainId={data.Id} type={"catalog"} hash={data.Hash} />
                    <h4>Добавлено через углы: </h4>
                    <ContentList content={elements} privacy={data.PrivacyLevel} mainId={data.Id} type={"catalog"} style={elementView} hash={data.Hash} />
                    {elements.length !== 0 && (elementbutton ?
                        <button className='seeAllButt' onClick={showElements.bind(this)}>Показать</button>
                        :
                        <button className='seeAllButt' onClick={hideElements.bind(this)}>Скрыть</button>
                    )}
                </>
            }

            {type == 'category' &&
                <>
                    <ContentList content={links} privacy={data.PrivacyLevel} mainId={data.Id} type={"catalog"} hash={data.Hash} />
                </>
            }

            {type == 'collection' &&
                <ContentList content={data.Content} privacy={data.PrivacyLevel} mainId={data.Id} type={"collection"} hash={data.Hash} />
            }

            {type == 'hashtag' &&
                <ContentList content={data.Content} privacy={data.PrivacyLevel} mainId={data.Id} type={"hashtags"} hash={data.Hash} />
            }

            {type == 'article' && version.data == null &&
                <>
                    <p dangerouslySetInnerHTML={{ __html: object.Description }} />
                    {(object.Filename != null && object.Filename != undefined && object.Filename != "") &&
                        <iframe src={DIRPATH + "/pdf/" + object.Filename} width={'100%'} height={"700"} />
                    }
                    <div className='personal'>
                        <p><b>Дата события: </b>{DateForEditor(object.DateEvent)}</p>
                        <p><b>Место события: </b>{location}</p>
                        {object.RealAuthor != "" && object.RealAuthor != undefined &&
                            <p><b>Автор: </b>{object.RealAuthor}</p>
                        }
                        {object.URL != "" && object.URL != undefined &&
                            <p><b>Источник: </b>{object.URL}</p>
                        }
                    </div>
                </>
            }

            {type == 'repost' &&
                <p dangerouslySetInnerHTML={{ __html: object.Description }} />
            }

            {type == 'document' &&
                <>
                    <p dangerouslySetInnerHTML={{ __html: object.Description }} />
                    {object.RealAuthor != "" && object.RealAuthor != undefined &&
                        <p><b>Автор: </b>{object.RealAuthor}</p>
                    }
                    {object.URL != "" && object.URL != undefined &&
                        <p><b>Источник: </b>{object.URL}</p>
                    }
                    <h3>Содержание:</h3>
                    <ContentList content={data.Children} privacy={data.PrivacyLevel} mainId={data.Id} type={"document"} hash={data.Hash} />
                </>
            }

            {type == 'request' &&
                <RequestViewer content={data.Content} request={request} hash={data.Hash} />
            }

            {type == 'product' &&
                <ProductViewer object={object} links={data.LinksFrom} />
            }

            {type == 'site' &&
                <>
                    {
                        data.SiteList != null && data.SiteList[0] != undefined &&
                        <p>Эта тханка является <a href={SITE + 'sitepage/' + data.SiteList[0].ID}>страницей сайта</a></p>
                    }
                </>
            }

            {version.data != null &&
                <VersionViewer object={object} />
            }

            {data.PrivacyLevel == 6 && version.data == null && object.VersionStamp != true &&
                (object.Type == "article" || object.Type == "document" || object.Type == 'avatar') && sectorLink == undefined &&
                <div id="cogobj_buttons">
                    {
                        <button id="cogEdit" onClick={() => props.setState("edit")}>
                            Редактировать {data.Accusativus}
                        </button>
                    }
                </div>
            }
        </>
    );
}

function VersionViewer(props) {
    const { object } = props;
    const data = useTypedSelector((state) => state.ThankaReducer.Version.data);

    let location = '';
    if (data.LocationEvent != null) {
        for (let i = 0; i < 3 && data.LocationEvent[i] != null; i++) {
            location += data.LocationEvent[i].Name + ', ';
        }
    }

    const [state, setState] = useState("none");
    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    function setMain() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: object.VersionID, method: "setMain" },
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            setSystemMessageText("Установлено");
            setSystemMessageType("success");
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error");
        });
    }

    function stampVersion() {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: object.VersionID, method: "stampVersion" },
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            setSystemMessageText("Установлено");
            setSystemMessageType("success");
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error");
        });
    }

    return (
        <div className='version'>
            {state == "none" &&
                <>
                    <p className='versionmessage'>Версия от {object.VersionDate}</p>
                    <p dangerouslySetInnerHTML={{ __html: object.Description }} />
                    <p><b>Дата события: </b>{DateForEditor(object.DateEvent)}</p>
                    <p><b>Место события: </b>{location}</p>
                    <p><b>Автор: </b>{object.RealAuthor}</p>
                    <p><b>Источник: </b>{object.URL}</p>

                    {object.VersionStamp != true &&
                        <>
                            <button onClick={() => setState("edit")}>Редактировать версию</button>
                            <button onClick={setMain}>Сделать главной</button>
                            <button onClick={stampVersion}>Запечатать версию</button>
                        </>
                    }
                </>
            }
            {state == "edit" &&
                <VersionEditor data={data} setState={setState} object={object} />
            }
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageType} setStatus={setSystemMessageType} />
        </div>
    );
}

function VersionEditor(props) {
    const { data, type, setState, object } = props;

    const { getVersion } = useActions();

    const descriptionRef = useRef(object.Description);
    let today = new Date();
    today = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();

    const [selectedDateEvent, setSelectedDateEvent] = useState(
        object.DateEvent != null &&
            object.DateEvent != undefined &&
            object.DateEvent != "" ? DateForEditor(object.DateEvent) : DateForEditor(today));

    const [selectedLocation, setSelectedLocation] = useState(
        data.LocationEvent !== undefined &&
            data.LocationEvent !== null &&
            type == 'edit' &&
            data.LocationEvent[2] !== null &&
            data.LocationEvent[2] !== undefined ?
            data.LocationEvent[2].ID : "1"
    );

    const [realAuthor, setRealAuthor] = useState(object.RealAuthor);
    const [url, setURL] = useState(object.URL);

    let dataToEditor = {};
    dataToEditor.Object = {};

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageType, setSystemMessageType] = useState("none");

    const Save = (e) => {
        e.preventDefault();

        dataToEditor.Id = object.VersionID;
        dataToEditor.EditorType = "version";

        dataToEditor.Object.Description = (
            descriptionRef.current.value !== undefined ?
                descriptionRef.current.value :
                descriptionRef.current
        );
        dataToEditor.Object.DateEvent = selectedDateEvent;
        dataToEditor.LocationEvent = selectedLocation;
        dataToEditor.Object.RealAuthor = realAuthor;
        dataToEditor.Object.URL = url;

        axios({
            method: "post",
            url: PATH + "thanka/setThanka.php",
            headers: { "content-type": "multipart/form-data" },
            data: dataToEditor,
        }).then((result) => {
            setState("none");
            getVersionFunc(object.VersionID);
            setSystemMessageText("Успешно");
            setSystemMessageType("success");
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageType("error");
        });
    };

    function getVersionFunc(id) {
        axios({
            method: "post",
            url: PATH + 'thanka/thanka.php',
            data: { VersionId: id, method: "getVersion" },
            headers: { "content-type": "multipart/form-data" },
        }).then((result) => {
            getVersion(result.data);
        }).catch((error) => {
            setSystemMessageText("Ошибка");
            setSystemMessageType("error");
        });
    }

    return (
        <>
            <CogObjectEditor
                selectedDateEvent={selectedDateEvent} setSelectedDateEvent={setSelectedDateEvent}
                selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                selectedRealAuthor={realAuthor} setSelectedRealAuthor={setRealAuthor}
                selectedURL={url} setSelectedURL={setURL}
                selectedType={"article"} data={data} type={"edit"}
                descriptionRef={descriptionRef}
            />
            {
                <>
                    <button onClick={Save}>Сохранить версию</button>
                    <button onClick={() => setState("none")}>Отменить</button>
                </>
            }
            <SystemMessage messageText={systemMessageText} setMessageText={setSystemMessageText} status={systemMessageType} setStatus={setSystemMessageType} />
        </>
    );
}

export default CogObject;