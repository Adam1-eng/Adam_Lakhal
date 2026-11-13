// Titre du hero : React Bits · BlurText (apparition mot à mot avec flou). Texte inchangé.
import BlurText from '../react-bits/BlurText';
import { heroTitle } from '../../lib/motion-config';

type Props = { text: string; highlight?: string; id?: string; className?: string };

export default function HeroTitle({ text, highlight = '', id, className }: Props) {
  const words = text.split(' ');
  const start = highlight ? words.length - highlight.split(' ').length : words.length;
  const isHighlight = (w: number) => Boolean(highlight) && text.endsWith(highlight) && w >= start;
  return (
    <div id={id} className="blur-title-wrap">
      <BlurText
        as="h1"
        text={text}
        className={`blur-title ${className ?? ''}`}
        animateBy="words"
        direction="bottom"
        trigger="load"
        delay={heroTitle.delay}
        stepDuration={heroTitle.stepDuration}
        blur={heroTitle.blur}
        distance={heroTitle.distance}
        wordClassName={(w) => (isHighlight(w) ? 'aura-text' : undefined)}
      />
    </div>
  );
}
