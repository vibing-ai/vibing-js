export enum PermissionType {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  GEOLOCATION = 'geolocation',
  NOTIFICATIONS = 'notifications',
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface AppConfig {
  apiKey?: string;
  debug?: boolean;
}
