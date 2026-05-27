import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {GetCountriesListResult, GetRegionsListOptions, GetRegionsListResult} from "./AddressApi";
import {ThankaDataType} from "../mocks/thanka_data";

// ${process.env['NX_API_URL']}
export const thankaApi = createApi({
    reducerPath: "thankaApi",
    baseQuery: fetchBaseQuery({baseUrl: `/api/thanka`}),
    endpoints: (build) => ({
        getCountriesList: build.query<GetCountriesListResult, void>({
            query: () => {
                return {
                    url: `/countries`,
                    method: "GET",
                };
            },
        }),
    }),
});

export const getFakeThankaData = () => {
    const data: ThankaDataType = {
        id: 2456,
        type: "article",
        typeName: "Статья",
        name: "Заметки по разработке",
        dateCreate: "23.06.2022",
        fullPath: "Главная",
        accusativus: "статью",
        author: 2001,
        parent: 4000,
        parentType: 'article',
        authorName: "Нана Нахимова",
        eventDate: "25.05.2022",
        eventLocation: ["Россия", "Новосибирская область", "Новосибирск"],
        genitivus: "статьи",
        stamped: false,
        systemMessage: 'Сообщение от системы',
        tags: ['Идеи', 'Разработка', 'Третий тег'],

        description: `Если вам приходилось хотя бы однажды размещать в верстке текст, 
            набранный неумело, без знания особенностей работы с ним средствами программ макетирования, 
            то вопрос «есть ли у набора правила?» покажется вам лишним. Или, наоборот, вам случалось набирать текст, 
            утомляя глаза и пальцы, а потом видеть недовольные лица верстальщиков… 
            Каким же требованиям должен подчиняться компьютерный набор, чтобы обеспечить эффективную подготовку публикации? 
            Основных принципов можно выделить три: совместимость, простота и структурированность.`,

        thankaChildren: [
            {id: 2002, description: "Если вам приходилось", name: "Тханка 2002"},
            {id: 3003, description: "хотя бы однажды размещать в верстке текст,", name: "Тханка 3003"},
            {id: 4004, description: "набранный неумело, без знания особенностей", name: "Тханка 4004"},
            {id: 5005, description: "работы с ним средствами программ макетирования,", name: "Тханка 5005"},
            {id: 8888, description: "работы с ним средствами программ макетирования,", name: "Тханка 8888"},
        ],

        elements: [
            {id: 1001, description: "", name: "Тханка 1001"},
            {id: 1002, description: "", name: "Тханка 1002"},
            {id: 1003, description: "", name: "Тханка 1003"},
            {id: 1004, description: "", name: "Тханка 1004"},
        ],

        childrenImage: [ 1, 0, 1, 1, 0 ],
        centerImage: 1,
        elementsImage: [ 1, 1, 1, 1],

        childrenNum: 5,
        circlesNum: 1,
        sectorsNum: 8
    };
    return data;
}