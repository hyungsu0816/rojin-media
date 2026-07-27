/* eslint-disable @typescript-eslint/no-explicit-any */

/** "projects.0.title" 같은 경로로 값을 읽습니다. */
export function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/** 원본을 건드리지 않고 경로에 값을 씁니다. */
export function setPath<T>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  let cursor = clone;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = cursor[key];
    cursor[key] = Array.isArray(next) ? [...next] : { ...next };
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
  return clone as T;
}

/** 저장된 값이 기본값 위에 덮이도록 병합합니다. (배열은 통째로 교체) */
export function deepMerge<T>(base: T, patch: any): T {
  if (patch == null || typeof patch !== "object") return base;
  if (Array.isArray(base) || Array.isArray(patch)) return patch as T;

  const out: any = { ...(base as any) };
  for (const key of Object.keys(patch)) {
    const b = (base as any)?.[key];
    const p = patch[key];
    out[key] =
      b && typeof b === "object" && p && typeof p === "object" ? deepMerge(b, p) : p;
  }
  return out as T;
}
