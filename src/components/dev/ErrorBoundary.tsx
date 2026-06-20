'use client';

import React from 'react';
import { appendErrorLog, createErrorLogItem } from '@/lib/error-log/errorLog';

type ErrorBoundaryState = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    appendErrorLog(createErrorLogItem({
      source: 'React ErrorBoundary',
      message: error.message,
      stack: `${error.stack ?? ''}\n${errorInfo.componentStack}`
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="card">
            <h1>FinFlow</h1>
            <p className="card-description">Произошла ошибка интерфейса. Она сохранена в Dev Error Log.</p>
            <p className="card-description">{this.state.message}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
