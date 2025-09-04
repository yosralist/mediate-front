'use client';

import { useState } from 'react';
import { loadRDF } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

export default function RdfPage() {
  const [data, setData] = useState('');
  const [format, setFormat] = useState('turtle');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await loadRDF(data, format);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--primary-color)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>RDF Loader</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Load RDF data into the Fuseki server.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="data" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>RDF Data:</label>
            <textarea
              id="data"
              name="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                height: '150px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 202, 67, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label htmlFor="format" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>Format:</label>
            <select
              id="format"
              name="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 202, 67, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="turtle">Turtle</option>
              <option value="xml">RDF/XML</option>
              <option value="json-ld">JSON-LD</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? 'var(--secondary-color)' : 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--primary-color)';
              }
            }}
          >
            {loading ? 'Loading...' : 'Load RDF'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--error-color)',
            color: 'white',
            border: '1px solid var(--error-color)',
            borderRadius: 'var(--border-radius)'
          }}>
            Error: {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--success-color)',
            color: 'white',
            border: '1px solid var(--success-color)',
            borderRadius: 'var(--border-radius)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>RDF Loaded Successfully!</h3>
            <pre style={{
              whiteSpace: 'pre-wrap',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.75rem',
              borderRadius: '4px',
              color: 'white'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
