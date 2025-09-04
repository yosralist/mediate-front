'use client';

import { useState } from 'react';
import { runSofcWorkflow, SofcInput, KPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import SofcWizard from '../components/SofcWizard';

export default function SofcPage() {
  const [formData, setFormData] = useState<SofcInput>({
    // Microstructure inputs
    volume_fraction: 0.003,
    rmin: 4.0,
    rmax: 4.0,
    use_real: false,
    // Geometry (defaults aligned with sofcMainv1.py)
    L_channel: 0.01,
    H_channel: 0.0005,
    W_channel: 0.0005,
    W_rib: 0.0005,
    H_Electrolyte: 0.0001,
    H_GDE: 0.0001,
    // Material properties (defaults aligned with sofcMainv1.py)
    Sigma_cathode: 1000,
    Sigma_anode: 1000,
    VF_cathode: 0.4,
    VF_anode: 0.4,
    Prs_GDE: 0.9,
    Prd_anode: 1.0,
    Prd_cathode: 4.5,
    Tmp_GDE: 800,
    Per_anode: 100,
    Per_cathode: 100,
    Thc_anode: 0.5,
    Thc_cathode: 0.5,
    Tor_anode: 4.5,
    Tor_cathode: 4.5,
    Spa_anode: 1.0,
    Spa_cathode: 1.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kpis: KPI[]; run: string } | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await runSofcWorkflow(formData);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);

        // Update dashboard statistics after successful simulation
        if (typeof window !== 'undefined' && (window as any).updateDashboardStats) {
          (window as any).updateDashboardStats({
            simulationCount: 1, // Increment by 1
            lastActivity: `SOFC simulation completed - Run ID: ${response.data.run}`
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      if (type === 'checkbox') {
        return { ...prev, [name]: checked } as SofcInput;
      }
      const parsed = value === '' ? NaN : parseFloat(value);
      return {
        ...prev,
        [name]: Number.isNaN(parsed) ? 0 : parsed
      } as SofcInput;
    });
  };

  return (
    <ProtectedRoute>
      <SofcWizard />
    </ProtectedRoute>
  );

  // Legacy single-step form preserved below for reference:
  return (
    <ProtectedRoute>
      <div className="form-container" aria-busy={loading}>
        <h1 className="form-title">SOFC Workflow Runner</h1>
        <p className="form-label" style={{ marginBottom: '1rem' }}>
          Run the SOFC workflow with custom parameters. Results will be stored in Fuseki.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          {/* Section: Microstructure Inputs */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Microstructure Inputs</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="volume_fraction">Volume Fraction</label>
            <input
              className="form-input"
              type="number"
              id="volume_fraction"
              name="volume_fraction"
              value={formData.volume_fraction}
              onChange={handleInputChange}
              min="0"
              step="0.001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rmin">Minimum Radius (mm)</label>
            <input
              className="form-input"
              type="number"
              id="rmin"
              name="rmin"
              value={formData.rmin}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rmax">Maximum Radius (mm)</label>
            <input
              className="form-input"
              type="number"
              id="rmax"
              name="rmax"
              value={formData.rmax}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="use_real">Use Real Microstructure</label>
            <input
              className="form-input"
              type="checkbox"
              id="use_real"
              name="use_real"
              checked={!!formData.use_real}
              onChange={handleInputChange}
            />
          </div>

          {/* Section: Geometry */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Geometry</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="L_channel">Flow Channel Length (m)</label>
            <input
              className="form-input"
              type="number"
              id="L_channel"
              name="L_channel"
              value={formData.L_channel ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="H_channel">Gas Flow Channel Height (m)</label>
            <input
              className="form-input"
              type="number"
              id="H_channel"
              name="H_channel"
              value={formData.H_channel ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="W_channel">Gas Flow Channel Width (m)</label>
            <input
              className="form-input"
              type="number"
              id="W_channel"
              name="W_channel"
              value={formData.W_channel ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="W_rib">Rib Width (m)</label>
            <input
              className="form-input"
              type="number"
              id="W_rib"
              name="W_rib"
              value={formData.W_rib ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="H_Electrolyte">Electrolyte Thickness (m)</label>
            <input
              className="form-input"
              type="number"
              id="H_Electrolyte"
              name="H_Electrolyte"
              value={formData.H_Electrolyte ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="H_GDE">Gas Diffusion Electrode Thickness (m)</label>
            <input
              className="form-input"
              type="number"
              id="H_GDE"
              name="H_GDE"
              value={formData.H_GDE ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.0001"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Material Properties */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Material Properties</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Sigma_cathode">Solid Effective Conductivity, Cathode (S/m)</label>
            <input
              className="form-input"
              type="number"
              id="Sigma_cathode"
              name="Sigma_cathode"
              value={formData.Sigma_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Sigma_anode">Solid Effective Conductivity, Anode (S/m)</label>
            <input
              className="form-input"
              type="number"
              id="Sigma_anode"
              name="Sigma_anode"
              value={formData.Sigma_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="VF_cathode">Electrode Porosity, Cathode (1)</label>
            <input
              className="form-input"
              type="number"
              id="VF_cathode"
              name="VF_cathode"
              value={formData.VF_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              max="1"
              step="0.01"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="VF_anode">Electrode Porosity, Anode (1)</label>
            <input
              className="form-input"
              type="number"
              id="VF_anode"
              name="VF_anode"
              value={formData.VF_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              max="1"
              step="0.01"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Operating Conditions */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Operating Conditions</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Prs_GDE">GDP Pressure (atm)</label>
            <input
              className="form-input"
              type="number"
              id="Prs_GDE"
              name="Prs_GDE"
              value={formData.Prs_GDE ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Prd_anode">Pressure, Anode (Pa)</label>
            <input
              className="form-input"
              type="number"
              id="Prd_anode"
              name="Prd_anode"
              value={formData.Prd_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Prd_cathode">Pressure, Cathode (Pa)</label>
            <input
              className="form-input"
              type="number"
              id="Prd_cathode"
              name="Prd_cathode"
              value={formData.Prd_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Tmp_GDE">GDE Temperature (K)</label>
            <input
              className="form-input"
              type="number"
              id="Tmp_GDE"
              name="Tmp_GDE"
              value={formData.Tmp_GDE ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Permeability */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Permeability</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Per_anode">Permeability, Anode (um^2)</label>
            <input
              className="form-input"
              type="number"
              id="Per_anode"
              name="Per_anode"
              value={formData.Per_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Per_cathode">Permeability, Cathode (um^2)</label>
            <input
              className="form-input"
              type="number"
              id="Per_cathode"
              name="Per_cathode"
              value={formData.Per_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Thermal Conductivity */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Thermal Conductivity</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Thc_anode">Heat Conductivity, Anode (W/m/K)</label>
            <input
              className="form-input"
              type="number"
              id="Thc_anode"
              name="Thc_anode"
              value={formData.Thc_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Thc_cathode">Heat Conductivity, Cathode (W/m/K)</label>
            <input
              className="form-input"
              type="number"
              id="Thc_cathode"
              name="Thc_cathode"
              value={formData.Thc_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Tortuosity */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tortuosity</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Tor_anode">Tortuosity, Anode (1)</label>
            <input
              className="form-input"
              type="number"
              id="Tor_anode"
              name="Tor_anode"
              value={formData.Tor_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Tor_cathode">Tortuosity, Cathode (1)</label>
            <input
              className="form-input"
              type="number"
              id="Tor_cathode"
              name="Tor_cathode"
              value={formData.Tor_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          {/* Section: Specific Surface Area */}
          <h2 className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Specific Surface Area</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="Spa_anode">Specific Surface Area, Anode (1/nm)</label>
            <input
              className="form-input"
              type="number"
              id="Spa_anode"
              name="Spa_anode"
              value={formData.Spa_anode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Spa_cathode">Specific Surface Area, Cathode (1/nm)</label>
            <input
              className="form-input"
              type="number"
              id="Spa_cathode"
              name="Spa_cathode"
              value={formData.Spa_cathode ?? 0}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              aria-required="true"
              inputMode="decimal"
            />
          </div>

          <button
            type="submit"
            className="form-button"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" aria-hidden="true" /> Running Workflow...
              </>
            ) : (
              'Run SOFC Workflow'
            )}
          </button>
        </form>

        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success" role="status" aria-live="polite">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Workflow Completed Successfully!
            </h3>
            <p><strong>Run ID:</strong> {result?.run}</p>

            <h4 className="form-label" style={{ marginTop: '0.75rem' }}>Key Performance Indicators (KPIs):</h4>
            {result?.kpis?.map((kpi, index) => (
              <div key={index} style={{
                margin: '0.5rem 0',
                padding: '0.5rem',
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: '4px'
              }}>
                <strong>Property ID:</strong> {kpi.propID}<br />
                <strong>Value:</strong> {kpi.value}<br />
                <strong>Unit:</strong> {kpi.unit}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
