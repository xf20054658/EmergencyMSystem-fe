'use client';

// ============================================================
// PC 指挥中心页面
// ============================================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PCLayout } from '@/components/pc/PCLayout';
import { PCLoginView } from '@/components/pc/PCLoginView';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function PCPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PCLoginView />;
  }

  return <PCLayout />;
}
