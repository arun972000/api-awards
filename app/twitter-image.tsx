import { createSocialImage } from '@/lib/brandImages';

export const runtime = 'nodejs';
export const alt = 'API Excellence Awards 2026 nominations';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return createSocialImage();
}
