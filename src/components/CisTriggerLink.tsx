'use strict';
'use client';

import React, { useState } from 'react';
import CisModal from './CisModal';

export default function CisTriggerLink({
  label = 'Critical Information Summaries (CIS)',
  defaultPlan = '65gb',
}: {
  label?: string;
  defaultPlan?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#142420',
          textDecoration: 'underline',
          fontWeight: 700,
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {label}
      </button>
      <CisModal isOpen={open} onClose={() => setOpen(false)} defaultPlan={defaultPlan} />
    </>
  );
}

