import { Page } from './page.entity';
export declare enum SectionType {
    hero = "hero",
    features = "features",
    about = "about",
    services = "services",
    gallery = "gallery",
    testimonials = "testimonials",
    team = "team",
    pricing = "pricing",
    cta = "cta",
    contact = "contact",
    faq = "faq",
    blog = "blog",
    stats = "stats",
    video = "video",
    text = "text",
    html = "html",
    custom = "custom",
    newsletter = "newsletter",
    booking = "booking",
    map = "map",
    countdown = "countdown",
    social = "social",
    spacer = "spacer",
    before_after = "before_after",
    whatsapp = "whatsapp",
    freestyle = "freestyle"
}
export declare class Section {
    id: string;
    tenantId: string;
    pageId: string;
    name: string;
    type: SectionType;
    order: number;
    isActive: boolean;
    content: Record<string, any>;
    styling?: Record<string, any>;
    page?: Page;
    createdAt: Date;
    updatedAt: Date;
}
