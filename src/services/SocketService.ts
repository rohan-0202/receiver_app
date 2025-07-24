import { io, Socket } from 'socket.io-client';
import { ChipData, VitalSigns, CameraData } from '../types';

export class SocketService {
  private socket: Socket | null = null;
  private publisherUrl: string;
  private isConnected: boolean = false;

  // Callback functions
  private onVitalSignsUpdate?: (vitals: VitalSigns, image?: string) => void;
  private onRGBImageUpdate?: (imageData: string) => void;
  private onThermalImageUpdate?: (imageData: string) => void;
  private onFPSUpdate?: (fps: number) => void;
  private onConnectionStatusChange?: (status: 'Active' | 'Inactive', ip: string) => void;

  constructor(publisherIP: string, publisherPort: number = 27182) {
    this.publisherUrl = `http://${publisherIP}:${publisherPort}`;
  }

  // Automatic publisher discovery (similar to desktop app)
  public static async discoverPublisher(): Promise<string | null> {
    try {
      const publisherPort = 27182;
      
      // Test known working IPs first
      const testIPs = ['10.0.0.32', '127.0.0.1', 'localhost'];
      
      for (const ip of testIPs) {
        console.log(`Testing IP: ${ip}`);
        if (await SocketService.testConnection(ip, publisherPort)) {
          console.log(`Publisher found at ${ip}:${publisherPort}`);
          return ip;
        }
      }
      
      console.log('No publisher found at known IPs');
      return null;
    } catch (error) {
      console.error('Publisher discovery failed:', error);
      return null;
    }
  }

  private static async getLocalIP(): Promise<string | null> {
    try {
      // Simple method to get local IP (works in React Native)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      // Fallback - return common network base
      return '10.0.0.1';
    }
  }

  private static async testConnection(ip: string, port: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Increase timeout

      console.log(`Testing connection to http://${ip}:${port}/ping`);
      const response = await fetch(`http://${ip}:${port}/ping`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Connection test result for ${ip}:${port}:`, response.ok, response.status);
      return response.ok && response.status === 200;
    } catch (error) {
      console.log(`Connection test failed for ${ip}:${port}:`, error);
      return false;
    }
  }

  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          this.socket.disconnect();
        }

        console.log('Attempting to connect to:', this.publisherUrl);

        this.socket = io(this.publisherUrl, {
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          timeout: 20000,
          forceBase64: false, // Enable binary data handling
          upgrade: true,
          rememberUpgrade: false,
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          forceNew: true,
        });

        this.socket.on('connect', () => {
          console.log('Connected to publisher:', this.publisherUrl);
          console.log('Socket ID:', this.socket?.id);
          this.isConnected = true;
          this.onConnectionStatusChange?.('Active', this.getIPFromUrl());
          this.setupEventHandlers();
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from publisher:', reason);
          this.isConnected = false;
          this.onConnectionStatusChange?.('Inactive', 'Disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.onConnectionStatusChange?.('Inactive', 'Connection Error');
          reject(error);
        });

      } catch (error) {
        console.error('Error setting up socket connection:', error);
        reject(error);
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Debug: Log all incoming events - COMMENTED OUT to reduce console spam
    // const originalEmit = this.socket.emit;
    // this.socket.onAny((eventName: string, ...args: any[]) => {
    //   console.log(`Received SocketIO event: ${eventName}`, args.length > 0 ? args[0] : 'no data');
    // });

    // Handle chip data updates (vital signs)
    this.socket.on('add_chip', (data: ChipData) => this.handleChipUpdate(data));
    this.socket.on('update_chip', (data: ChipData) => this.handleChipUpdate(data));

    // Handle camera feed updates - convert raw bytes to base64
    this.socket.on('update_feed', (data: any) => {
      try {
        // Removed detailed logging to reduce console spam
        // Only log errors or important events
        
        let base64String: string;
        
        if (data instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(data);
          base64String = this.arrayBufferToBase64(uint8Array);
        } else if (data instanceof Uint8Array) {
          base64String = this.arrayBufferToBase64(data);
        } else if (typeof data === 'string') {
          // Already base64 encoded
          base64String = data;
        } else {
          console.error('Unknown data format for update_feed:', data);
          return;
        }
        
        // Removed base64 length logging to reduce console spam
        this.onRGBImageUpdate?.(base64String);
      } catch (error) {
        console.error('Error processing RGB image data:', error);
      }
    });

    this.socket.on('thermal_image', (data: ArrayBuffer) => {
      try {
        // Convert ArrayBuffer to base64 string
        const uint8Array = new Uint8Array(data);
        const base64String = this.arrayBufferToBase64(uint8Array);
        this.onThermalImageUpdate?.(base64String);
      } catch (error) {
        console.error('Error processing thermal image data:', error);
      }
    });

    // Handle frame rate updates
    this.socket.on('frame_rate', (data: ArrayBuffer) => {
      const fps = this.bytesToFloat(data);
      this.onFPSUpdate?.(fps);
    });
  }

  private handleChipUpdate(data: ChipData): void {
    try {
      const chipData = data.chip_data;
      const vitals: VitalSigns = {
        heartrate: chipData.heartrate,
        resprate: chipData.resprate,
        temp: chipData.temp,
      };
      
      this.onVitalSignsUpdate?.(vitals, chipData.chip_img);
    } catch (error) {
      console.error('Error handling chip update:', error);
    }
  }

  private bytesToFloat(buffer: ArrayBuffer): number {
    const view = new DataView(buffer);
    return view.getFloat32(0, true); // little endian
  }

  // Helper method to convert ArrayBuffer to base64
  private arrayBufferToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  private getIPFromUrl(): string {
    try {
      const url = new URL(this.publisherUrl);
      return url.hostname;
    } catch {
      return 'Unknown';
    }
  }

  public changeConnection(newIP: string, port: number = 27182): void {
    this.publisherUrl = `http://${newIP}:${port}`;
    this.connect().catch(console.error);
  }

  public disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.isConnected = false;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getConnectedIP(): string {
    return this.getIPFromUrl();
  }

  // Callback setters
  public setOnVitalSignsUpdate(callback: (vitals: VitalSigns, image?: string) => void): void {
    this.onVitalSignsUpdate = callback;
  }

  public setOnRGBImageUpdate(callback: (imageData: string) => void): void {
    this.onRGBImageUpdate = callback;
  }

  public setOnThermalImageUpdate(callback: (imageData: string) => void): void {
    this.onThermalImageUpdate = callback;
  }

  public setOnFPSUpdate(callback: (fps: number) => void): void {
    this.onFPSUpdate = callback;
  }

  public setOnConnectionStatusChange(callback: (status: 'Active' | 'Inactive', ip: string) => void): void {
    this.onConnectionStatusChange = callback;
  }
} 