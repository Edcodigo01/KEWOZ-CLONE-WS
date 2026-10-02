'use client';

import { ThemeExample } from '@/components/examples/ThemeExample';

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Theme System Test</h1>
        <ThemeExample />
      </div>
    </div>
  );
}
