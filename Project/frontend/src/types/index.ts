export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_diagnoses?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

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

export interface IPMRecommendations {
  monitoring: string;
  cultural_mechanical: string;
  biological: string;
  chemical: string;
}

export interface PestManagementDetails {
  class_id: number;
  pest_name: string;
  common_name: string;
  scientific_name?: string | null;
  group: string;
  instance_count: number;
  crops_affected: string[];
  description: string;
  symptoms: string;
  life_cycle?: string | null;
  ipm_recommendations: IPMRecommendations;
  prevention_monitoring: string;
  when_to_consult_expert: string;
  source: string;
  last_reviewed: string;
  disclaimer: string;
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
  pest_management?: PestManagementDetails[];
  annotated_image: string;
  notes: string;
  execution_time_ms: number;
  storage_mode: 'mongodb' | 'local_dev';
}

export interface PestItem {
  class_id: number;
  dataset_name: string;
  common_name: string;
  scientific_name?: string | null;
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
  user_id?: string | null;
  user_email?: string | null;
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

export interface ChatSource {
  title: string;
  authority: string;
  relevance: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
  suggestedQuestions?: string[];
  disclaimer?: string;
  isError?: boolean;
}

export interface ChatRequestPayload {
  message: string;
  language: string;
  diagnosis_id?: string;
  pest_name?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatResponsePayload {
  reply: string;
  sources: ChatSource[];
  suggested_questions: string[];
  disclaimer: string;
  language: string;
  diagnosis_context_used: boolean;
  model_used: string;
  execution_time_ms: number;
}

export interface AssistantStatus {
  assistant_name: string;
  display_name: string;
  engine: string;
  model: string;
  languages_supported: string[];
  knowledge_base: string;
  has_live_llm: boolean;
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
