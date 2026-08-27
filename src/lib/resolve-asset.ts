import { Image, type ImageSourcePropType } from "react-native";

type ResolvedAsset = {
  uri: string;
  width: number;
  height: number;
  scale: number;
};

/**
 * `Image.resolveAssetSource` is native-only. On web / Node (EAS embed) it is
 * missing and calling it throws. Prefer this helper everywhere.
 */
export function resolveAssetSourceSafe(
  source: ImageSourcePropType,
): ResolvedAsset | null {
  const resolve = Image.resolveAssetSource;
  if (typeof resolve === "function") {
    const resolved = resolve(source);
    if (!resolved) return null;
    return {
      uri: resolved.uri ?? "",
      width: resolved.width ?? 0,
      height: resolved.height ?? 0,
      scale: resolved.scale ?? 1,
    };
  }

  if (typeof source === "string") {
    return { uri: source, width: 0, height: 0, scale: 1 };
  }

  if (source && typeof source === "object" && !Array.isArray(source)) {
    if ("uri" in source && typeof source.uri === "string") {
      return {
        uri: source.uri,
        width: typeof source.width === "number" ? source.width : 0,
        height: typeof source.height === "number" ? source.height : 0,
        scale: 1,
      };
    }
  }

  return null;
}

export function resolveAssetUri(source: ImageSourcePropType): string {
  const resolved = resolveAssetSourceSafe(source);
  if (resolved?.uri) return resolved.uri;
  return typeof source === "string" ? source : "";
}

export function resolveAssetSize(
  source: ImageSourcePropType,
  fallback: { width: number; height: number } = { width: 1024, height: 1536 },
): { width: number; height: number } {
  const resolved = resolveAssetSourceSafe(source);
  return {
    width: resolved && resolved.width > 0 ? resolved.width : fallback.width,
    height: resolved && resolved.height > 0 ? resolved.height : fallback.height,
  };
}
