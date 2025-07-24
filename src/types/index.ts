export interface VitalSigns {
  heartrate: number | string;
  resprate: number | string;
  temp: number | string;
}

export interface ChipData {
  chip_data: {
    temp: number | string;
    heartrate: number | string;
    resprate: number | string;
    chip_img?: string;
  };
}

export interface PatientInfo {
  name: string;
  location: string;
  facility: string;
  city: string;
  isSearching?: boolean;
}

export interface SystemInfo {
  fps: number;
  connectionStatus: 'Active' | 'Inactive';
  connectedIP: string;
  logs: LogMessage[];
}

export interface LogMessage {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

export interface SocketEvents {
  add_chip: (data: ChipData) => void;
  update_chip: (data: ChipData) => void;
  update_feed: (data: string) => void;
  frame_rate: (data: ArrayBuffer) => void;
  thermal_image: (data: string) => void;
}

export interface CameraData {
  rgbImage?: string;
  thermalImage?: string;
}

export interface VitalSignHistory {
  heartRate: number[];
  respRate: number[];
  temperature: number[];
} 