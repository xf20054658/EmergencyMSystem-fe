'use client';

// ============================================================
// Providers Wrapper — AuthContext + Toast
// ============================================================

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#131316',
            color: '#E4E4E7',
            border: '1px solid #1E1E24',
            fontSize: '13px',
          },
        }}
      />
    </AuthProvider>
  );
}
