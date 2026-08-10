import React, { useEffect, useRef, useState, useMemo } from "react";

const strokeColour = "#606060";

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function radToDeg(rad) {
  return rad / (Math.PI / 180);
}

/**
 * SVG‑независимое колесо тханки — рендерится через Canvas API,
 * поведение полностью совпадает с оригинальным Canvas.jsx:
 *  - при наведении сектор увеличивается (OneSectorBig)
 *  - tooltip с названием следует за курсором
 *  - клик вызывает onSelect(code)
 *
 * Props:
 *  - sectors: Array<{ typeId, code, name, color, count }>
 *  - selected: string | null
 *  - onSelect: (code: string) => void
 *  - size?: number  (default 360)
 *  - centerLabel?: string
 */
export function ThankaWheel({
  sectors = [],
  selected = null,
  onSelect,
  size = 360,
  centerLabel = "",
}) {
  const w = size;
  const h = size;

  // Радиусы: innerR — дырка, outerR — внешний край
  const outerR = w / 2 - 12;
  const innerR = w / 4 - 20;

  const normalRef = useRef(null); // нормальные сектора
  const hoverRef = useRef(null);  // увеличенный сектор при наведении
  const centerRef = useRef(null); // центральный круг

  // Текущий ховер: { ci: 0, si: index } или null
  const [hoverIdx, setHoverIdx] = useState(null);
  const [tooltip, setTooltip] = useState({ text: "", x: 0, y: 0, visible: false });

  const n = sectors.length;

  // Геометрия секторов
  const sectorDefs = useMemo(() => {
    if (n === 0) return [];
    return sectors.map((sec, j) => ({
      ...sec,
      innerRadius: innerR,
      outerRadius: outerR,
      rotation: -90 + (360 / n) * j,
      angle: 360 / n,
      j,
    }));
  }, [sectors, n, innerR, outerR]);

  function drawSectorNormal(ctx, sec) {
    const startAngle = degToRad(sec.rotation);
    const stopAngle = degToRad(sec.rotation + sec.angle);
    const gap = 0.018;

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, sec.innerRadius, startAngle + gap, stopAngle - gap, false);
    ctx.arc(w / 2, h / 2, sec.outerRadius, stopAngle - gap, startAngle + gap, true);
    ctx.closePath();
    ctx.fillStyle = sec.color || "#e8e8e8";
    ctx.fill();
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Подпись
    const midAngle = (startAngle + stopAngle) / 2;
    const labelR = sec.innerRadius + (sec.outerRadius - sec.innerRadius) / 2;
    const lx = w / 2 + labelR * Math.cos(midAngle);
    const ly = h / 2 + labelR * Math.sin(midAngle);
    ctx.restore();

    ctx.save();
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sec.name || "", lx, ly);
    ctx.restore();
  }

  function drawSectorBig(ctx, sec) {
    const startAngle = degToRad(sec.rotation - 10);
    const stopAngle = degToRad(sec.rotation + sec.angle + 10);
    const inR = sec.innerRadius - 12;
    const outR = sec.outerRadius + 12;

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, inR, startAngle, stopAngle, false);
    ctx.arc(w / 2, h / 2, outR, stopAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = sec.color || "#e8e8e8";
    ctx.fill();
    ctx.strokeStyle = "#1890ff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Подпись
    const midAngle = (startAngle + stopAngle) / 2;
    const labelR = inR + (outR - inR) / 2;
    const lx = w / 2 + labelR * Math.cos(midAngle);
    const ly = h / 2 + labelR * Math.sin(midAngle);
    ctx.restore();

    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sec.name || "", lx, ly);
    ctx.restore();
  }

  function drawCenter(ctx) {
    const grad = ctx.createRadialGradient(w / 2, h / 2 - 10, 4, w / 2, h / 2, innerR * 0.95);
    grad.addColorStop(0, "#f5f5f5");
    grad.addColorStop(0.5, "#e0e0e0");
    grad.addColorStop(1, "#d0d0d0");

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, innerR * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#bfbfbf";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (centerLabel) {
      ctx.font = "500 13px sans-serif";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerLabel, w / 2, h / 2);
    }
    ctx.restore();
  }

  // Рисуем нормальные сектора при изменении списка
  useEffect(() => {
    if (!normalRef.current || n === 0) return;
    const ctx = normalRef.current.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    sectorDefs.forEach((sec) => drawSectorNormal(ctx, sec));
  }, [sectorDefs, w, h]);

  // Рисуем центр
  useEffect(() => {
    if (!centerRef.current) return;
    const ctx = centerRef.current.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    drawCenter(ctx);
  }, [w, h, centerLabel, innerR]);

  // Рисуем увеличенный сектор при ховере
  useEffect(() => {
    if (!hoverRef.current) return;
    const ctx = hoverRef.current.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    if (hoverIdx !== null && sectorDefs[hoverIdx]) {
      drawSectorBig(ctx, sectorDefs[hoverIdx]);
    }
  }, [hoverIdx, sectorDefs, w, h]);

  function getSectorAtPoint(offsetX, offsetY) {
    const dx = offsetX - w / 2;
    const dy = offsetY - h / 2;
    const R = Math.sqrt(dx * dx + dy * dy);

    if (R < innerR || R > outerR) return null;

    let teta = Math.atan2(dy, dx);
    if (radToDeg(teta) > -180 && radToDeg(teta) < -90) {
      teta += Math.PI * 2;
    }

    for (let j = 0; j < n; j++) {
      const startAngle = degToRad(-90 + (360 / n) * j);
      const endAngle = degToRad(-90 + (360 / n) * (j + 1));
      if (teta >= startAngle && teta <= endAngle) {
        return j;
      }
    }
    return null;
  }

  function onMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const idx = getSectorAtPoint(offsetX, offsetY);

    setHoverIdx(idx);

    if (idx !== null && sectorDefs[idx]) {
      setTooltip({ text: sectorDefs[idx].name, x: e.clientX + 12, y: e.clientY - 8, visible: true });
    } else {
      setTooltip((t) => (t.visible ? { ...t, visible: false } : t));
    }
  }

  function onMouseLeave() {
    setHoverIdx(null);
    setTooltip((t) => (t.visible ? { ...t, visible: false } : t));
  }

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const idx = getSectorAtPoint(offsetX, offsetY);
    if (idx !== null && sectorDefs[idx] && onSelect) {
      onSelect(sectorDefs[idx].code);
    }
  }

  if (n === 0) {
    return (
      <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>
        Нет типов содержимого
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", width: w, height: h, cursor: "pointer" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      {/* Слой нормальных секторов */}
      <canvas ref={normalRef} width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }} />
      {/* Слой увеличенного сектора при ховере */}
      <canvas ref={hoverRef} width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }} />
      {/* Слой центра (поверх всего) */}
      <canvas ref={centerRef} width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }} />

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export default ThankaWheel;