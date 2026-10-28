'use client';

import React from 'react';
import Link from 'next/link';
import Section2Form from '@/components/Section2Form';

export default function Section2Page() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
        >
          &larr; Back to Main Dashboard
        </Link>
      </div>
      <Section2Form />
    </main>
  );
}