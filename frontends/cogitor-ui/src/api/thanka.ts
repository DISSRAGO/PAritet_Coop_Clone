// src/api/thanka.ts
import { useEffect, useState } from "react";
import { Urls } from "../utils/urls";

// ---------- Типы данных ----------

export interface ThankaTreeItem {
  thankaId: string;
  title: string;
  status: string;
  isSystem: boolean;
  sortOrder: number;
  authorName?: string;
  hasChildren: boolean;
  createdAt?: string;
}

export interface SystemRootResponse {
  thankaId: string;
  title: string;
  status: string;
  isSystem: boolean;
}

export interface ThankaTypeSector {
  typeId: string;
  code: string;
  name: string;
  color: string;
  count: number;
}

export interface ThankaTypeSectorResponse {
  data: ThankaTypeSector[];
}

export interface ThankaSummary {
  thankaId: string;
  title: string;
  status: string;
  typeCode: string;
  typeName: string;
  createdAt?: string;
}

export interface ThankaByTypeResponse {
  type: ThankaTypeSector;
  data: ThankaSummary[];
}

export interface ThankaUrlResponse {
  thankaId: string;
  customUrl: string | null;
  slug: string;
  fullUrl: string;
}

// ---------- Утилиты для API ----------

function getBaseUrl(): string {
  const explicit =
    (Urls as any)?.API_URL ||
    (Urls as any)?.BASE_API_URL ||
    (Urls as any)?.RECLAMATION_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return `${window.location.origin}/api`;
}

async function handleJson(response: Response) {
  const text = await response.text().catch(() => "");
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { rawText: text };
  }
  if (!response.ok) {
    const message =
      data?.message || data?.detail || data?.rawText || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

// ---------- Кэш для URL тханок (in-memory, на время сессии) ----------

const _urlCache = new Map<string, string>();
const _urlPending = new Map<string, Promise<string>>();

// ---------- Сервис тханок ----------

export default class ThankaService {
  static async getSystemRoot(): Promise<SystemRootResponse> {
    const res = await fetch(`${getBaseUrl()}/thanka/system-root`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return (await handleJson(res)) as SystemRootResponse;
  }

  static async getTypeSectors(): Promise<ThankaTypeSector[]> {
    const res = await fetch(`${getBaseUrl()}/thanka/system-root/types`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const json = (await handleJson(res)) as ThankaTypeSectorResponse | any;
    return Array.isArray(json?.data) ? json.data : [];
  }

  static async getThankasByType(typeCode: string): Promise<ThankaSummary[]> {
    const res = await fetch(
      `${getBaseUrl()}/thanka/types/${encodeURIComponent(typeCode)}/thankas`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const json = (await handleJson(res)) as ThankaByTypeResponse | any;
    return Array.isArray(json?.data) ? json.data : [];
  }

  /**
   * Получить human-readable URL тханки по UUID.
   * Кэшируется in-memory + дедуплицирует параллельные запросы к одному ID.
   * Fallback: /navigator/{uuid} если кастомного URL нет.
   */
  static async getThankaUrl(thankaId: string): Promise<string> {
    if (_urlCache.has(thankaId)) return _urlCache.get(thankaId)!;
    if (_urlPending.has(thankaId)) return _urlPending.get(thankaId)!;

    const promise = fetch(`${getBaseUrl()}/thanka-url/${thankaId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ThankaUrlResponse | null) => {
        const url = data?.fullUrl || data?.slug || `/navigator/${thankaId}`;
        _urlCache.set(thankaId, url);
        _urlPending.delete(thankaId);
        return url;
      })
      .catch(() => {
        const fallback = `/navigator/${thankaId}`;
        _urlCache.set(thankaId, fallback);
        _urlPending.delete(thankaId);
        return fallback;
      });

    _urlPending.set(thankaId, promise);
    return promise;
  }
}

/**
 * useThankaUrl — хук для использования в компонентах.
 * Возвращает null пока идёт загрузка, затем — полный URL тханки.
 */
export function useThankaUrl(thankaId: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(
    thankaId && _urlCache.has(thankaId) ? _urlCache.get(thankaId)! : null
  );

  useEffect(() => {
    if (!thankaId) return;
    if (_urlCache.has(thankaId)) {
      setUrl(_urlCache.get(thankaId)!);
      return;
    }
    ThankaService.getThankaUrl(thankaId).then(setUrl);
  }, [thankaId]);

  return url;
}