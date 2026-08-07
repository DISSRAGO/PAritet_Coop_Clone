import React from "react";
import Canvas from "../Iconostas/Canvas";
import { ThankaTypeSector } from "../../api/thanka";

/**
 * Колесо типов для системной корневой тханки.
 * Адаптирует ThankaTypeSector[] к формату данных Canvas.
 */
interface Props {
  sectors: ThankaTypeSector[];
  systemRootId: string;
}

const SystemThankaWheel: React.FC<Props> = ({ sectors, systemRootId }) => {
  const data = React.useMemo(() => {
    const children = sectors.map((s) => ({
      ID: s.code,           // уникальный идентификатор типа
      Name: s.name,         // подпись сектора
      Annotation: "",
      DocumentPath: s.code, // просто чтобы что‑то было
      Image: 0,
    }));

    return {
      Id: systemRootId,
      Hash: "system-root",
      Object: { Type: "thanka" },
      Thanka: {
        CirclesNum: 1,
        SectorsNum: sectors.length,
        DocumentPart: false,
        ParentsSectors: sectors.length,
      },
      Children: children,
      ChildrenImage: children.map(() => 0),
      DocImage: [],
    };
  }, [sectors, systemRootId]);

  const isBigScreen = true;
  const isTinyScreen = false;

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 24 }}>
      <Canvas
        data={data}
        isBigScreen={isBigScreen}
        isTinyScreen={isTinyScreen}
        isLite={false}
        mainId={systemRootId}
        isSite={false}
      />
    </div>
  );
};

export default SystemThankaWheel;