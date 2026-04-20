export type BlockAlign = 'left' | 'center' | 'right';
export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost';
export interface FreestyleSection {
    type: 'freestyle';
    content: {
        blocks: any[];
    };
    styling?: Record<string, any>;
}
export interface CustomSection {
    type: 'custom';
    content: {
        html: string;
        css?: string;
        js?: string;
    };
    styling?: Record<string, any>;
}
interface HeroOpts {
    heading: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
    badge?: string;
    imageUrl?: string;
    bgColor?: string;
    textColor?: string;
}
export declare const PRESETS: {
    hero(opts: HeroOpts): FreestyleSection;
    features(opts: {
        heading: string;
        subheading?: string;
        items: Array<{
            icon?: string;
            title: string;
            description: string;
            price?: string;
        }>;
        columns?: number;
        bgColor?: string;
    }): FreestyleSection;
    about(opts: {
        heading: string;
        description: string;
        buttonText?: string;
        buttonLink?: string;
        imageUrl?: string;
    }): FreestyleSection;
    cta(opts: {
        heading: string;
        subheading?: string;
        buttonText: string;
        buttonLink?: string;
        bgColor?: string;
        textColor?: string;
    }): FreestyleSection;
    contact(opts: {
        heading: string;
        subheading?: string;
        buttonText?: string;
    }): FreestyleSection;
    newsletter(opts: {
        heading: string;
        subheading?: string;
        buttonText?: string;
        placeholder?: string;
        bgColor?: string;
        textColor?: string;
    }): FreestyleSection;
    pricing(opts: {
        heading: string;
        subheading?: string;
        items: Array<{
            title: string;
            price: string;
            interval?: string;
            features: string[];
            buttonText?: string;
            highlighted?: boolean;
        }>;
    }): FreestyleSection;
    testimonials(opts: {
        heading: string;
        items: Array<{
            name: string;
            role?: string;
            text: string;
            image?: string;
        }>;
        columns?: number;
    }): FreestyleSection;
    team(opts: {
        heading: string;
        items: Array<{
            name: string;
            role?: string;
            bio?: string;
            image?: string;
        }>;
        columns?: number;
    }): FreestyleSection;
    stats(opts: {
        heading?: string;
        items: Array<{
            value: string;
            label: string;
            description?: string;
        }>;
        columns?: number;
        bgColor?: string;
        textColor?: string;
    }): FreestyleSection;
    faq(opts: {
        heading: string;
        items: Array<{
            question: string;
            answer: string;
        }>;
    }): FreestyleSection;
    gallery(opts: {
        heading?: string;
        images: Array<{
            url: string;
            alt?: string;
        }>;
        columns?: number;
    }): FreestyleSection;
    text(opts: {
        heading?: string;
        text: string;
        align?: BlockAlign;
    }): FreestyleSection;
    blogFeed(opts: {
        heading?: string;
        count?: number;
    }): FreestyleSection;
    custom(opts: {
        html: string;
        css?: string;
        js?: string;
    }): CustomSection;
};
export declare function impressumPreset(tenantName: string, data?: {
    address?: string;
    zip?: string;
    city?: string;
    phone?: string;
    email?: string;
}): FreestyleSection;
export declare function datenschutzPreset(tenantName: string, data?: {
    address?: string;
    zip?: string;
    city?: string;
    email?: string;
}): FreestyleSection;
export {};
