const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface MicrostructureInput {
  id: string;
  porosity: number;
  tortuosity: number;
  conductivity_S_per_m: number;
  temperature_K: number;
  rmin: number; // Minimum radius of pores
  rmax: number; // Maximum radius of pores
  L_channel: number; // Channel height
  H_channel: number; // Channel width
  H_Electrolyte: number; // Electrolyte thickness
  H_GDE: number; // GDE thickness
}

export interface SofcInput {
  volume_fraction: number;
  rmin: number;
  rmax: number;
  use_real?: boolean;
  // Geometric parameters
  L_channel?: number;
  H_channel?: number;
  W_channel?: number;
  W_rib?: number;
  H_Electrolyte?: number;
  H_GDE?: number;
  // Material properties
  Sigma_cathode?: number;
  Sigma_anode?: number;
  VF_cathode?: number;
  VF_anode?: number;
  Prs_GDE?: number;
  Prd_anode?: number;
  Prd_cathode?: number;
  Tmp_GDE?: number;
  Per_anode?: number;
  Per_cathode?: number;
  Thc_anode?: number;
  Thc_cathode?: number;
  Tor_anode?: number;
  Tor_cathode?: number;
  Spa_anode?: number;
  Spa_cathode?: number;
}

export interface KPI {
  propID: number | string;
  unit: string;
  value: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function healthCheck(): Promise<ApiResponse<{ status: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function ingestMicrostructure(data: MicrostructureInput): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingest/microstructure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to ingest microstructure');
    }

    const result = await response.json();
    return { data: result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function runSofcWorkflow(data: SofcInput): Promise<ApiResponse<{ kpis: KPI[]; run: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/workflows/sofc/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to run SOFC workflow');
    }

    const result = await response.json();
    return { data: result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function loadRDF(data: string, format: string = 'turtle'): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/rdf/load`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, format }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to load RDF');
    }

    const result = await response.json();
    return { data: result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fusekiPing(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/fuseki/ping`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Authentication functions
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  institute_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  institute_id: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  institute_id: number;
}

export async function loginUser(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function registerUser(userData: RegisterData): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCurrentUser(token: string): Promise<ApiResponse<UserResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Workflow run lookup
export interface WorkflowRunTriple {
  p: string;
  o: string;
  oType?: string;
  datatype?: string;
  lang?: string;
}

export interface WorkflowRunResponse {
  run: string;
  kpi?: number | string;
  unit?: string;
  triples: WorkflowRunTriple[];
}

export async function getWorkflowRun(run: string): Promise<ApiResponse<WorkflowRunResponse>> {
  try {
    const url = `${API_BASE_URL}/workflow-run?run=${encodeURIComponent(run)}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch workflow run');
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
