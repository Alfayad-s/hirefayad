import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import type { User, Service, Coupon, Order } from "@/types";

type WithObjectId<T> = Omit<T, "_id"> & { _id: ObjectId };

const globalForDb = globalThis as unknown as { client: MongoClient | null; db: Db | null };

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (globalForDb.client) {
    return globalForDb.db!;
  }

  const client = new MongoClient(uri, {
    // Avoids ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR with MongoDB Atlas (Node IPv4/IPv6 + TLS)
    autoSelectFamily: false,
  });
  await client.connect();
  const db = client.db();
  globalForDb.client = client;
  globalForDb.db = db;
  return db;
}

export async function getDb(): Promise<Db> {
  return connect();
}

export async function getUsersCollection(): Promise<Collection<WithObjectId<User>>> {
  const db = await getDb();
  return db.collection<WithObjectId<User>>("users");
}

export async function getServicesCollection(): Promise<Collection<WithObjectId<Service>>> {
  const db = await getDb();
  return db.collection<WithObjectId<Service>>("services");
}

export async function getCouponsCollection(): Promise<Collection<WithObjectId<Coupon>>> {
  const db = await getDb();
  return db.collection<WithObjectId<Coupon>>("coupons");
}

export async function getOrdersCollection(): Promise<Collection<WithObjectId<Order>>> {
  const db = await getDb();
  return db.collection<WithObjectId<Order>>("orders");
}

/** Serialize MongoDB document for API (ObjectId -> string) */
export function toJson<T extends { _id: ObjectId }>(doc: T): Omit<T, "_id"> & { _id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, _id: _id.toString() } as Omit<T, "_id"> & { _id: string };
}
