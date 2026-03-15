'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type GoogleAuthButtonProps = {
  onCredential: (credential: string) => void;
  label?: string;
};

const ENV_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({
  onCredential,
  label = 'Google bilan kirish',
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [clientId, setClientId] = useState<string | undefined>(ENV_CLIENT_ID);
  const initializedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (!ENV_CLIENT_ID && typeof document !== 'undefined') {
      const fromDom =
        document.documentElement?.dataset?.googleClientId ||
        document.body?.dataset?.googleClientId;
      if (fromDom) {
        setClientId(fromDom);
      }
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !clientId || initializedRef.current) {
      return;
    }
    if (!window.google?.accounts?.id) {
      setGsiReady(false);
      return;
    }

    setGsiReady(true);
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          onCredential(response.credential);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 320,
    });

    initializedRef.current = true;
  }, [scriptLoaded, onCredential, clientId]);

  return (
    <div className="space-y-3">
      <div ref={buttonRef} className="flex justify-center" aria-label={label} />
      {mounted && !clientId && (
        <p className="text-xs text-muted-foreground text-center">
          <code className="text-foreground/70">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> not set
        </p>
      )}
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={() => setScriptLoaded(true)}
      />

    </div>
  );
}
