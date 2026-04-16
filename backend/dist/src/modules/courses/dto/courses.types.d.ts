export declare enum MembershipStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    TRIAL = "trial",
    PAUSED = "paused"
}
export declare enum MembershipInterval {
    MONTHLY = "monthly",
    YEARLY = "yearly",
    LIFETIME = "lifetime"
}
export declare enum CourseLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export declare enum LessonType {
    VIDEO = "video",
    TEXT = "text",
    PDF = "pdf",
    QUIZ = "quiz"
}
export declare enum AccessGrantedBy {
    PURCHASE = "purchase",
    MEMBERSHIP = "membership",
    MANUAL = "manual",
    FREE = "free"
}
export declare class MembershipPlan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    interval: string;
    features: string[] | null;
    isActive: boolean;
    isPublic: boolean;
    stripePriceId: string | null;
    position: number;
    memberCount: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class MembershipPlansResponse {
    plans: MembershipPlan[];
    total: number;
}
export declare class Membership {
    id: string;
    planId: string | null;
    plan?: MembershipPlan | null;
    customerEmail: string;
    customerName: string;
    status: string;
    startedAt: Date | null;
    expiresAt: Date | null;
    cancelledAt: Date | null;
    stripeSubscriptionId: string | null;
    grantedManually: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class MembershipsResponse {
    memberships: Membership[];
    total: number;
}
export declare class LessonProgressEntry {
    id: string;
    lessonId: string;
    completedAt: Date | null;
    watchTime: number | null;
    createdAt: Date | null;
}
export declare class CourseLesson {
    id: string;
    chapterId: string;
    courseId: string;
    title: string;
    slug: string;
    type: string;
    videoUrl: string | null;
    duration: number | null;
    position: number;
    isPublished: boolean;
    isFreePreview: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class CourseChapter {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    position: number;
    isPublished: boolean;
    lessons?: CourseLesson[];
    createdAt: Date | null;
}
export declare class Course {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    thumbnail: string | null;
    price: number;
    isFree: boolean;
    isPublished: boolean;
    requiresMembershipPlanId: string | null;
    requiredPlan?: MembershipPlan | null;
    level: string;
    language: string;
    totalDuration: number | null;
    certificateEnabled: boolean;
    stripePriceId: string | null;
    chapters?: CourseChapter[];
    enrollmentCount: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class CoursesResponse {
    courses: Course[];
    total: number;
}
export declare class CourseEnrollment {
    id: string;
    courseId: string;
    course?: Course | null;
    customerEmail: string;
    customerName: string;
    accessGrantedBy: string;
    membershipId: string | null;
    enrolledAt: Date | null;
    completedAt: Date | null;
    progress: number;
    certificateUrl: string | null;
    lessonProgress?: LessonProgressEntry[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class EnrollmentsResponse {
    enrollments: CourseEnrollment[];
    total: number;
}
export declare class CoursesStats {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    activeMembers: number;
    totalRevenue: number;
}
