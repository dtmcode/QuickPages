export declare class CreateMembershipPlanInput {
    name: string;
    description?: string;
    price: number;
    interval?: string;
    features?: string[];
    isPublic?: boolean;
    position?: number;
}
export declare class UpdateMembershipPlanInput {
    name?: string;
    description?: string;
    price?: number;
    interval?: string;
    features?: string[];
    isActive?: boolean;
    isPublic?: boolean;
    position?: number;
    stripePriceId?: string;
}
export declare class GrantMembershipInput {
    customerEmail: string;
    customerName: string;
    planId?: string;
    expiresAt?: Date;
}
export declare class UpdateMembershipStatusInput {
    status: string;
}
export declare class CreateCourseInput {
    title: string;
    description?: string;
    shortDescription?: string;
    thumbnail?: string;
    price?: number;
    isFree?: boolean;
    requiresMembershipPlanId?: string;
    level?: string;
    language?: string;
    certificateEnabled?: boolean;
}
export declare class UpdateCourseInput {
    title?: string;
    description?: string;
    shortDescription?: string;
    thumbnail?: string;
    price?: number;
    isFree?: boolean;
    isPublished?: boolean;
    requiresMembershipPlanId?: string;
    level?: string;
    language?: string;
    certificateEnabled?: boolean;
    stripePriceId?: string;
}
export declare class CreateChapterInput {
    courseId: string;
    title: string;
    description?: string;
    position?: number;
}
export declare class UpdateChapterInput {
    title?: string;
    description?: string;
    position?: number;
    isPublished?: boolean;
}
export declare class CreateLessonInput {
    chapterId: string;
    courseId: string;
    title: string;
    type?: string;
    videoUrl?: string;
    duration?: number;
    position?: number;
    isFreePreview?: boolean;
    content?: any;
}
export declare class UpdateLessonInput {
    title?: string;
    type?: string;
    videoUrl?: string;
    duration?: number;
    position?: number;
    isPublished?: boolean;
    isFreePreview?: boolean;
    content?: any;
}
export declare class EnrollCourseInput {
    courseId: string;
    customerEmail: string;
    customerName: string;
    membershipId?: string;
    stripePaymentIntentId?: string;
}
export declare class TrackLessonProgressInput {
    enrollmentId: string;
    lessonId: string;
    completed?: boolean;
    watchTime?: number;
}
