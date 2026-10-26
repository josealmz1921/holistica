export const dynamic = 'force-dynamic';

import HomeSections from '@/src/components/HomeSections';
import BuilderPreview from '@/src/components/PageBuilder/pagePreview';

export default function PreviewPage() {
    return <BuilderPreview><HomeSections /></BuilderPreview>;
}
