const { test } = require("node:test");
const assert = require("node:assert/strict");
const createLoader = require("./load-ts.cjs");

function setup(t, site = "https://example.com/") {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    if (site === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = site;
    t.after(() => {
        if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
        else process.env.NEXT_PUBLIC_SITE_URL = previous;
    });
    const load = createLoader();
    return { ...load("src/utilities/siteSeo.ts"), siteUrl: load("src/utilities/blogSeo.ts").siteUrl };
}

test("home metadata describes the real location, canonical and brand consistently", t => {
    const { homeMetadata, HOME_SEO_TITLE, HOME_SEO_DESCRIPTION } = setup(t);
    const result = homeMetadata();
    assert.equal(result.title, "Masajes tántricos en Pachuca | Flor de luna");
    assert.equal(result.alternates.canonical, "https://example.com/");
    assert.equal(result.openGraph.url, result.alternates.canonical);
    assert.equal(result.openGraph.siteName, "Flor de luna");
    assert.equal(result.openGraph.title, HOME_SEO_TITLE);
    assert.equal(result.twitter.title, HOME_SEO_TITLE);
    assert.equal(result.twitter.description, HOME_SEO_DESCRIPTION);
    assert(HOME_SEO_DESCRIPTION.includes("Recibimos visitantes de CDMX, Edomex"));
    assert(HOME_SEO_DESCRIPTION.length <= 160);
    assert.equal(result.openGraph.images[0].url, "https://example.com/img/heroImage.jpg");
    assert.equal(result.keywords, undefined);
});

test("service canonical uses the public route and the same URL builder as the sitemap", t => {
    const { serviceMetadata, siteUrl } = setup(t, "https://example.com///");
    const result = serviceMetadata({ name: "Masaje tántrico" }, "masaje-tantrico");
    assert.equal(result.alternates.canonical, siteUrl("/masaje-tantrico"));
    assert.equal(result.alternates.canonical, "https://example.com/masaje-tantrico");
    assert.equal(result.openGraph.url, result.alternates.canonical);
    assert(!result.alternates.canonical.includes("/services/"));
    assert.equal(result.title, "Masaje tántrico en Pachuca | Flor de luna");
    assert.equal(result.openGraph.title, result.title);
    assert.equal(result.twitter.title, result.title);
    assert.equal(result.openGraph.siteName, "Flor de luna");
});

test("custom SEO and social metadata remain authoritative without changing the input", t => {
    const { serviceMetadata } = setup(t);
    const service = Object.freeze({
        name: "Masaje", seoTitle: "Mi título", seoDescription: "Mi descripción",
        ogTitle: "Título social", ogDescription: "Descripción social", ogImage: "https://images.example.com/og.jpg",
        twitterTitle: "Título X", twitterDescription: "Descripción X", twitterImage: "https://images.example.com/x.jpg",
    });
    const result = serviceMetadata(service, "masaje");
    assert.equal(result.title, service.seoTitle);
    assert.equal(result.description, service.seoDescription);
    assert.equal(result.openGraph.title, service.ogTitle);
    assert.equal(result.openGraph.description, service.ogDescription);
    assert.equal(result.openGraph.images[0].url, service.ogImage);
    assert.equal(result.twitter.title, service.twitterTitle);
    assert.equal(result.twitter.description, service.twitterDescription);
    assert.deepEqual(result.twitter.images, [service.twitterImage]);
});

test("fallback descriptions and images follow the existing service precedence", t => {
    const { serviceMetadata } = setup(t);
    const service = { name: "Masaje", shortDescription: "Resumen", description: "Texto largo", mainImage: "https://images.example.com/main.jpg", gallery: [{ url: "https://images.example.com/gallery.jpg" }] };
    assert.equal(serviceMetadata(service, "masaje").description, "Resumen");
    assert.equal(serviceMetadata({ ...service, seoDescription: "Personalizada" }, "masaje").description, "Personalizada");
    assert.equal(serviceMetadata({ ...service, shortDescription: "", description: "a".repeat(200) }, "masaje").description.length, 160);
    assert.equal(serviceMetadata(service, "masaje").openGraph.images[0].url, service.mainImage);
    assert.equal(serviceMetadata({ ...service, mainImage: "" }, "masaje").openGraph.images[0].url, service.gallery[0].url);
    assert.equal(serviceMetadata({ name: "Masaje" }, "masaje").openGraph.images[0].url, "https://example.com/img/bed.jpg");
});

test("Pachuca is not duplicated in titles already containing the city", t => {
    const { serviceMetadata } = setup(t);
    assert.equal(serviceMetadata({ name: "Masaje en Pachuca" }, "masaje").title, "Masaje en Pachuca | Flor de luna");
});

test("missing or invalid domain does not generate undefined or malformed absolute URLs", t => {
    const { homeMetadata, serviceMetadata } = setup(t, "");
    for (const value of ["", "not-a-url", "javascript:alert(1)"]) {
        process.env.NEXT_PUBLIC_SITE_URL = value;
        assert.equal(homeMetadata().alternates.canonical, "/");
        const service = serviceMetadata({ name: "Masaje" }, "masaje");
        assert.equal(service.alternates.canonical, "/masaje");
        assert.equal(service.openGraph.images[0].url, "/img/bed.jpg");
        assert(!JSON.stringify(service).includes("undefined"));
    }
});

test("canonical encodes route segments instead of turning a slug into URL parameters", t => {
    const { serviceMetadata } = setup(t);
    assert.equal(serviceMetadata({ name: "Masaje" }, "masaje?x=1").alternates.canonical, "https://example.com/masaje%3Fx%3D1");
});
