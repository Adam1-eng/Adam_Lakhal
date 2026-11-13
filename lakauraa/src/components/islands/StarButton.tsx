// Bouton d’action principal : React Bits · StarBorder (étoile qui parcourt la bordure). Texte et lien inchangés.
import type { ReactNode } from 'react';
import StarBorder from '../react-bits/StarBorder';
import { ctaStar } from '../../lib/motion-config';

type Props = { href: string; children?: ReactNode; className?: string };

export default function StarButton({ href, children, className = '' }: Props) {
  return (
    <StarBorder as="a" href={href} className={`btn btn--star ${className}`} hover="lap" theme="dark" {...ctaStar}>
      {children}
    </StarBorder>
  );
}
