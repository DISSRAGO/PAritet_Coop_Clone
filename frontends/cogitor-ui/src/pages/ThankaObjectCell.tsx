import React from "react";
import { useThankaUrl } from "../api/thanka";

interface Props {
  targetType: string;
  targetId: string;
}

export function ThankaObjectCell({ targetType, targetId }: Props) {
  const isThanka = targetType === "thanka";
  const url = useThankaUrl(isThanka ? targetId : null);

  if (!isThanka || !targetId) {
    return <span>{targetType || "—"}{targetId ? `: ${targetId}` : ""}</span>;
  }

  if (!url) {
    return <span style={{ color: "#bbb", fontSize: 12 }}>загрузка...</span>;
  }

  const slug = (() => {
    try { return new URL(url).pathname; }
    catch { return url; }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      style={{ fontFamily: "monospace", fontSize: 13 }}
    >
      {slug}
    </a>
  );
}