import React from "react";
import { PrivacySettins } from "./PrivacySettings.jsx";
import { CustomURL } from "./CustomURL.jsx";

// Section «Настройки отображения» — нижняя половина редактора тханки.
// Группирует CustomURL и PrivacySettins. Логика не менялась — это
// механический вынос из EditorComponent.jsx.
function EditorDisplaySection(props) {
    const {
        // CustomURL
        customURL, setCustomURL,
        selectedType,
        checkedURL, setCheckedURL,
        data,
        // PrivacySettins
        selectedPrivacy, setSelectedPrivacy,
        selectedChild, setSelectedChild,
        selectedComments, setSelectedComments,
        selectedCircles, setSelectedCircles,
        selectedAngles, setSelectedAngles,
        selectedSectors, setSelectedSectors,
        type,
        elemArr, setSelectedElements,
        setSelectedPictureSend,
        setPicCoord,
        selectedPicCoord,
    } = props;

    return (
        <section className="lil-container">
            <h3>Настройки отображения</h3>
            <CustomURL
                customURL={customURL}
                setCustomURL={setCustomURL}
                type={selectedType}
                checkedURL={checkedURL}
                setCheckedURL={setCheckedURL}
                defaultURL={data.CustomURL}
            />
            <PrivacySettins
                selectedPrivacy={selectedPrivacy} setSelectedPrivacy={setSelectedPrivacy}
                selectedChild={selectedChild} setSelectedChild={setSelectedChild}
                selectedComments={selectedComments} setSelectedComments={setSelectedComments}
                selectedCircles={selectedCircles} setSelectedCircles={setSelectedCircles}
                selectedAngles={selectedAngles} setSelectedAngles={setSelectedAngles}
                selectedSectors={selectedSectors} setSelectedSectors={setSelectedSectors}
                selectedType={selectedType} type={type}
                elemArr={elemArr} setSelectedElements={setSelectedElements}
                data={data}
                setSelectedPictureSend={setSelectedPictureSend}
                setPicCoord={setPicCoord}
                selectedPicCoord={selectedPicCoord}
            />
        </section>
    );
}

export default EditorDisplaySection;
