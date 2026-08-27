import { createBrandIcon } from '@/lib/brandImages';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return createBrandIcon(size.width);
}
