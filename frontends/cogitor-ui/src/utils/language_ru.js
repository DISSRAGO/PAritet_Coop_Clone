export const request_lang = {
    'Id_thanka': 'Номер тханки',
    'Name_thanka': 'Имя тханки',
    'Author_thanka': 'Автор тханки',
    'Annotation': 'Аннотация',
    'DateCreate': 'Дата создания',
    'ViewNum': 'Количество просмотров',
    'CommentsNum': 'Количество комментариев',
    'Type_thanka': 'Тип'
}

export function request_lang_switch(smth,type) {

    let translate = ""

    switch (smth) {
        case "thankabasic": { translate = "тханки"; break }
        case "thankaauthor": { translate = "авторы"; break }
        case "shareholder": { translate = "пайщики"; break }
        case "products": { translate = "товары"; break }
        case "ID": { translate = "номер"; break }
        case "Name": { translate = "название"; break }
        case "Annotation": { translate = "аннотация"; break }
        case "Description": { translate = "описание"; break }
        case "Date": { translate = "дата создания"; break }
        case "ViewNum": { translate = "количество просмотров"; break }
        case "CommentsNum": { translate = "количество комментариев"; break }
        case "Author": { translate = "автор"; break }
        case "Type": { translate = "тип тханки"; break }
        case "HolderStatus": { translate = "статус пайщика"; break }
        case "HolderAvatar": { translate = "страница в когитеке"; break }
        case "AccountNumber": { translate = "номер счета"; break }
        case "HolderName": { translate = "имя пайщика"; break }
        case "Producer": { translate = "поставщик"; break }
        case "Price": { translate = "цена"; break }
        case "Category": { translate = "категория"; break }
        case "desc": { translate = "по убыванию"; break }
        case "asc": { translate = "по возрастанию"; break }
        case "date": { translate = "по дате"; break }
        case "view": { translate = "по количеству просмотров"; break }
        case "comment": { translate = "по количеству комментариев"; break }
        case "invited": { translate = "приглашенные"; break }
        case "referrer": { translate = "поручители"; break }
        case "producer": { translate = "поставщики"; break }
        case "distributor": { translate = "дистрибьюторы"; break }
        case "admin": { translate = "администраторы"; break }
        case "myGoods": {translate = "мои товары"; break }
    }

    return translate
}

export function russianTypes(defaultValue) {

    let TypeName = ""

    switch (defaultValue) {
        case "article": { TypeName = "статья"; break; }
        case "avatar": { TypeName = "аватар"; break; }
        case "collection": { TypeName = "коллекция"; break; }
        case "repost": { TypeName = "репост"; break; }
        case "catalog":
        case "category":
             { TypeName = "каталог"; break; }
        case "cabinet": { TypeName = "кабинет"; break; }
        case "document": { TypeName = "документ"; break; }
        case "hashtag": { TypeName = "хэштег"; break; }
        case "request": {TypeName = "сервис"; break; }
        case "link": {TypeName = "ссылка"; break; }
        case "product": {TypeName = "товар"; break; }
        case "site": {TypeName = "страница сайта"; break; }
    }

    return TypeName
}

export function dateMonthWord(date, isTime) {

    let monthsword = "";
    let separator = '-';

    let datearr = date != undefined ? date.split(separator) : [];

    if (datearr[2] == undefined) return ""
    let time = datearr[2].slice(3, 8)
    datearr[2] = datearr[2].slice(0, 2);

    switch (datearr[1]) {
        case '01': { monthsword = "января"; break; }
        case '02': { monthsword = "февраля"; break; }
        case '03': { monthsword = "марта"; break; }
        case '04': { monthsword = "апреля"; break; }
        case '05': { monthsword = "мая"; break; }
        case '06': { monthsword = "июня"; break; }
        case '07': { monthsword = "июля"; break; }
        case '08': { monthsword = "августа"; break; }
        case '09': { monthsword = "сентября"; break; }
        case '10': { monthsword = "октября"; break; }
        case '11': { monthsword = "ноября"; break; }
        case '12': { monthsword = "декабря"; break; }
        default: { break; }
    }

    return (isTime == false ? datearr[2] + " " + monthsword + " " + datearr[0] : datearr[2] + " " + monthsword + " " + datearr[0] + ", " + time);
}

export function dateMonthWordSlash(date, isTime) {

    let monthsword = "";
    let separator = '/';

    let datearr = date.split(separator);

    if (datearr[2] == undefined) return ""

    let time = datearr[2].slice(3, 8)
    datearr[2] = datearr[2].slice(0, 2);

    switch (datearr[1]) {
        case '01': { monthsword = "января"; break; }
        case '02': { monthsword = "февраля"; break; }
        case '03': { monthsword = "марта"; break; }
        case '04': { monthsword = "апреля"; break; }
        case '05': { monthsword = "мая"; break; }
        case '06': { monthsword = "июня"; break; }
        case '07': { monthsword = "июля"; break; }
        case '08': { monthsword = "августа"; break; }
        case '09': { monthsword = "сентября"; break; }
        case '10': { monthsword = "октября"; break; }
        case '11': { monthsword = "ноября"; break; }
        case '12': { monthsword = "декабря"; break; }
        default: { break; }
    }

    return (isTime == false ? datearr[2] + " " + monthsword + " " + datearr[0] : datearr[2] + " " + monthsword + " " + datearr[0] + ", " + time);
}

export function DateForEditor(date) {

    if (date != undefined && date != null && date != "" && date.indexOf("-") != -1) {
        let separator = "-"
        let datearr = date.split(separator);
        datearr[2] = datearr[2].slice(0,2);

        return (datearr[2] + "." + datearr[1] + "." + datearr[0]);
    }
    else return date
}

export function DateForEditorZero(date) {

    if (date != undefined && date != null && date != "") {
        let separator = "-"
        let datearr = date.split(separator);
        if (+datearr[1] < 10 && datearr[1].length < 2) {
            datearr[1] = "0" + datearr[1]
        }

        return (datearr.join("-"));
    }
}

export function onlyDate(date) {
    if (typeof date == "string") {
        return date.slice(0,10)
    } else {
        return
    }
}

export function TrueDateForEditor(date) {

    if (date != undefined && date != null && date != "" && date.indexOf(".") != -1) {
        let separator = "."
        let datearr = date.split(separator);

        return (datearr[2] + "-" + datearr[1] + "-" + datearr[0]);
    }
    else return date
}