export declare class NavigationItem {
    id: string;
    navigationId: string;
    label: string;
    type: string;
    url?: string;
    pageId?: string;
    postId?: string;
    categoryId?: string;
    icon?: string;
    cssClass?: string;
    openInNewTab: boolean;
    order: number;
    parentId?: string;
    children?: NavigationItem[];
    createdAt: Date;
    updatedAt: Date;
}
