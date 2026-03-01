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

export interface Service {
  _id: string;
  title: string;
  description: string;
  features: string[];
  pricing: ServicePricing;
  createdAt: Date;
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
}
