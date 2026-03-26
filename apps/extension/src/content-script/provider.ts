// Provider type definitions for dApps
export interface PilotProvider {
  connect(): Promise<{ address: string }>;
  getAddress(): Promise<string>;
  signTransaction(transaction: Record<string, unknown>): Promise<{ hash: string; blob: string }>;
  disconnect(): Promise<void>;
  on(event: PilotEvent, callback: (data: unknown) => void): void;
  off(event: PilotEvent, callback: (data: unknown) => void): void;
}

export type PilotEvent = 'connect' | 'disconnect' | 'accountChanged' | 'networkChanged';

export interface PilotRequest {
  type: string;
  payload?: Record<string, unknown>;
  origin: string;
  id: number;
}

export interface PilotResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

declare global {
  interface Window {
    pilot: PilotProvider;
  }
}
