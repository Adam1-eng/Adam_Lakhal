// Fond lumineux du hero : React Bits · LightRays, aux couleurs du site et volontairement discret.
import { useEffect, useState } from 'react';
import LightRays from '../react-bits/LightRays';
import { heroRays } from '../../lib/motion-config';

export default function HeroRays() {
  const [ratio, setRatio] = useState(heroRays.maxDevicePixelRatio);
  useEffect(() => {
    // Cellulaire : résolution réduite pour économiser la batterie et garder 60 i/s
    if (window.matchMedia('(max-width: 760px)').matches) setRatio(heroRays.mobileMaxDevicePixelRatio);
  }, []);
  const { mobileMaxDevicePixelRatio: _m, maxDevicePixelRatio: _d, ...props } = heroRays;
  return <LightRays raysOrigin="top-center" {...props} maxDevicePixelRatio={ratio} className="hero__rays-canvas" />;
}
