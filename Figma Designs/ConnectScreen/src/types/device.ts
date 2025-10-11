export interface Device {
  id: string;
  name: string;
  model: string;
  signal: {
    dots: number;
    total: number;
    strength: string;
    color: string;
  };
}

export type ConnectionState = 'scanning' | 'found' | 'connecting' | 'connected' | 'error';