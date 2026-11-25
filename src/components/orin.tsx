import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { asset } from '@/lib/asset';

const sizes = {
  star: [666, 898],
  wave: [287, 324],
  explore: [408, 279],
  avatar: [256, 256],
} as const;

interface OrinProps {
  variant: keyof typeof sizes;
  decorative?: boolean;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function Orin({ variant, decorative = false, className, loading = 'lazy' }: OrinProps) {
  const t = useTranslations('Orin.alt');
  const [width, height] = sizes[variant];
  return (
    <Image
      src={asset(`/images/orin/orin-${variant}.webp`)}
      width={width}
      height={height}
      alt={decorative ? '' : t(variant)}
      className={className}
      loading={loading}
      unoptimized
    />
  );
}
