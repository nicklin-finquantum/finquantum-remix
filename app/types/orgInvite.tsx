export interface OrgInvite {
    _id: string;         // ObjectId as string
    orgId: string;       // ObjectId as string
    role: string;        // default: "Member"
    invitedId: string;   // ObjectId as string
    inviterId: string;   // ObjectId as string
    email: string | null;  // can be null
    accepted: boolean;   // default: false
    organizationName: string; // Name of the organization
    organizationLogo: string; // URL
    inviterEmail: string; // Email of the inviter
    inviterFirstName: string; // First name of the inviter
    inviterLastName: string // Last name of the inviter
}