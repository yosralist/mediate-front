'use client';

import React from 'react';

type StepperProps = {
    steps: string[];
    currentStep: number; // 0-based
    onStepChange?: (index: number) => void;
    className?: string;
};

export default function Stepper({ steps, currentStep, onStepChange, className }: StepperProps) {
    return (
        <nav
            aria-label="Progress"
            role="tablist"
            className={className ?? ''}
            style={{ marginBottom: '1rem' }}
        >
            <ol
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                    gap: '0.5rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                }}
            >
                {steps.map((label, i) => {
                    const isActive = i === currentStep;
                    const isCompleted = i < currentStep;
                    return (
                        <li key={label}>
                            <button
                                role="tab"
                                aria-selected={isActive}
                                aria-current={isActive ? 'step' : undefined}
                                onClick={() => onStepChange?.(i)}
                                disabled={!onStepChange}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--border-radius)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: isActive
                                        ? 'var(--primary-color)'
                                        : isCompleted
                                            ? '#e8f6d9'
                                            : 'var(--card-background)',
                                    color: isActive ? '#fff' : 'var(--text-primary)',
                                    cursor: onStepChange ? 'pointer' : 'default',
                                    boxShadow: isActive ? 'var(--shadow)' : 'none',
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '1.5rem',
                                        height: '1.5rem',
                                        borderRadius: '9999px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: isCompleted ? 'var(--primary-color)' : '#fff',
                                        color: isCompleted ? '#fff' : 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {isCompleted ? '✓' : i + 1}
                                </span>
                                <span
                                    style={{
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.95rem',
                                        color: isActive ? '#fff' : 'var(--text-primary)',
                                    }}
                                >
                                    {label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
