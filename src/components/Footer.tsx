import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest py-3 px-gutter-desktop border-t border-border-subtle/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant text-xs">
        <span>CV Arba'in Solo Raya · Sistem Manajemen Distribusi &amp; Logistik Farmasi Herbal · Kepatuhan CDOB</span>
        <span className="font-mono text-xs font-semibold text-primary">
          ArbaConnect Enterprise · v2.4.0
        </span>
      </div>
    </footer>
  );
};
