export const dynamic = 'force-dynamic';

import Hero from '@/src/components/Hero';
import HomeSections from '@/src/components/HomeSections';
import PageAnalytics from '@/src/components/Analytics/pageAnalytics';
import { PageRenderer, florDeLunaTheme } from '@/src/page-builder';
import { getPublishedHome } from '@/src/server/publishedHome';
import { HOME_SEO_TITLE, homeMetadata } from '@/src/utilities/siteSeo';

export async function generateMetadata() {
    const published = await getPublishedHome();
    return homeMetadata(published?.seo);
}

export default async function Home() {
    const published = await getPublishedHome();
    return <main id="contenido">
        <PageAnalytics pageType="home" title={published?.seo?.title.trim() || HOME_SEO_TITLE} />
        {published ? <PageRenderer document={published} theme={florDeLunaTheme} /> : <Hero />}
        <HomeSections />
    </main>;
}
