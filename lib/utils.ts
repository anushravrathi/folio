import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanDomain(domain: string): string {
  if (!domain) return '';
  let clean = domain.trim().toLowerCase();
  // Remove protocol
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  // Remove trailing slashes and paths
  clean = clean.split('/')[0];
  // Remove query params
  clean = clean.split('?')[0];
  // Remove hashes
  clean = clean.split('#')[0];
  // Remove trailing dots
  clean = clean.replace(/\.$/, '');
  return clean;
}

export function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
  return domainRegex.test(domain);
}

