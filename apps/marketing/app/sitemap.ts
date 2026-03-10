import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://thehedge.ie';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/features`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/homeschool`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/community`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog/aears-assessment-guide-ireland`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog/winter-activities-ireland`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog/homeschool-ireland-beginners`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog/screen-free-weekends`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog/irish-seasons-activities`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
