export type InquiryType = "service" | "bug" | "other";
export type InquiryStatus = "pending" | "in_progress" | "completed";

export interface Inquiry {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    type: InquiryType;
    title: string;
    content: string;
    status: InquiryStatus;
    createdAt: string;
    updatedAt: string;
}

export type CreateInquiryInput = Pick<Inquiry, "type" | "title" | "content">;
