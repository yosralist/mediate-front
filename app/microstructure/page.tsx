'use client';

import { useState } from 'react';
import { ingestMicrostructure, MicrostructureInput } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import MicrostructureWizard from '../components/MicrostructureWizard';

export default function MicrostructurePage() {
    const [formData, setFormData] = useState<MicrostructureInput>({
        id: 'ms-001',
        porosity: 0.3,
        tortuosity: 2.5,
        conductivity_S_per_m: 100,
        temperature_K: 298.15,
        rmin: 0,
        rmax: 0,
        L_channel: 0.01,
        H_channel: 0.0005,
        H_Electrolyte: 0.0001,
        H_GDE: 0.0001
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await ingestMicrostructure(formData);
            if (response.error) {
                setError(response.error);
            } else {
                setResult(response.data);

                // Update dashboard statistics after successful microstructure ingestion
                if (typeof window !== 'undefined' && (window as any).updateDashboardStats) {
                    (window as any).updateDashboardStats({
                        projectCount: 1, // Increment by 1
                        lastActivity: `Microstructure data ingested - ID: ${formData.id}`
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
        const { name, value } = e.target;

        setFormData(prev => {
            if (name === 'id') {
                return { ...prev, id: value };
            }
            // Parse number; allow empty to become NaN then fallback to 0
            const parsed = value === '' ? NaN : parseFloat(value);
            return {
                ...prev,
                [name]: Number.isNaN(parsed) ? 0 : parsed
            } as MicrostructureInput;
        });
    };

    return (
        <ProtectedRoute>
            <MicrostructureWizard />
        </ProtectedRoute>
    );

    // Legacy single-step form preserved below for reference:
    return (
        <ProtectedRoute>
            <div className="form-container" aria-busy={loading}>
                <h1 className="form-title">Microstructure Data Ingestion</h1>

                <form onSubmit={handleSubmit} className="form" noValidate>
                    {/* ID */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="id">ID</label>
                        <input
                            className="form-input"
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            required
                            aria-required="true"
                        />
                    </div>

                    {/* Porosity */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="porosity">Porosity (0-1)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="porosity"
                            name="porosity"
                            value={formData.porosity}
                            onChange={handleInputChange}
                            min="0"
                            max="1"
                            step="0.01"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* Tortuosity */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="tortuosity">Tortuosity</label>
                        <input
                            className="form-input"
                            type="number"
                            id="tortuosity"
                            name="tortuosity"
                            value={formData.tortuosity}
                            onChange={handleInputChange}
                            min="0.1"
                            step="0.1"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* Conductivity */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="conductivity_S_per_m">Conductivity (S/m)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="conductivity_S_per_m"
                            name="conductivity_S_per_m"
                            value={formData.conductivity_S_per_m}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* Temperature */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="temperature_K">Temperature (K)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="temperature_K"
                            name="temperature_K"
                            value={formData.temperature_K}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* rmin */}
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

                    {/* rmax */}
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

                    {/* L_channel */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="L_channel">Channel Length (m)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="L_channel"
                            name="L_channel"
                            value={formData.L_channel}
                            onChange={handleInputChange}
                            min="0"
                            step="0.0001"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* H_channel */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="H_channel">Channel Height (m)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="H_channel"
                            name="H_channel"
                            value={formData.H_channel}
                            onChange={handleInputChange}
                            min="0"
                            step="0.0001"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* H_Electrolyte */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="H_Electrolyte">Electrolyte Thickness (m)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="H_Electrolyte"
                            name="H_Electrolyte"
                            value={formData.H_Electrolyte}
                            onChange={handleInputChange}
                            min="0"
                            step="0.0001"
                            required
                            aria-required="true"
                            inputMode="decimal"
                        />
                    </div>

                    {/* H_GDE */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="H_GDE">GDE Thickness (m)</label>
                        <input
                            className="form-input"
                            type="number"
                            id="H_GDE"
                            name="H_GDE"
                            value={formData.H_GDE}
                            onChange={handleInputChange}
                            min="0"
                            step="0.0001"
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
                                <span className="loading-spinner" aria-hidden="true" /> Processing...
                            </>
                        ) : (
                            'Ingest Microstructure'
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
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Success!</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
