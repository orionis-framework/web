import { asset } from '@/lib/asset';

const gallery = '/images/cosmo/gallery/';
const poses = '/images/cosmo/cosmo-';

export const artworks = [
  { id: 'first-contact', width: 1200, height: 1200, group: 'together', scene: true },
  { id: 'leap', width: 640, height: 640, group: 'solo', tone: 'mint' },
  { id: 'stargazer', width: 640, height: 640, group: 'solo', tone: 'lilac' },
  { id: 'star', width: 666, height: 898, group: 'solo', tone: 'sand', original: true },
  { id: 'standard-bearer', width: 1200, height: 1200, group: 'together', scene: true },
  { id: 'nap', width: 640, height: 640, group: 'solo', tone: 'blush' },
  { id: 'wave', width: 287, height: 324, group: 'solo', tone: 'lilac', original: true },
  { id: 'hello-orionis', width: 1200, height: 1200, group: 'together', scene: true },
  { id: 'explore', width: 408, height: 279, group: 'solo', tone: 'mint', original: true },
  { id: 'night-sky', width: 2137, height: 736, group: 'solo', scene: true },
  { id: 'avatar', width: 256, height: 256, group: 'solo', tone: 'sand', original: true },
] as const satisfies readonly Artwork[];

export interface Artwork {
  id: string;
  width: number;
  height: number;
  group: 'solo' | 'together';
  scene?: boolean;
  original?: boolean;
  tone?: 'mint' | 'lilac' | 'sand' | 'blush';
}

export function artworkUrl(art: Artwork) {
  return asset(`${art.original ? poses : gallery}${art.id}.webp`);
}

export const panoramaUrl = asset(`${gallery}night-sky.webp`);
export const collectionUrl = asset('/downloads/cosmo-gallery.zip');
