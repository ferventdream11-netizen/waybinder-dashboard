'use client';

import { useEffect, useState } from 'react';

export default function UntilTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const d = new Date(iso);
    setText(
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d)
    );
  }, [iso]);

  // During SSR hydration this will be empty; that's fine.
  return <>{text}</>;
}
