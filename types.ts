export interface CalculationResult {
  success: boolean;
  message: string;
  value?: number;
  category?: string;
  color?: string;
  details?: any; // For complex objects like WHO results or MF analysis
}

export enum Gender {
  Male = 'Erkek',
  Female = 'Kız'
}

export interface WhoResult {
  z_score: number | null;
  percentile?: number;
  age_months: number;
  type: string;
  measurement_value: string;
  lms: [number, number, number] | null;
  error?: string;
}

export interface MfOption {
  id: number;
  ana: number;
  mf: number;
  total: number;
  unit_cost: number;
  months: number;
  psf_gain: number;
  sgk_cost: number;
  net_finance: number;
  real_profit_total: number;
  per_box_profit_tl: number;
  per_box_profit_pct: number;
  is_recommended?: boolean;
}

export interface MfAnalysisResult {
  options: MfOption[];
  warning_mode: boolean;
  old_stock: number;
  months_delay: number;
  buy_date_str: string;
  payment_date_str: string;
}

export interface Product {
  barcode: string;
  name: string;
  psf: number;
  vat: number;
  group: string;
}