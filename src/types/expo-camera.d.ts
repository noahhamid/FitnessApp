/**
 * Fallback types when `expo-camera` is in package.json but not installed
 * in this workspace. Runtime still comes from the real package after npm ci.
 */
declare module "expo-camera" {
  import type { ComponentType } from "react";

  export type CameraPermissionResponse = {
    granted: boolean;
  };

  export type CameraViewRef = {
    takePictureAsync: (options?: Record<string, unknown>) => Promise<
      { uri: string; base64?: string } | undefined
    >;
  };

  export const CameraView: ComponentType<Record<string, unknown>>;

  export function useCameraPermissions(): [
    CameraPermissionResponse | null,
    () => Promise<CameraPermissionResponse>,
  ];
}
