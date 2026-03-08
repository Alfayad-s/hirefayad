export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export interface ServicePricing {
  basic: number;
  pro: number;
  premium: number;
}

/** Tier for a service in an order */
export type ServiceTier = "basic" | "pro" | "premium";

export interface ServiceTieredFeature {
  text: string;
  tiers: ServiceTier[];
}

export interface ServiceDeliveryTime {
  basic: string;
  pro: string;
  premium: string;
}

export interface ServiceWhatsIncluded {
  allTiers?: string[];
  proAndAbove?: string[];
  premiumOnly?: string[];
}

export interface ServiceAddOn {
  name: string;
  description?: string;
  price: number;
  currency?: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceProcessStep {
  step?: number;
  title: string;
  description: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  features: string[];
  pricing: ServicePricing;
  createdAt: Date;
  /** Optional marketing image for the service */
  image?: string;
  /** Optional short tagline shown in marketing sections */
  shortTagline?: string;
  /** Currency code, e.g. INR, USD */
  currency?: string;
  /** Optional delivery time estimates per tier */
  deliveryTime?: ServiceDeliveryTime;
  /** Optional list of technologies used */
  technologies?: string[];
  /** Optional “what's included” breakdown */
  whatsIncluded?: ServiceWhatsIncluded;
  /** Optional “what's not included” points */
  whatsNotIncluded?: string[];
  /** Optional list of add-ons / upsells */
  addOns?: ServiceAddOn[];
  /** Optional FAQs for this service */
  faqs?: ServiceFaqItem[];
  /** Optional process steps explaining workflow */
  process?: ServiceProcessStep[];
  /** Optional guarantees list */
  guarantees?: string[];
  /** Optional, plan-specific feature mapping used in admin */
  tieredFeatures?: ServiceTieredFeature[];
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: Date;
  /** When true, show this coupon in the top marquee on the site */
  showInMarquee?: boolean;
  /** When set, coupon applies only to these service IDs; when empty/undefined, applies to all services */
  serviceIds?: string[];
}

export interface OrderItemAddOn {
  name: string;
  priceInr: number;
  quantity: number;
}

/** Single line item in an order (one service + tier + quantity) */
export interface OrderItem {
  serviceId: string;
  serviceTitle: string;
  tier: ServiceTier;
  quantity: number;
  unitPriceInr: number;
  /** Optional add-ons attached to this service line */
  addOns?: OrderItemAddOn[];
}

/** Quote request / order status */
export type OrderStatus =
  | "draft"
  | "quoted"
  | "pending_acceptance"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Order {
  _id: string;
  /** Set when user is logged in */
  userId?: string;
  /** For guest quote requests */
  guestEmail?: string;
  guestName?: string;
  items: OrderItem[];
  /** Applied coupon code (snapshot) */
  couponCode?: string;
  couponId?: string;
  discountPercentage?: number;
  subtotalInr: number;
  discountAmountInr: number;
  totalAmountInr: number;
  status: OrderStatus;
  /** Optional admin notes (internal) */
  adminNotes?: string;
  /** When quotation was sent to user (email) */
  quotationSentAt?: Date;
  /** Token for public view link (e.g. secure random) */
  viewToken?: string;
  /** When user accepted the quotation */
  acceptedAt?: Date;
  /** When user agreed / signed (consent) */
  signedAt?: Date;
  /** Snapshot of consent text or IP for records */
  signedConsent?: string;
  /** Optional quotation content (admin-editable, shown on PDF) */
  /** Before quoting: "view_only" = customer can only look at quotation; "confirm_via_admin" = booking confirmed when admin accepts */
  quotationMode?: "view_only" | "confirm_via_admin";
  quotationAdvancePercentage?: number;
  quotationIntro?: string;
  quotationPaymentTerms?: string;
  quotationValidity?: string;
  quotationTerms?: string;
  /** Optional extra sections on PDF: each has heading + content (order preserved) */
  quotationOtherSections?: { heading: string; content: string }[];
  /** Base64 data URL for logo (e.g. data:image/png;base64,...) - used only on PDF */
  quotationLogo?: string;
  /** Base64 data URL for signature image - used only on PDF */
  quotationSignature?: string;
  /** Company details on PDF */
  quotationCompanyName?: string;
  quotationCompanyAddress?: string;
  quotationCompanyEmail?: string;
  quotationCompanyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}
