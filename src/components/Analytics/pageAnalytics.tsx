"use client";

import { useEffect, useRef } from "react";
import { analyticsUrl, hasReadArticle, trackAnalytics } from "@/src/utilities/analytics";
import { useAnalyticsConsent } from "./siteAnalytics";

type Props = { pageType: "home" | "blog_list" | "blog_article" | "service"; title: string; serviceId?: string; articleId?: string };
let previousLocation = "";

export default function PageAnalytics({ pageType, title, serviceId = "", articleId = "" }: Props) {
    const consent = useAnalyticsConsent();
    const lastPage = useRef("");
    const readSent = useRef(false);

    useEffect(() => {
        if (consent !== "granted") return;
        const location = analyticsUrl(window.location.href, true);
        const context = {
            page_type: pageType, page_path: window.location.pathname, page_location: location, page_title: title,
            service_id: serviceId, service_name: serviceId ? title : "",
            article_id: articleId, article_title: articleId ? title : "",
        };
        if (lastPage.current !== location) {
            trackAnalytics("page_view", { ...context, page_referrer: previousLocation || analyticsUrl(document.referrer) });
            previousLocation = analyticsUrl(location);
            lastPage.current = location;
            readSent.current = false;
        }
        const onClick = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(target instanceof HTMLAnchorElement)) return;
            const url = new URL(target.href);
            if (url.protocol === "https:" && url.hostname === "wa.me") trackAnalytics("whatsapp_click", context);
        };
        document.addEventListener("click", onClick, true);

        const content = articleId ? document.querySelector<HTMLElement>("[data-analytics-blog-content]") : null;
        let visibleMs = 0;
        let lastTick = performance.now();
        let wasVisible = document.visibilityState === "visible";
        let progress = 0;
        const measure = () => {
            const now = performance.now();
            const visible = document.visibilityState === "visible";
            if (wasVisible && visible) visibleMs += now - lastTick;
            lastTick = now;
            wasVisible = visible;
            if (!content || readSent.current || !visible) return;
            const rect = content.getBoundingClientRect();
            if (rect.height <= 0) return;
            progress = Math.max(progress, Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height)));
            if (hasReadArticle(visibleMs, progress)) {
                trackAnalytics("blog_read", { ...context, visible_seconds: Math.floor(visibleMs / 1000), scroll_percent: Math.round(progress * 100) });
                readSent.current = true;
            }
        };
        const timer = content ? window.setInterval(measure, 1000) : undefined;
        if (content) {
            measure();
            window.addEventListener("scroll", measure, { passive: true });
            document.addEventListener("visibilitychange", measure);
        }
        return () => {
            document.removeEventListener("click", onClick, true);
            window.clearInterval(timer);
            window.removeEventListener("scroll", measure);
            document.removeEventListener("visibilitychange", measure);
        };
    }, [consent, pageType, title, serviceId, articleId]);

    return null;
}
