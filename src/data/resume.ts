import { parse } from 'yaml';
import raw from './resume.yaml?raw';

export type Span = { start: number; end: number | null; kind: 'solid' | 'light' };
export type Milestone = { year: number; label: string; marker?: boolean };
export type Lane = { id: string; label: string; creative?: boolean; spans: Span[]; milestones?: Milestone[] };
export type Cert = string | { name: string; lapsed?: boolean };

export const resume = parse(raw) as {
  downloads: { label: string; file: string }[];
  experience: { title: string; org?: string; start: string; end: string; summary: string }[];
  education: { school: string; credential: string; detail?: string; year: string }[];
  certifications: Cert[];
  timeline: { start: number; lanes: Lane[] };
};
