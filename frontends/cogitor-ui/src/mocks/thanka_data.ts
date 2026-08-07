// src/mocks/thanka_data.ts

export interface ThankaChild {
  id: number;
  description: string;
  name: string;
}

export interface ThankaElement {
  id: number;
  description: string;
  name: string;
}

export interface ThankaDataType {
  id: number;
  type: string;
  typeName: string;
  name: string;
  dateCreate: string;
  fullPath: string;
  accusativus: string;
  author: number;
  parent: number;
  parentType: string;
  authorName: string;
  eventDate: string;
  eventLocation: string[];
  genitivus: string;
  stamped: boolean;
  systemMessage: string;
  tags: string[];
  thankaChildren: ThankaChild[];
  elements: ThankaElement[];
  childrenImage: number[];
  centerImage: number;
  elementsImage: number[];
  childrenNum: number;
  circlesNum: number;
  sectorsNum: number;
}

export const getFakeThankaData = (): ThankaDataType => {
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
    parentType: "article",
    authorName: "Нана Нахимова",
    eventDate: "25.05.2022",
    eventLocation: ["Россия", "Новосибирская область", "Новосибирск"],
    genitivus: "статьи",
    stamped: false,
    systemMessage: "Сообщение от системы",
    tags: ["Идеи", "Разработка", "Третий тег"],
    thankaChildren: [
      { id: 2002, description: "Если вам приходилось", name: "Тханка 2002" },
      { id: 3003, description: "хотя бы однажды размещать в верстке текст,", name: "Тханка 3003" },
      { id: 4004, description: "набранный неумело, без знания особенностей", name: "Тханка 4004" },
      { id: 5005, description: "работы с ним средствами программ макетирования,", name: "Тханка 5005" },
      { id: 8888, description: "работы с ним средствами программ макетирования,", name: "Тханка 8888" },
    ],
    elements: [
      { id: 1001, description: "", name: "Тханка 1001" },
      { id: 1002, description: "", name: "Тханка 1002" },
      { id: 1003, description: "", name: "Тханка 1003" },
      { id: 1004, description: "", name: "Тханка 1004" },
    ],
    childrenImage: [1, 0, 1, 1, 0],
    centerImage: 1,
    elementsImage: [1, 1, 1, 1],
    childrenNum: 5,
    circlesNum: 1,
    sectorsNum: 8,
  };
  return data;
};