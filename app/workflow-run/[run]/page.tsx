'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ApiResponse } from '../../services/api';
import { getWorkflowRun, WorkflowRunResponse, WorkflowRunTriple } from '../../services/api';

// Friendly formatting helpers for RDF triples
const PREFIXES: Record<string, string> = {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    emmo: 'http://emmo.info/emmo#',
    mediate: 'http://example.org/mediate#',
};

function compactIri(iri?: string): string {
    if (!iri) return '';
    for (const [pref, ns] of Object.entries(PREFIXES)) {
        if (iri.startsWith(ns)) return `${pref}:${iri.slice(ns.length)}`;
    }
    return iri;
}

function isHttpIri(val?: string): boolean {
    return !!val && /^https?:\/\//i.test(val);
}

function formatNumber(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const n = Number(str);
    if (Number.isFinite(n)) {
        // 6 significant digits, trim trailing zeros
        const s = n.toPrecision(6);
        return String(Number(s));
    }
    return str;
}

function prettyUnit(unit?: string | null): string {
    if (!unit) return '';
    // Avoid String.prototype.replaceAll for wider TS/ES compatibility
    return unit.split('**2').join('²').split('**3').join('³');
}

function renderObject(o?: string, datatype?: string): React.ReactNode {
    if (!o) return '';
    if (isHttpIri(o)) {
        return <a href={o} target="_blank" rel="noreferrer">{compactIri(o)}</a>;
    }
    const dt = datatype || '';
    if (/#(double|decimal|float|integer|int|long|short)$/.test(dt)) {
        return formatNumber(o);
    }
    // Fallback: return possibly prettified unit/literal
    return prettyUnit(o);
}

export default function WorkflowRunPage({ params }: { params: { run: string } }) {
    const searchParams = useSearchParams();
    const initialRunParam = useMemo(() => {
        // Accept either:
        // - path param as an ID (run-uuid)
        // - or search param ?uri=<full-encoded-URI> for historical runs minted with another base
        return searchParams.get('uri') || params.run;
    }, [params.run, searchParams]);

    const [lookup, setLookup] = useState<string>(initialRunParam);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [data, setData] = useState<WorkflowRunResponse | null>(null);

    const fetchRun = async (value: string) => {
        if (!value) return;
        setLoading(true);
        setError('');
        setData(null);
        try {
            const resp: ApiResponse<WorkflowRunResponse> = await getWorkflowRun(value);
            if (resp.error) {
                setError(resp.error);
            } else {
                setData(resp.data as WorkflowRunResponse);
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load run');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRun(initialRunParam);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRunParam]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRun(lookup);
    };

    return (
        <ProtectedRoute>
            <div className="form-container" style={{ maxWidth: 900 }}>
                <h1 className="form-title">Workflow Run</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
                    View details of a workflow execution. Paste a full Run URI or enter a run id (e.g., run-1234...).
                </p>

                <form onSubmit={onSubmit} className="form" noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="lookup">Run URI or ID</label>
                        <input
                            id="lookup"
                            name="lookup"
                            className="form-input"
                            type="text"
                            value={lookup}
                            onChange={(e) => setLookup(e.target.value)}
                            placeholder="http://localhost:3000/workflow-run/run-... or run-..."
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="submit" className="form-button" disabled={loading} aria-disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="loading-spinner" /> Loading...
                                </span>
                            ) : 'Load'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="alert alert-error" role="alert" style={{ marginTop: '1rem' }}>
                        {error}
                    </div>
                )}

                {data && (
                    <div className="alert alert-success" role="status" style={{ marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Run Details</h3>
                        <p><strong>Run ID (URI):</strong> {data.run}</p>
                        <p><strong>KPI:</strong> {data.kpi !== null && data.kpi !== undefined ? formatNumber(data.kpi) : 'N/A'} {prettyUnit(data.unit)}</p>

                        <h4 style={{ marginTop: '0.75rem' }}>Triples</h4>
                        <div style={{
                            maxHeight: 300,
                            overflow: 'auto',
                            background: 'var(--card-background)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--border-radius)',
                            padding: '0.75rem'
                        }}>
                            {data.triples?.length ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Predicate</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Object</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Datatype</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.triples.map((t: WorkflowRunTriple, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{compactIri((t as any).p)}</td>
                                                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{renderObject((t as any).o, (t as any).datatype || (t as any).oType)}</td>
                                                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{compactIri((t as any).datatype || (t as any).oType || '')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div>No triples found for this run.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
