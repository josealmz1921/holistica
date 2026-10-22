export const ANALYTICS_CONSENT_KEY = "flor-de-luna:analytics-consent:v1";
export const ANALYTICS_CONSENT_EVENT = "analytics-consent-change";
export const GTM_ID = "GTM-P2828KQC";

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

export function getAnalyticsConsent(): "granted" | "denied" | null {
    if (typeof window === "undefined") return null;
    try {
        const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
        return value === "granted" || value === "denied" ? value : null;
    } catch { return null; }
}

export function setAnalyticsConsent(value: "granted" | "denied") {
    try { window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value); }
    catch { return false; }
    if (value === "denied") {
        window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    }
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
    // Removing a Script component does not unload tags already executed by GTM.
    if (value === "denied" && window.gtag) window.location.reload();
    return true;
}

export function analyticsUrl(value: string, includeCampaign = false) {
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) return "";
        const result = new URL(url.origin + url.pathname);
        if (includeCampaign) {
            for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
                const entry = url.searchParams.get(key);
                if (entry) result.searchParams.set(key, entry.slice(0, 160));
            }
        }
        return result.toString();
    } catch { return ""; }
}

type AnalyticsEvent = "page_view" | "whatsapp_click" | "blog_read";
type Parameters = Record<string, string | number>;

export function trackAnalytics(event: AnalyticsEvent, parameters: Parameters) {
    if (getAnalyticsConsent() !== "granted") return;
    if (/^\/(?:dashboard|login|api)(?:\/|$)/.test(window.location.pathname)) return;
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
        // eslint-disable-next-line prefer-rest-params -- Google's command queue expects an Arguments object, not an event array.
        window.gtag = function () { window.dataLayer?.push(arguments); };
        // Queue the consent command before any event, even before next/script executes.
        window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    }
    window.dataLayer.push({
        // Clear optional context: GTM otherwise retains values from earlier pushes.
        service_id: "", service_name: "", article_id: "", article_title: "",
        ...parameters, event,
    });
}

export function hasReadArticle(visibleMs: number, progress: number) {
    return visibleMs >= 45000 && progress >= 0.9;
}
