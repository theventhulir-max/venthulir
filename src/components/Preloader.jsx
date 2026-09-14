'use client';

import { useEffect } from 'react';

export default function Preloader({ onComplete }) {
  useEffect(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  return null;
}
