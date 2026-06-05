import React from "react";

// Селектор аватара (автора) для типов тханки, у которых надо явно
// указать, от какого аватара владелец её создаёт. Вынесен из
// EditorComponent.jsx без изменения поведения.
function AvatarList(props) {

    const { list, authorId, setSelectedAuthor } = props;

    return (
        <>
            <p>Аватар:</p>
            <select onChange={(e) => setSelectedAuthor(e.target.value)} defaultValue={authorId || ""}>
                {list.map((avatar) => (
                    <option key={avatar.ID} value={avatar.ID}>{avatar.Name}</option>
                ))}
            </select>
        </>
    )
}

export default AvatarList;
