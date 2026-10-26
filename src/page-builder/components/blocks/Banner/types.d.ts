import { ReactNode } from "react";

export type BannerImagePosition =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'background';

export type BannerHeight = 'small' | 'medium' | 'large' | 'auto';

export type BannerContentAlign = 'left' | 'center' | 'right';

export interface BannerProps {
    image?: string;
    imageAlt?: string;

    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;

    imagePosition?: BannerImagePosition;

    parallax?: boolean;

    height?: BannerHeight;

    overlay?: boolean;

    contentAlign?: BannerContentAlign;
}
