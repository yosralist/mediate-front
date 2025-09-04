'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{
      backgroundColor: 'white',
      //padding: '0.75rem 0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <Image
              src="/logo_mediate.png"
              alt="Mediate Logo"
              width={100}
              height={100}
              style={{ marginRight: '0.75rem' }}
            />
          </Link>
        </div>

        {user && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <Link
              href="/microstructure"
              style={{
                color: pathname === '/microstructure' ? 'var(--primary-color)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: pathname === '/microstructure' ? '600' : '500',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              Microstructure
              {pathname === '/microstructure' && (
                <span style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '3px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '3px'
                }} />
              )}
            </Link>
            <Link
              href="/sofc"
              style={{
                color: pathname === '/sofc' ? 'var(--primary-color)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: pathname === '/sofc' ? '600' : '500',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              SOFC Workflow
              {pathname === '/sofc' && (
                <span style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '3px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '3px'
                }} />
              )}
            </Link>
            <Link
              href="/rdf"
              style={{
                color: pathname === '/rdf' ? 'var(--primary-color)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: pathname === '/rdf' ? '600' : '500',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--border-radius)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              RDF Loader
              {pathname === '/rdf' && (
                <span style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '3px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '3px'
                }} />
              )}
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Welcome, {user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href="/login"
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'white',
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '500',
                  border: '1px solid var(--primary-color)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
