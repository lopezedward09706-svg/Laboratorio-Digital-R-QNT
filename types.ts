
export enum ValueType {
  SPIN = 'Spin (+1, 0, -1)',
  BINARY = 'Binario (0, 1)',
  CONTINUOUS = 'Continuo (0.0 - 1.0)'
}

export interface ABCParams {
  a: number;
  b: number;
  c: number;
  alpha: number;
  alpha_w: number;
  alpha_s: number;
}

export interface QuantumNode {
  id: number;
  state: 'a' | 'b' | 'c' | 'A' | 'B' | 'C';
  energy: number;
  x: number;
  y: number;
  z: number;
  isExcited: boolean;
  sum?: number;
}

export interface ValidationMetrics {
  electronMass: { predicted: number; actual: number; error: number };
  protonMass: { predicted: number; actual: number; error: number };
  G: { predicted: number; actual: number; error: number };
  matchPercentage: number;
}

export interface SimulationResult {
  nodes: QuantumNode[];
  timestamp: string;
  config: {
    nodeCount: number;
    params: ABCParams;
  };
  metrics: ValidationMetrics;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
