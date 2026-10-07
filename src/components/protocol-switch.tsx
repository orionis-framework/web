'use client';

import { SiRust } from '@icons-pack/react-simple-icons';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { asset } from '@/lib/asset';
import { site } from '@/lib/site';

interface ProtocolSwitchProps {
  labels: { label: string; rsgi: string; asgi: string };
}

export function ProtocolSwitch({ labels }: ProtocolSwitchProps) {
  const [protocol, setProtocol] = useState<'RSGI' | 'ASGI'>('RSGI');

  return (
    <div className="transport-preview">
      <div className="transport-toolbar">
        <a
          className="granian-brand"
          href={site.granian.url}
          target="_blank"
          rel="noreferrer"
          title="Granian"
        >
          <Image
            src={asset(site.granian.logo)}
            alt="Granian"
            width={360}
            height={344}
            className="granian-logo"
          />
        </a>
        <div className="segmented-control" role="group" aria-label={labels.label}>
          {(['RSGI', 'ASGI'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={protocol === value}
              onClick={() => setProtocol(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="transport-flow">
        <span>
          <SiRust size={28} color="currentColor" aria-hidden="true" />
          <span>Rust</span>
        </span>
        <ArrowRight size={20} aria-hidden="true" />
        <strong>{protocol}</strong>
        <ArrowRight size={20} aria-hidden="true" />
        <span>
          <Image src={asset('/favicon.svg')} alt="" width={29} height={29} />
          <span>Orionis</span>
        </span>
      </div>
      <p className="transport-caption">{protocol === 'RSGI' ? labels.rsgi : labels.asgi}</p>
    </div>
  );
}
