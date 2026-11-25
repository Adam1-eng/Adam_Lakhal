import { identity, services, trainings, legal } from '../config/miya';
import { isoDuration } from './format';

/** BeautySalon : uniquement des infos connues (pas d'adresse, téléphone ni horaires inventés). */
export function beautySalon() {
  const loc = identity.location;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${identity.siteUrl}/#salon`,
    name: identity.name,
    alternateName: identity.brand,
    description: `${identity.role} à ${loc.city} : extensions de cils, lash lift, brow lift et tooth gems.`,
    url: identity.siteUrl,
    email: identity.email,
    sameAs: [identity.instagram.url],
    currenciesAccepted: 'CAD',
    address: {
      '@type': 'PostalAddress',
      addressLocality: loc.city,
      addressRegion: loc.region,
      addressCountry: loc.country,
      ...(loc.streetAddress ? { streetAddress: loc.streetAddress } : {}),
      ...(loc.postalCode ? { postalCode: loc.postalCode } : {}),
    },
    areaServed: [{ '@type': 'City', name: 'Laval' }, { '@type': 'City', name: 'Montréal' }],
    potentialAction: {
      '@type': 'ReserveAction',
      target: identity.bookingUrl,
      name: 'Réserver en ligne',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: services.map((cat) => ({
        '@type': 'OfferCatalog',
        name: cat.title,
        itemListElement: cat.services.map((s) => ({
          '@type': 'Offer',
          price: s.price,
          priceCurrency: 'CAD',
          itemOffered: { '@type': 'Service', name: s.name, duration: isoDuration(s.minutes) },
        })),
      })),
    },
  };
  if (identity.phone) data.telephone = identity.phone;
  if (legal.legalName) data.legalName = legal.legalName;
  return data;
}

export function course() {
  const t = trainings.lashBoss;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: t.name,
    description: `Formation en extensions de cils sur ${t.days} jours à ${identity.location.city} : classique, hybride, volume, mega volume et business. Certification incluse.`,
    provider: { '@type': 'Organization', name: identity.name, sameAs: identity.instagram.url },
    inLanguage: 'fr',
    offers: { '@type': 'Offer', price: t.price, priceCurrency: 'CAD', category: 'Paid' },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      location: { '@type': 'Place', name: t.name, address: { '@type': 'PostalAddress', addressLocality: 'Laval', addressRegion: 'QC', addressCountry: 'CA' } },
      courseWorkload: `P${t.days}D`,
    },
  };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${identity.siteUrl}${it.path}`,
    })),
  };
}
