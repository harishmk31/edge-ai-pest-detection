export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export interface DetectionItem {
  class_id: number;
  pest_name: string;
  common_name: string;
  group: string;
  confidence: number;
  confidence_level: ConfidenceLevel;
  bbox: [number, number, number, number];
  area_ratio: number;
  symptoms: string;
  relevance: string;
  verified: boolean;
}

export interface DiagnosisResponse {
  diagnosis_id: string;
  timestamp: string;
  status: 'detected' | 'no_pest_detected' | 'warning';
  total_detections: number;
  top_pest?: string | null;
  top_confidence?: number | null;
  confidence_level?: ConfidenceLevel | null;
  detections: DetectionItem[];
  annotated_image: string;
  notes: string;
  execution_time_ms: number;
  storage_mode: 'mongodb' | 'local_dev';
}

export interface PestItem {
  class_id: number;
  dataset_name: string;
  common_name: string;
  group: string;
  description: string;
  symptoms: string;
  relevance: string;
  verified: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  filename: string;
  status: string;
  total_detections: number;
  top_pest?: string | null;
  top_confidence?: number | null;
  confidence_level?: string | null;
  detections_summary: string[];
  thumbnail_url?: string;
  notes?: string;
}

export interface HistoryResponse {
  total: number;
  storage_mode: string;
  is_database_connected: boolean;
  items: HistoryItem[];
}

export interface ModelInfo {
  model_name: string;
  model_path: string;
  task: string;
  num_classes: number;
  classes: string[];
  device: string;
  default_confidence_threshold: number;
  status: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  model: {
    loaded: boolean;
    device: string;
    classes_count: number;
  };
  database: {
    connected: boolean;
    storage_mode: string;
    message: string;
  };
}
