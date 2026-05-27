import { SITE_NAKED, SITE } from "./url"
import React from "react"

function pushHistory(address) {
    let addr = sessionStorage.getItem("history")
    let history = addr != null ? addr.split(";") : []

    if (history.at(-1) != address) history.push(address)

    addr = history.join(";")
    sessionStorage.setItem('history', addr)
}

function backHistory() {
    let addr = sessionStorage.getItem("history")
    let history = addr != null ? addr.split(";") : []

    history.pop()

    if (history.at(-1) != undefined) window.location.assign(SITE + history.at(-1).slice(1))
}

function setBreadCrumbs(address, name) {
    let history = sessionStorage.getItem('breadcrumbs')

    let history_arr = []

    if (history != "" && history != null) {
        history_arr = JSON.parse(history)

        let i = history_arr.findIndex((item) => item.path == address)
        if (i != -1) {
            history_arr.splice(i,1)
        }    
    }

    history_arr.push({path: address, title: name})

    sessionStorage.setItem("breadcrumbs", JSON.stringify(history_arr))
}

function getBreadCrumbs() {
    let history = sessionStorage.getItem('breadcrumbs')

    let history_arr = []
    let breadcrumbs = []
    
    if (history != "" && history != null) {
        history_arr = JSON.parse(history)
    }

    for (let i = 0; i < history_arr.length; i++) {
        breadcrumbs.push({title: history_arr[i].title, href: SITE_NAKED+history_arr[i].path})
    }

    return breadcrumbs
}

export {pushHistory, backHistory, setBreadCrumbs, getBreadCrumbs}
