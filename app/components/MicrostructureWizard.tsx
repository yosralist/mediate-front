'use client';

import React, { useMemo, useState } from 'react';
import Stepper from './Stepper';
import { ingestMicrostructure, MicrostructureInput } from '../services/api';

type Errors = Partial<Record<keyof MicrostructureInput, string>>;

const steps = ['Core', 'Pore geometry', 'Cell geometry', 'Review'];

export default function MicrostructureWizard() {
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

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
        H_GDE: 0.0001,
    });

    const [touched, setTouched] = useState<Partial<Record<keyof MicrostructureInput, boolean>>>({});

    const setField = (name: keyof MicrostructureInput, value: string) => {
        const parsed = name === 'id' ? value : (value === '' ? ('' as any) : parseFloat(value));
        setFormData(prev => ({ ...prev, [name]: parsed as any }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const errors: Errors = useMemo(() => {
        const e: Errors = {};
        if (!formData.id?.trim()) e.id = 'ID is required';
        if (!(formData.porosity >= 0 && formData.porosity <= 1)) e.porosity = 'Porosity must be between 0 and 1';
        if (!(formData.tortuosity > 0)) e.tortuosity = 'Tortuosity must be greater than 0';
        if (!(formData.conductivity_S_per_m >= 0)) e.conductivity_S_per_m = 'Non-negative number required';
        if (!(formData.temperature_K > 0)) e.temperature_K = 'Temperature must be greater than 0';
        if (!(formData.rmin >= 0)) e.rmin = 'Non-negative number required';
        if (!(formData.rmax >= 0)) e.rmax = 'Non-negative number required';
        if (formData.rmax < formData.rmin) e.rmax = 'rmax must be >= rmin';
        if (!(formData.L_channel >= 0)) e.L_channel = 'Non-negative number required';
        if (!(formData.H_channel >= 0)) e.H_channel = 'Non-negative number required';
        if (!(formData.H_Electrolyte >= 0)) e.H_Electrolyte = 'Non-negative number required';
        if (!(formData.H_GDE >= 0)) e.H_GDE = 'Non-negative number required';
        return e;
    }, [formData]);

    const stepValid = useMemo(() => {
        switch (current) {
            case 0:
                return !errors.id && !errors.porosity && !errors.tortuosity && !errors.conductivity_S_per_m && !errors.temperature_K;
            case 1:
                return !errors.rmin && !errors.rmax;
            case 2:
                return !errors.L_channel && !errors.H_channel && !errors.H_Electrolyte && !errors.H_GDE;
            case 3:
                return Object.keys(errors).length === 0;
            default:
                return false;
        }
    }, [current, errors]);

    const onSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!stepValid) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Keep backend payload same as before (endpoint accepts defined fields; extra ignored by backend)
            const response = await ingestMicrostructure(formData);
            if (response.error) {
                setError(response.error);
            } else {
                setResult(response.data);
                if (typeof window !== 'undefined' && (window as any).updateDashboardStats) {
                    (window as any).updateDashboardStats({
                        projectCount: 1,
                        lastActivity: `Microstructure data ingested - ID: ${formData.id}`,
                    });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const Field = ({
        name,
        label,
        type = 'number',
        step,
        min,
    }: {
        name: keyof MicrostructureInput;
        label: string;
        type?: 'text' | 'number';
        step?: string;
        min?: string;
    }) => {
        const val = formData[name] as any;
        const err = touched[name] ? errors[name] : undefined;
        return (
            <div className="form-group">
                <label htmlFor={name} className="form-label">{label}</label>
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={type === 'text' ? (val ?? '') : (val ?? '')}
                    onChange={(e) => setField(name, e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, [name]: true }))}
                    className={`form-input ${err ? 'error' : ''}`}
                    aria-invalid={!!err}
                    aria-describedby={err ? `${name}-error` : undefined}
                    step={step}
                    min={min}
                />
                {err && <div id={`${name}-error`} className="form-error">{err}</div>}
            </div>
        );
    };

    const CoreStep = () => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <Field name="id" label="ID" type="text" />
            <Field name="porosity" label="Porosity (0-1)" step="0.01" min="0" />
            <Field name="tortuosity" label="Tortuosity" step="0.1" min="0.1" />
            <Field name="conductivity_S_per_m" label="Conductivity (S/m)" step="0.1" min="0" />
            <Field name="temperature_K" label="Temperature (K)" step="0.1" min="0" />
        </div>
    );

    const PoreStep = () => (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Field name="rmin" label="Minimum Radius (mm)" step="0.1" min="0" />
            <Field name="rmax" label="Maximum Radius (mm)" step="0.1" min="0" />
        </div>
    );

    const CellGeomStep = () => (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Field name="L_channel" label="Channel Length L (m)" step="0.0001" min="0" />
            <Field name="H_channel" label="Channel Height H (m)" step="0.0001" min="0" />
            <Field name="H_Electrolyte" label="Electrolyte Thickness (m)" step="0.0001" min="0" />
            <Field name="H_GDE" label="GDE Thickness (m)" step="0.0001" min="0" />
        </div>
    );

    const ReviewStep = () => (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Review your inputs before submitting:</div>
            <pre style={{
                background: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                whiteSpace: 'pre-wrap',
            }}>
                {JSON.stringify(formData, null, 2)}
            </pre>
        </div>
    );

    return (
        <div className="form-container" style={{ maxWidth: 700 }}>
            <h1 className="form-title">Microstructure Data Ingestion</h1>

            <Stepper steps={steps} currentStep={current} />

            <form className="form" onSubmit={onSubmit}>
                {current === 0 && <CoreStep />}
                {current === 1 && <PoreStep />}
                {current === 2 && <CellGeomStep />}
                {current === 3 && <ReviewStep />}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                    <button
                        type="button"
                        className="form-button"
                        onClick={() => setCurrent(s => Math.max(0, s - 1))}
                        disabled={current === 0 || loading}
                        aria-label="Previous step"
                    >
                        Back
                    </button>
                    {current < steps.length - 1 ? (
                        <button
                            type="button"
                            className="form-button"
                            onClick={() => setCurrent(s => Math.min(steps.length - 1, s + 1))}
                            disabled={!stepValid || loading}
                            aria-label="Next step"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="form-button"
                            disabled={!stepValid || loading}
                            aria-label="Submit microstructure"
                        >
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="loading-spinner" /> Processing...
                                </span>
                            ) : 'Ingest Microstructure'}
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <div className="alert alert-error" role="alert" style={{ marginTop: '1rem' }}>
                    {error}
                </div>
            )}

            {result && (
                <div className="alert alert-success" role="status" style={{ marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Success!</h3>
                    <pre style={{
                        background: 'transparent',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
