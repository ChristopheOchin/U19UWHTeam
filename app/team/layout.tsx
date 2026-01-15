/**
 * Team Area Layout
 *
 * Protected layout for team members
 */

import { ReactNode } from 'react';

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
