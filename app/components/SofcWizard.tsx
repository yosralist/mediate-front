'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Stepper from './Stepper';
import { runSofcWorkflow, SofcInput, KPI } from '../services/api';

type Errors = Partial<Record<keyof SofcInput, string>>;

const steps = ['Microstructure', 'Geometry', 'Materials', 'Operating/Porous', 'Review'];

export default function SofcWizard() {
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ kpis: KPI[]; run: string } | null>(null);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<SofcInput>({
        volume_fraction: 0.003,
        rmin: 4.0,
        rmax: 4.0,
        use_real: false,
        // Geometric parameters
        L_channel: 0.01,
        H_channel: 0.0005,
        W_channel: 0.0005,
        W_rib: 0.0005,
        H_Electrolyte: 0.0001,
        H_GDE: 0.0001,
        // Material properties
        Sigma_cathode: 1000,
        Sigma_anode: 1000,
        VF_cathode: 0.4,
        VF_anode: 0.4,
        // Operating and porous media
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
        Spa_cathode: 1.0,
    });

    const [touched, setTouched] = useState<Partial<Record<keyof SofcInput, boolean>>>({});

    const setField = (name: keyof SofcInput, value: string | boolean) => {
        let parsed: any = value;
        if (typeof value === 'string') {
            parsed = value === '' ? ('' as any) : parseFloat(value);
            if (Number.isNaN(parsed)) parsed = 0;
        }
        setFormData(prev => ({ ...prev, [name]: parsed as any }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const errors: Errors = useMemo(() => {
        const e: Errors = {};
        if (!(formData.volume_fraction >= 0 && formData.volume_fraction <= 1)) e.volume_fraction = 'Value must be between 0 and 1';
        if (!(formData.rmin >= 0)) e.rmin = 'Non-negative number required';
        if (!(formData.rmax >= 0)) e.rmax = 'Non-negative number required';
        if ((formData.rmax ?? 0) < (formData.rmin ?? 0)) e.rmax = 'rmax must be >= rmin';

        if (!(formData.L_channel! >= 0)) e.L_channel = 'Non-negative number required';
        if (!(formData.H_channel! >= 0)) e.H_channel = 'Non-negative number required';
        if (!(formData.W_channel! >= 0)) e.W_channel = 'Non-negative number required';
        if (!(formData.W_rib! >= 0)) e.W_rib = 'Non-negative number required';
        if (!(formData.H_Electrolyte! >= 0)) e.H_Electrolyte = 'Non-negative number required';
        if (!(formData.H_GDE! >= 0)) e.H_GDE = 'Non-negative number required';

        if (!(formData.Sigma_cathode! >= 0)) e.Sigma_cathode = 'Non-negative number required';
        if (!(formData.Sigma_anode! >= 0)) e.Sigma_anode = 'Non-negative number required';
        if (!(formData.VF_cathode! >= 0 && formData.VF_cathode! <= 1)) e.VF_cathode = '0-1';
        if (!(formData.VF_anode! >= 0 && formData.VF_anode! <= 1)) e.VF_anode = '0-1';

        if (!(formData.Prs_GDE! >= 0)) e.Prs_GDE = 'Non-negative number required';
        if (!(formData.Prd_anode! >= 0)) e.Prd_anode = 'Non-negative number required';
        if (!(formData.Prd_cathode! >= 0)) e.Prd_cathode = 'Non-negative number required';
        if (!(formData.Tmp_GDE! > 0)) e.Tmp_GDE = 'Positive number required';
        if (!(formData.Per_anode! >= 0)) e.Per_anode = 'Non-negative number required';
        if (!(formData.Per_cathode! >= 0)) e.Per_cathode = 'Non-negative number required';
        if (!(formData.Thc_anode! >= 0)) e.Thc_anode = 'Non-negative number required';
        if (!(formData.Thc_cathode! >= 0)) e.Thc_cathode = 'Non-negative number required';
        if (!(formData.Tor_anode! >= 0)) e.Tor_anode = 'Non-negative number required';
        if (!(formData.Tor_cathode! >= 0)) e.Tor_cathode = 'Non-negative number required';
        if (!(formData.Spa_anode! >= 0)) e.Spa_anode = 'Non-negative number required';
        if (!(formData.Spa_cathode! >= 0)) e.Spa_cathode = 'Non-negative number required';

        return e;
    }, [formData]);

    const stepValid = useMemo(() => {
        switch (current) {
            case 0:
                return !errors.volume_fraction && !errors.rmin && !errors.rmax;
            case 1:
                return !errors.L_channel && !errors.H_channel && !errors.W_channel && !errors.W_rib && !errors.H_Electrolyte && !errors.H_GDE;
            case 2:
                return !errors.Sigma_cathode && !errors.Sigma_anode && !errors.VF_cathode && !errors.VF_anode;
            case 3:
                return !errors.Prs_GDE && !errors.Prd_anode && !errors.Prd_cathode && !errors.Tmp_GDE
                    && !errors.Per_anode && !errors.Per_cathode && !errors.Thc_anode && !errors.Thc_cathode
                    && !errors.Tor_anode && !errors.Tor_cathode && !errors.Spa_anode && !errors.Spa_cathode;
            case 4:
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
            const response = await runSofcWorkflow(formData);
            if (response.error) {
                setError(response.error);
            } else if (response.data) {
                setResult(response.data);
                if (typeof window !== 'undefined' && (window as any).updateDashboardStats) {
                    (window as any).updateDashboardStats({
                        simulationCount: 1,
                        lastActivity: `SOFC simulation completed - Run ID: ${response.data.run}`,
                    });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const NumField = ({
        name,
        label,
        step,
        min,
    }: {
        name: keyof SofcInput;
        label: string;
        step?: string;
        min?: string;
    }) => {
        const val = (formData[name] as any) ?? '';
        const err = touched[name] ? errors[name] : undefined;
        return (
            <div className="form-group">
                <label htmlFor={name} className="form-label">{label}</label>
                <input
                    id={name}
                    name={name}
                    type="number"
                    value={val}
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

    const CheckboxField = ({
        name,
        label,
    }: {
        name: keyof SofcInput;
        label: string;
    }) => {
        const val = Boolean(formData[name] as any);
        return (
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setField(name, e.target.checked)}
                    className="form-input"
                    style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <label htmlFor={name} className="form-label">{label}</label>
            </div>
        );
    };

    const StepMicro = () => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <NumField name="volume_fraction" label="Volume Fraction (0-1)" step="0.001" min="0" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <NumField name="rmin" label="Minimum Radius" step="0.1" min="0" />
                <NumField name="rmax" label="Maximum Radius" step="0.1" min="0" />
            </div>
            <CheckboxField name="use_real" label="Use real adapters (requires infrastructure)" />
        </div>
    );

    const StepGeom = () => (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <NumField name="L_channel" label="Channel Length L (m)" step="0.0001" min="0" />
            <NumField name="H_channel" label="Channel Height H (m)" step="0.0001" min="0" />
            <NumField name="W_channel" label="Channel Width W (m)" step="0.0001" min="0" />
            <NumField name="W_rib" label="Rib Width (m)" step="0.0001" min="0" />
            <NumField name="H_Electrolyte" label="Electrolyte Thickness (m)" step="0.0001" min="0" />
            <NumField name="H_GDE" label="GDE Thickness (m)" step="0.0001" min="0" />
        </div>
    );

    const StepMaterials = () => (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <NumField name="Sigma_cathode" label="Sigma Cathode (S/m)" step="0.1" min="0" />
            <NumField name="Sigma_anode" label="Sigma Anode (S/m)" step="0.1" min="0" />
            <NumField name="VF_cathode" label="VF Cathode (0-1)" step="0.01" min="0" />
            <NumField name="VF_anode" label="VF Anode (0-1)" step="0.01" min="0" />
        </div>
    );

    const StepOperating = () => (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <NumField name="Prs_GDE" label="Pressure GDE (atm/Pa)" step="0.01" min="0" />
            <NumField name="Prd_anode" label="Pressure Anode (Pa)" step="0.01" min="0" />
            <NumField name="Prd_cathode" label="Pressure Cathode (Pa)" step="0.01" min="0" />
            <NumField name="Tmp_GDE" label="Temperature GDE (K)" step="0.1" min="0" />
            <NumField name="Per_anode" label="Permeability Anode (um^2)" step="0.1" min="0" />
            <NumField name="Per_cathode" label="Permeability Cathode (um^2)" step="0.1" min="0" />
            <NumField name="Thc_anode" label="Heat Conductivity Anode (W/m/K)" step="0.01" min="0" />
            <NumField name="Thc_cathode" label="Heat Conductivity Cathode (W/m/K)" step="0.01" min="0" />
            <NumField name="Tor_anode" label="Tortuosity Anode (1)" step="0.1" min="0" />
            <NumField name="Tor_cathode" label="Tortuosity Cathode (1)" step="0.1" min="0" />
            <NumField name="Spa_anode" label="Specific Surface Anode (1/nm)" step="0.01" min="0" />
            <NumField name="Spa_cathode" label="Specific Surface Cathode (1/nm)" step="0.01" min="0" />
        </div>
    );

    const StepReview = () => (
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
        <div className="form-container" style={{ maxWidth: 900 }}>
            <h1 className="form-title">SOFC Workflow Runner</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
                Configure parameters across steps. Results will be stored in Fuseki.
            </p>

            <Stepper steps={steps} currentStep={current} />

            <form className="form" onSubmit={onSubmit}>
                {current === 0 && <StepMicro />}
                {current === 1 && <StepGeom />}
                {current === 2 && <StepMaterials />}
                {current === 3 && <StepOperating />}
                {current === 4 && <StepReview />}

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
                            aria-label="Run SOFC Workflow"
                        >
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="loading-spinner" /> Running...
                                </span>
                            ) : 'Run SOFC Workflow'}
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
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Workflow Completed Successfully!</h3>
                    <p><strong>Run ID:</strong> {result.run}</p>
                    {/* Build a friendly link to the new workflow run page.
                       If the run URI already matches http(s)://host/workflow-run/run-uuid -> /workflow-run/run-uuid
                       Otherwise, pass the full URI as a query param (?uri=...) to /workflow-run/lookup */}
                    {(() => {
                        if (!result?.run) return null;
                        const m = String(result.run).match(/^https?:\/\/[^/]+\/workflow-run\/(run-[a-f0-9-]+)/i);
                        const href = m ? `/workflow-run/${m[1]}` : `/workflow-run/lookup?uri=${encodeURIComponent(String(result.run))}`;
                        return (
                            <p style={{ marginTop: '0.5rem' }}>
                                <Link href={href} style={{ textDecoration: 'underline', color: 'var(--primary-color)' }}>
                                    View Run
                                </Link>
                            </p>
                        );
                    })()}
                    <h4 style={{ marginTop: '0.5rem' }}>Key Performance Indicators (KPIs):</h4>
                    {result.kpis?.map((kpi, index) => (
                        <div key={index} style={{
                            margin: '0.5rem 0',
                            padding: '0.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                        }}>
                            <strong>Property ID:</strong> {kpi.propID}<br />
                            <strong>Value:</strong> {kpi.value}<br />
                            <strong>Unit:</strong> {kpi.unit}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
