import type { 
  DiagnosisResponse, 
  HealthStatus, 
  HistoryResponse, 
  ModelInfo, 
  PestItem,
  ChatRequestPayload,
  ChatResponsePayload,
  AssistantStatus,
} from '../types';
import { getAuthHeaders } from './auth';

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch('/health');
  if (!res.ok) {
    throw new Error(`Failed to check health: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) {
    throw new Error(`Failed to fetch model info: ${res.statusText}`);
  }
  return res.json();
}

export async function diagnoseImage(
  file: File,
  confidence: number = 0.35,
  iou: number = 0.45,
): Promise<DiagnosisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', confidence.toString());
  formData.append('iou', iou.toString());

  const headers = getAuthHeaders(); // Automatically attaches Bearer token if logged in

  const res = await fetch(`${API_BASE}/diagnose`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Inference failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function fetchPests(search?: string): Promise<{ total: number; items: PestItem[] }> {
  const url = search ? `${API_BASE}/pests?search=${encodeURIComponent(search)}` : `${API_BASE}/pests`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch pests: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPestById(id: number): Promise<PestItem> {
  const res = await fetch(`${API_BASE}/pests/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pest ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchHistory(limit: number = 50): Promise<HistoryResponse> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/history?limit=${limit}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMyHistory(limit: number = 50): Promise<HistoryResponse> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/history/my?limit=${limit}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch personal history: ${res.statusText}`);
  }
  return res.json();
}

export async function chatWithKural(
  payload: ChatRequestPayload,
  signal?: AbortSignal,
): Promise<ChatResponsePayload> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    let errorDetail = 'Failed to communicate with Kural assistant';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function fetchAssistantStatus(): Promise<AssistantStatus> {
  const res = await fetch(`${API_BASE}/assistant/status`);
  if (!res.ok) {
    throw new Error(`Failed to check assistant status: ${res.statusText}`);
  }
  return res.json();
}
