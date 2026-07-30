'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';

type Props = {
  href: string;
  label?: string;
  className?: string;
};

/** Bouton œil cohérent : ouvre toujours une page de détail réelle. */
export default function ViewButton({ href, label = 'Voir les détails', className = '' }: Props) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-[#00377D] shadow-sm transition hover:border-[#FFD100] hover:bg-[#FFD100]/20 ${className}`}
    >
      <Eye size={16} aria-hidden />
      <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
    </Link>
  );
}
