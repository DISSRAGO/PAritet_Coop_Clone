import React, { useState, useEffect} from "react";
import axios from "axios";
import {PATH, DIRPATH} from "../../utils/url.js";

import "../../style/thanka.css";

import { SystemMessage } from "../Viewer/SystemMessage.jsx";

function LocationAttrs(props) {

    const { LocationEvent, type } = props;

    const defaultCountry = { Name: "Россия", ID: "1" };
    const defaultRegion = { Name: "Новосибирская обл.", ID: "1" };
    const defaultCity = { Name: "Новосибирск г.", ID: "1" };

    //массивы для значений, очевидно
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState(defaultCountry.ID);
    const [selectedRegion, setSelectedRegion] = useState(defaultRegion.ID);
    const [selectedCity, setSelectedCity] = useState(defaultCity.ID);

    const [systemMessageText, setSystemMessageText] = useState("");
    const [systemMessageStatus, setSystemMessageStatus] = useState("none");

    function getCountries() {
        axios({
            method: "get",
            url: PATH + 'location/location.php?method=country',
            headers: { "content-type": "multipart/form-data" },
            data: {}
        }).then((result) => {
            let array = result.data.Country.slice();
            setCountries(array);  
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
            setSystemMessageStatus("error")
        })
    }

    function callToRegions(countryId, numofcall) {
        axios({
            method: "get",
            url: PATH + "location/location.php?method=region&value=" + countryId,
            headers: { "content-type": "multipart/form-data" },
            data: {}
        }).then((result) => {
            let arr = [];
            if (Array.isArray(result.data.Region)) { arr = result.data.Region.slice(); } 
            else { arr[0] = result.data.Region; }
            setRegions(arr);

            if (numofcall !== 0) { callToCities(arr[0].ID); }
        }).catch((error) => {
            setSystemMessageText("Произошла ошибка");
             setSystemMessageStatus("error")
        })
    }

    function callToCities(regionId) {
        axios({
            method: "get",
            url: PATH + "location/location.php?method=city&value=" + regionId,
            headers: { "content-type": "multipart/form-data" },
            data: {}
        }).then((result) => {
            let arr = [];
            if (Array.isArray(result.data.City)) { arr = result.data.City.slice(); } 
            else { arr[0] = result.data.City; } 
            setCities(arr);
        }).catch((error) => {
            let arr = [];
            arr[0] = {Name: 'не указано', ID: '-1'};
            setCities(arr);
        })
    }

    useEffect(() => {  
        if (type == "edit" && LocationEvent !== null && LocationEvent[2].ID != "" && LocationEvent[2] !== undefined) {
            setSelectedCountry(LocationEvent[0].ID);
            setSelectedRegion(LocationEvent[1].ID);
            setSelectedCity(LocationEvent[2].ID);
        } 
        getCountries();
    }, []);

    useEffect(() => {
        if (selectedCountry != "") {
            callToRegions(selectedCountry, 0);
        }
        if (selectedRegion != "") {
            callToCities(selectedRegion);
        }
    }, [selectedCountry, selectedRegion]);

    const countryOnChange = (e) => {
        setSelectedCountry(e.target.value);
        if (e.target.value != "") {
            callToRegions(e.target.value, 1);
        }
    };

    const regionOnChange = (e) => {
        setSelectedRegion(e.target.value);
        if (e.target.value != null) {
            callToCities(e.target.value);
        }
    };

    return (
        <div className="location">            
            <p>Место события:</p>
            <div className="locationPart">
            <label>{"Страна: "}</label>
            <select name="Country" onChange={countryOnChange} defaultValue = {selectedCountry}>
                {countries.map((country) => (
                    <option value={country.Id} selected={country.Id == selectedCountry ? "selected" : ""}>
                        {country.Name}
                    </option>
                ))}
            </select>
        </div>
        <div className="locationPart">
            <label>{"Регион: "}</label>
            <select name="Region" onChange={regionOnChange} defaultValue={selectedRegion}>
                {regions.map((region) => (
                    <option value={region.Id} selected={region.Id == selectedRegion ? "selected" : ""}>
                        {region.Name}
                    </option>
                ))}
            </select>
        </div>
        <div className="locationPart">
            <label>{"Город: "}</label>
            <select name="City" onChange={props.onChange}>
                {cities.map((city) => (
                    <option value={city.Id} selected={city.Id == selectedCity ? "selected" : ""}>
                        {city.Name}
                    </option>
                ))}
            </select>
            </div>
            <SystemMessage messageText = {systemMessageText} setMessageText = {setSystemMessageText} status = {systemMessageStatus} setStatus = {setSystemMessageStatus}/>
        </div>
    );
}

export default LocationAttrs