const { test } = require("node:test");
const assert = require("node:assert/strict");
const createLoader = require("./load-ts.cjs");

function browser(t, consent = null, pathname = "/blog/prueba") {
    const state = { consent, reloads: 0, events: [] };
    const previous = globalThis.window;
    globalThis.window = {
        location: { pathname, reload: () => state.reloads++ },
        localStorage: {
            getItem: () => state.consent,
            setItem: (_, value) => { state.consent = value; },
        },
        dispatchEvent: event => { state.events.push(event.type); },
    };
    t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
    return state;
}

test("no events or dataLayer before explicit consent, including denied and malformed values", t => {
    browser(t);
    const { trackAnalytics, getAnalyticsConsent } = createLoader()("src/utilities/analytics.ts");
    for (const value of [null, "denied", "true", "invalid"]) {
        window.localStorage.getItem = () => value;
        trackAnalytics("page_view", { page_path: "/blog" });
        assert.equal(window.dataLayer, undefined);
    }
    window.localStorage.getItem = () => { throw new Error("Storage blocked"); };
    assert.equal(getAnalyticsConsent(), null);
    trackAnalytics("blog_read", { article_id: "example" });
    assert.equal(window.dataLayer, undefined);
});

test("consent is queued before events, advertising is denied and optional context is cleared", t => {
    browser(t, "granted");
    const { trackAnalytics } = createLoader()("src/utilities/analytics.ts");
    trackAnalytics("page_view", { service_id: "service-1", service_name: "Servicio", page_type: "service" });
    const command = Array.from(window.dataLayer[0]);
    assert.deepEqual(command.slice(0, 2), ["consent", "default"]);
    assert.equal(command[2].analytics_storage, "granted");
    assert.equal(command[2].ad_storage, "denied");
    assert.equal(command[2].ad_user_data, "denied");
    assert.equal(command[2].ad_personalization, "denied");
    assert.equal(window.dataLayer[1].event, "page_view");
    trackAnalytics("blog_read", { article_id: "article-1" });
    assert.equal(window.dataLayer[2].service_id, "");
    assert.equal(window.dataLayer[2].service_name, "");
    assert.equal(window.dataLayer[2].article_id, "article-1");
});

test("private routes do not emit events even with granted consent", t => {
    browser(t, "granted");
    const { trackAnalytics } = createLoader()("src/utilities/analytics.ts");
    for (const pathname of ["/dashboard", "/dashboard/blog", "/dashboard/pages", "/builder-preview", "/login", "/api/cloudinary/sign"]) {
        window.location.pathname = pathname;
        trackAnalytics("page_view", {});
    }
    assert.equal(window.dataLayer, undefined);
});

test("withdrawal updates consent, notifies subscribers, reloads loaded tags and blocks further events", t => {
    const state = browser(t, "granted");
    const { trackAnalytics, setAnalyticsConsent, ANALYTICS_CONSENT_EVENT } = createLoader()("src/utilities/analytics.ts");
    trackAnalytics("page_view", {});
    assert.equal(setAnalyticsConsent("denied"), true);
    assert.equal(state.consent, "denied");
    assert.equal(state.reloads, 1);
    assert.deepEqual(state.events, [ANALYTICS_CONSENT_EVENT]);
    const count = window.dataLayer.length;
    trackAnalytics("whatsapp_click", {});
    assert.equal(window.dataLayer.length, count);
    assert.equal(Array.from(window.dataLayer[count - 1])[2].analytics_storage, "denied");
});

test("analytics URL omits arbitrary queries, hashes and credentials, only allowing campaign fields", () => {
    const { analyticsUrl } = createLoader()("src/utilities/analytics.ts");
    const input = "https://user:password@example.com/blog/demo?email=private@example.com&token=secret&utm_source=instagram&utm_campaign=masajes#private";
    assert.equal(analyticsUrl(input), "https://example.com/blog/demo");
    assert.equal(analyticsUrl(input, true), "https://example.com/blog/demo?utm_source=instagram&utm_campaign=masajes");
    assert.equal(analyticsUrl("javascript:alert(1)"), "");
    assert.equal(analyticsUrl(""), "");
});

test("reading estimate requires both 45 visible seconds and 90 percent of the text", () => {
    const { hasReadArticle } = createLoader()("src/utilities/analytics.ts");
    assert.equal(hasReadArticle(44999, 1), false);
    assert.equal(hasReadArticle(60000, 0.89), false);
    assert.equal(hasReadArticle(45000, 0.9), true);
});
