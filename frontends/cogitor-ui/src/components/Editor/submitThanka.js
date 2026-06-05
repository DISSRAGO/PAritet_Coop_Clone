import axios from "axios";
import { PATH } from "../../utils/url.js";

// Отдельный helper для создания обратной ссылки родитель ← дочка
// в режиме "add". Вынесен из EditorComponent.jsx как есть.
export function addLink(from, to) {
    axios({
        method: "post",
        url: PATH + 'thanka/thanka.php',
        headers: { "content-type": "multipart/form-data" },
        data: { from: from, to: to, method: "addLink" },
    }).then((result) => {
        //setMessage("Ссылка создана");
    }).catch((error) => {
        //setMessage("Ошибка");
    })
}

// Чистая функция сабмита редактора. Принимает один объект со всем
// необходимым снимком state + сеттеры для сообщений. Вся логика сборки
// payload'а, multipart/JSON-ветка, axios-запрос и навигация после
// успеха — здесь. Никаких изменений в поведении относительно того, что
// было в EditorComponent.jsx — это механический вынос ради читаемости.
export function submitThanka(ctx) {
    const {
        // режим / контекст
        buttonType,
        type,
        data,
        auth,
        // имя/аннотация/описание
        name,
        annotation,
        description,
        avatarName,
        // тип объекта + общие настройки
        selectedType,
        selectedAuthor,
        selectedPrivacy,
        selectedChild,
        selectedComments,
        selectedAngles,
        selectedSectors,
        selectedCircles,
        selectedElements,
        setSelectedElements,
        // картинка
        selectedPictureSend,
        selectedPicCoord,
        // article / document
        selectedDateEvent,
        selectedLocation,
        selectedPDF,
        selectedRealAuthor,
        selectedURL,
        // avatar
        birthDate,
        telNumber,
        email,
        // request
        params,
        // link / repost
        thankaLink,
        // product
        productLink,
        productCategory,
        // custom URL
        customURL,
        checkedURL,
        // сообщения
        setSystemMessageText,
        setSystemMessageStatus,
    } = ctx;

    let dataToEditor = {};
    dataToEditor.Thanka = {};
    dataToEditor.Object = {};

    dataToEditor.EditorType = type;
    dataToEditor.UserId = auth.id;
    dataToEditor.UserLogin = auth.login;

    // При редактировании (type='edit') не отправляем CustomURL, если
    // пользователь его не трогал. Иначе бэк (_build_content) перезаписывает
    // current_content.custom_url — и если исходный customURL по какой-то
    // причине не дотянулся во фронт-state (пустой), адрес тханки
    // обнуляется и она «теряет» человекочитаемый URL.
    const defaultCustomURL = String(
        (data && data.Thanka && data.Thanka.CustomURL) || (data && data.CustomURL) || ""
    ).trim()
    const desiredCustomURL = selectedType == 'avatar' && customURL != ""
        ? '@' + customURL
        : customURL
    const normalize = (v) => String(v || "").trim().toLowerCase()
    const customURLChanged = normalize(desiredCustomURL) !== normalize(defaultCustomURL)

    if (type != 'edit' || customURLChanged) {
        dataToEditor.Thanka.CustomURL = desiredCustomURL
    }
    // Иначе ключ не кладём — бэк оставит custom_url как был.

    dataToEditor.Id = (type == 'create' || type == 'add' ? '' : data.Id);
    if (buttonType == 'create') {
        dataToEditor.ParentId = data.Id;
        dataToEditor.ParentType = data.SectorLink != undefined ? "link" : data.Object.Type;
    }
    if (buttonType == 'add') {
        dataToEditor.ParentId = selectedAuthor;
    }

    dataToEditor.Angles = selectedAngles;
    if (selectedElements.length < 4) {
        let elements = selectedElements;
        for (let i = 0; i < 4 - elements.length; i++) {
            elements.push("");
        }
        setSelectedElements(elements)
    }
    dataToEditor.Elements = selectedElements.join(';');
    dataToEditor.Picture = selectedPictureSend;
    dataToEditor.PictureCoords = selectedPicCoord;

    dataToEditor.Thanka.Privacy = selectedPrivacy;
    if (type != "edit") {
        if (data.Children != null) {
            dataToEditor.Thanka.Sort = data.Children.length + 1;
        } else {
            dataToEditor.Thanka.Sort = 1
        }
    }
    dataToEditor.Thanka.OthersMakeChildren = selectedType == "cabinet" ? 0 : selectedChild;
    dataToEditor.Thanka.Comments = selectedType == "cabinet" ? 0 : selectedComments;
    dataToEditor.Thanka.VisibleElements = selectedAngles
    dataToEditor.Thanka.Author = selectedAuthor;
    dataToEditor.Thanka.Name = name;
    if (dataToEditor.Thanka.Name == "") {
        setSystemMessageText("Введите название тханки");
        setSystemMessageStatus("warning")
    }

    dataToEditor.Thanka.Annotation = annotation;

    dataToEditor.Thanka.CirclesNum = selectedCircles;
    dataToEditor.Thanka.SectorsNum = selectedSectors;

    dataToEditor.Object.Type = selectedType != "" ? selectedType : data.Object.Type;
    if (selectedType == "article") {
        dataToEditor.Object.DateEvent = selectedDateEvent;
        dataToEditor.LocationEvent = selectedLocation;
        dataToEditor.Object.Filename = selectedPDF;
    }

    if (selectedType == "document" || selectedType == "article") {
        dataToEditor.Object.RealAuthor = selectedRealAuthor;
        dataToEditor.Object.URL = selectedURL;
        dataToEditor.Object.Description = description;
    }

    if (selectedType == "avatar") {
        dataToEditor.Object.BirthDate = birthDate;
        dataToEditor.Object.TelephoneNumber = telNumber;
        dataToEditor.Object.Email = email;
        dataToEditor.Object.Name = avatarName;
    }

    if (selectedType == "request") {
        dataToEditor.Request = {}

        dataToEditor.Request.Fields = params.fieldArr != undefined ? params.fieldArr.join(",") : ""
        dataToEditor.Request.Picture = params.picture

        dataToEditor.Request.Categories = params.category

        dataToEditor.Request.SortOrder = params.sortOrder
        dataToEditor.Request.SortField = params.sortField
        dataToEditor.Request.StartDate = params.startDate
        dataToEditor.Request.EndDate = params.endDate
        dataToEditor.Request.QueryName = params.template
        dataToEditor.Request.SpecialProps = params.specialProps

        //поисковые строчки
        let search = []
        if (params.searchName != "") search.push(params.searchName)
        dataToEditor.Request.SearchString = search.join(";")
    }

    if (selectedType == "link" || selectedType == "repost") {
        if (type != "add") {
            dataToEditor.Thanka.ThankaLink = thankaLink
        } else {
            dataToEditor.Thanka.ThankaLink = data.Id
        }
    }

    if (selectedType == "product") {
        if (productLink != "") {
            dataToEditor.Object.ProductId = productLink
            dataToEditor.Object.CategoryId = productCategory.id
            dataToEditor.Object.CategoryName = productCategory.name
        } else {
            setSystemMessageText("Выберите товар");
            setSystemMessageStatus("error")
        }
    }

    if (dataToEditor.Thanka.Name != "" && checkedURL) {
        // axios 0.27 не умеет сериализовывать вложенные объекты
        // (Thanka, Object, ...) в multipart/form-data — они прилетают на бэк
        // строкой "[object Object]", поэтому все поля формы (Name, Type,
        // CustomURL, ParentId) терялись, и созданные тханки получали
        // дефолтные значения («Новая тханка» / type='article').
        //
        // Бэк умеет application/json (read_request_data: если content-type
        // содержит "application/json" — берёт await request.json()), поэтому
        // при отсутствии файлов отправляем JSON. Если в будущем нужны
        // файлы — ветка с multipart будет собирать FormData вручную.
        const hasFile = (
            (selectedPictureSend && typeof selectedPictureSend !== "string")
            || (typeof selectedPDF === "object" && selectedPDF !== null)
        )

        // axios 0.27 не умеет сериализовывать вложенные объекты в
        // multipart, поэтому при наличии File собираем FormData вручную
        // по схеме легаси-PHP: плоские ключи Thanka_Name, Object_Type,
        // Request_Fields, файл — отдельным полем Picture. Бэк через
        // build_nested_thanka_form собирает вложенные dict-ы обратно.
        let axiosCfg
        if (hasFile) {
            const fd = new FormData()
            const appendFlat = (prefix, obj) => {
                if (!obj || typeof obj !== "object") return
                for (const k of Object.keys(obj)) {
                    const v = obj[k]
                    if (v === undefined || v === null) continue
                    // вложенные объекты не ожидаются здесь, но защита
                    if (typeof v === "object" && !(v instanceof File) && !(v instanceof Blob)) {
                        // PictureCoords — единственный вложенный dict,
                        // его развернём через PictureCoords_top/.. ниже
                        continue
                    }
                    fd.append(`${prefix}_${k}`, v)
                }
            }
            // плоские ключи Thanka/Object/Request
            appendFlat("Thanka", dataToEditor.Thanka)
            appendFlat("Object", dataToEditor.Object)
            appendFlat("Request", dataToEditor.Request)
            // верхнеуровневые скаляры
            for (const k of Object.keys(dataToEditor)) {
                if (k === "Thanka" || k === "Object" || k === "Request") continue
                if (k === "Picture" || k === "PictureCoords") continue
                const v = dataToEditor[k]
                if (v === undefined || v === null) continue
                if (typeof v === "object") continue
                fd.append(k, v)
            }
            // PictureCoords развернём в PictureCoords_top/left/width/height
            if (selectedPicCoord && typeof selectedPicCoord === "object") {
                for (const k of ["top", "left", "width", "height"]) {
                    if (selectedPicCoord[k] !== undefined && selectedPicCoord[k] !== null) {
                        fd.append(`PictureCoords_${k}`, selectedPicCoord[k])
                    }
                }
            }
            // сам файл
            if (selectedPictureSend && typeof selectedPictureSend !== "string") {
                fd.append("Picture", selectedPictureSend)
            }
            if (typeof selectedPDF === "object" && selectedPDF !== null) {
                fd.append("PDF", selectedPDF)
            }
            axiosCfg = {
                method: "post",
                url: PATH + "thanka/setThanka.php",
                // не задаём content-type вручную: axios+браузер выставят
                // multipart/form-data с правильным boundary автоматически
                data: fd,
            }
        } else {
            axiosCfg = {
                method: "post",
                url: PATH + "thanka/setThanka.php",
                headers: { "content-type": "application/json" },
                data: dataToEditor,
            }
        }

        axios(axiosCfg).then((result) => {
            if (result.data != null) {
                // Навигация по канону Cogiteka:
                //   avatar  → /@login
                //   всё остальное ↑ если есть CustomURL — /CustomURL
                //                 иначе fallback /navigator/<UUID> (бэк-резолвер
                //                 всё равно найдёт тханку по UUID).
                // После успеха используем replace, а не assign: иначе нажатие
                // "Назад" в браузере вернёт на /create, который восстановится из
                // sessionStorage["address"] и покажет редактор только что
                // созданной тханки — выглядит как "выкинуло в создание тханки".
                // replace убирает /create из истории, и Back ведёт на родителя.
                if (selectedType == 'avatar' && customURL != "") {
                    window.location.replace("/@" + customURL);
                }
                else if (result.data.DocPath == "" || result.data.DocPath == undefined) {
                    // CustomURL из ответа бэка (источник правды) — важно:
                    // это именно то, что реально сохранилось в БД, а не то, что
                    // пользователь вводил в форму.
                    // Для edit fallback: если бэк не вернул CustomURL в ответе
                    // (старая ветка _h_set_thanka возвращала только Id), берём
                    // CustomURL из исходных данных тханки, которые мы редактируем —
                    // он не менялся, раз пользователь не правил поле адреса.
                    const savedCustomURL = (
                        (result.data.Thanka && result.data.Thanka.CustomURL) ||
                        result.data.CustomURL ||
                        (type == 'edit' && data && data.Thanka && data.Thanka.CustomURL) ||
                        (type == 'edit' && data && data.CustomURL) ||
                        ""
                    ).toString().trim()

                    if (dataToEditor.Id == "") {
                        // create / createsite / add
                        if (type == "add" && selectedType != "link" && selectedType != "repost") {
                            addLink(result.data.Id, data.Id)
                        }
                        if (savedCustomURL) {
                            window.location.replace("/" + savedCustomURL);
                        } else {
                            window.location.replace("/navigator/" + result.data.Id);
                        }
                    } else {
                        // edit — есть Id редактируемой тханки
                        if (savedCustomURL) {
                            window.location.replace("/" + savedCustomURL);
                        } else {
                            window.location.replace("/navigator/" + dataToEditor.Id);
                        }
                    }
                } else {
                    window.location.replace("/navigator/" + result.data.DocPath);
                }
            }
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageStatus("error")
        })
    } else {
        if (dataToEditor.Thanka.Name == "") {
            setSystemMessageText("Введите название");
            setSystemMessageStatus("error")
        }
        if (!checkedURL) {
            setSystemMessageText("Проверьте введенный адрес страницы");
            setSystemMessageStatus("error")
        }
    }
}
