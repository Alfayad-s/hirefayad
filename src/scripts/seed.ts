/**
 * Seed script: run with `npm run db:seed`
 * Requires MONGODB_URI in .env.local or .env
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { getDb, getUsersCollection, getServicesCollection, getCouponsCollection } from "../lib/db";

const services = [
  {
    title: "Portfolio Website Development",
    description: "A professional portfolio site to showcase your work and attract clients.",
    features: [
      "Responsive design",
      "Custom UI/UX",
      "SEO optimization",
      "Contact form integration",
    ],
    pricing: { basic: 4999, pro: 7999, premium: 12999 },
    createdAt: new Date(),
  },
  {
    title: "E-Commerce Website Development",
    description: "Full online store with products, cart, checkout, and admin.",
    features: [
      "Product listing",
      "Cart & checkout",
      "Payment integration",
      "Admin dashboard",
      "Coupon system",
      "Order management",
    ],
    pricing: { basic: 15999, pro: 29999, premium: 49999 },
    createdAt: new Date(),
  },
  {
    title: "Business Website Development",
    description: "Clean business site with key pages and SEO.",
    features: [
      "Homepage",
      "About page",
      "Services page",
      "Contact page",
      "SEO optimization",
    ],
    pricing: { basic: 8999, pro: 14999, premium: 24999 },
    createdAt: new Date(),
  },
  {
    title: "Custom Full Stack Development",
    description: "Bespoke web applications with frontend, backend, and database.",
    features: [
      "Frontend (React / Next.js)",
      "Backend (Node.js / Express)",
      "Database integration",
      "Authentication system",
      "Admin dashboard",
    ],
    pricing: { basic: 35000, pro: 35000, premium: 35000 },
    createdAt: new Date(),
  },
  {
    title: "Landing Page & Marketing Sites",
    description: "High-converting landing pages and marketing websites for campaigns and product launches.",
    features: [
      "Single or multi-page layout",
      "Lead capture forms",
      "Analytics integration",
      "A/B testing ready",
      "Fast load times",
    ],
    pricing: { basic: 3999, pro: 6999, premium: 11999 },
    createdAt: new Date(),
  },
];

const coupons = [
  { code: "STUDENT20", discountPercentage: 20, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 100, usedCount: 0, isActive: true },
  { code: "STARTUP15", discountPercentage: 15, expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 50, usedCount: 0, isActive: true },
  { code: "FIRST10", discountPercentage: 10, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 200, usedCount: 0, isActive: true },
  { code: "LAUNCH25", discountPercentage: 25, expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), usageLimit: 75, usedCount: 0, isActive: true },
  { code: "VIP30", discountPercentage: 30, expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), usageLimit: 30, usedCount: 0, isActive: true },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Create .env.local with MONGODB_URI.");
    process.exit(1);
  }

  const db = await getDb();
  console.log("Connected to MongoDB");

  const servicesCol = await getServicesCollection();
  const existingServices = await servicesCol.countDocuments();
  if (existingServices === 0) {
    await servicesCol.insertMany(services);
    console.log(`Inserted ${services.length} services`);
  } else {
    console.log("Services already exist, skipping");
  }

  const couponsCol = await getCouponsCollection();
  for (const coupon of coupons) {
    const exists = await couponsCol.findOne({ code: coupon.code });
    if (!exists) {
      await couponsCol.insertOne({ ...coupon });
      console.log(`Inserted coupon: ${coupon.code}`);
    }
  }
  console.log("Coupons seeded");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
