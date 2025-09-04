'use client';

import { useAuth } from './AuthContext';
import DashboardStats from './components/DashboardStats';

export default function Home() {
  const { user } = useAuth();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
        color: 'white',
        padding: '4rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            MEDIATE
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto 2rem'
          }}>
            Hybrid Modeling Platform for Advanced SOFC Research
          </p>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.8,
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Integrating mechanistic models with machine learning for predictive accuracy in Solid Oxide Fuel Cell performance evaluation
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {user ? (
          // Dashboard for logged-in users
          <div>
            {/* Welcome Section */}
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '3rem',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Welcome back, {user.username}!
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1.1rem',
                marginBottom: '2rem'
              }}>
                Ready to continue your SOFC research with our advanced modeling tools
              </p>

              {/* Dynamic Dashboard Stats */}
              <DashboardStats />
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '3rem',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                Quick Actions
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                <a href="/microstructure" style={{
                  display: 'block',
                  padding: '1.5rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--primary-color)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Microstructure Analysis</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload and analyze electrode microstructures</div>
                </a>

                <a href="/sofc" style={{
                  display: 'block',
                  padding: '1.5rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--primary-color)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>SOFC Simulation</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Run hybrid model simulations</div>
                </a>

                <a href="/rdf" style={{
                  display: 'block',
                  padding: '1.5rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--primary-color)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Knowledge Base</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manage RDF data and ontologies</div>
                </a>
              </div>
            </div>

            {/* Recent Activity - Updated to show guidance */}
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '2.5rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                Getting Started
              </h3>

              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--success-color)',
                    borderRadius: '50%'
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Start with Microstructure Analysis</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload your first microstructure data</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '50%'
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Run SOFC Simulations</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Configure and execute simulations</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--warning-color)',
                    borderRadius: '50%'
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Explore Knowledge Base</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manage your RDF data and ontologies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Public homepage for non-logged-in users
          <div>
            {/* Project Overview */}
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '3rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '3rem',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                Advanced Hybrid Modeling Framework
              </h2>

              <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  The design and optimization of Solid Oxide Fuel Cells (SOFCs) require a deep understanding of complex multiscale physical and chemical processes. MEDIATE bridges the gap between traditional physics-based models and modern machine learning approaches.
                </p>

                <div style={{
                  display: 'grid',
                  gap: '2rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  marginTop: '3rem'
                }}>
                  <div style={{
                    padding: '2rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'var(--primary-color)',
                      marginBottom: '1rem'
                    }}>Multi-physics Simulation</h3>
                    <p style={{ lineHeight: '1.6' }}>
                      Structured COMSOL models for 3D simulations capturing mass transport, electrochemical reactions, thermal dynamics, and mechanical stresses.
                    </p>
                  </div>

                  <div style={{
                    padding: '2rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'var(--primary-color)',
                      marginBottom: '1rem'
                    }}>Machine Learning Integration</h3>
                    <p style={{ lineHeight: '1.6' }}>
                      Neural networks trained on synthetic datasets for real-time performance optimization and reduced computational costs.
                    </p>
                  </div>

                  <div style={{
                    padding: '2rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'var(--primary-color)',
                      marginBottom: '1rem'
                    }}>Semantic Interoperability</h3>
                    <p style={{ lineHeight: '1.6' }}>
                      EMMO ontology framework ensuring efficient data exchange across modeling domains and research disciplines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Started Section */}
            <div style={{
              backgroundColor: 'var(--card-background)',
              padding: '3rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Get Started with MEDIATE
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>
                Access our hybrid modeling platform for SOFC research and development
              </p>

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <a href="/login" style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  minWidth: '140px'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Login
                </a>
                <a href="/register" style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--success-color)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  minWidth: '140px'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0ca678';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--success-color)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Platform Information */}
        <div style={{
          backgroundColor: 'var(--card-background)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)',
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Platform Integration
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem'
          }}>
            Integrated with Mediate API backend and Fuseki triple store for comprehensive SOFC research
          </p>
          <code style={{
            backgroundColor: 'var(--background-color)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius)',
            color: 'var(--primary-color)',
            fontWeight: '600'
          }}>
            {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
          </code>
        </div>
      </div>
    </main >
  );
}
