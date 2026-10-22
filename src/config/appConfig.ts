/**
 * Medha 2K26 Public Deployment & Share Configuration
 * Uses the Public Shared App URL so any faculty or student can open links
 * without receiving Google 403 Forbidden errors.
 */

export const PUBLIC_APP_URL = "https://ais-pre-xnnq3kmnsk7yardai5guos-629444814189.asia-northeast1.run.app";

export function getShareableVipUrl(facultyId: number, vipToken: string): string {
  return `${PUBLIC_APP_URL}?vip=pass&id=${facultyId}&token=${vipToken}`;
}

export function getPublicGalleryUrl(): string {
  return `${PUBLIC_APP_URL}#gallery`;
}
