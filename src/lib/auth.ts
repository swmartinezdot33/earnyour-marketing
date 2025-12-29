import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { getUserByEmail, createUser } from "@/lib/db/users";

const secretKey = process.env.MAGIC_LINK_SECRET || "fallback-secret-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role?: "admin" | "student";
  expiresAt: number;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, email: string, role: "admin" | "student" = "student"): Promise<string> {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const session = await encrypt({ userId, email, role, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
  
  return session;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  
  const payload = await decrypt(session);
  if (!payload || payload.expiresAt < Date.now()) {
    return null;
  }
  
  return payload;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// List of admin emails - these will automatically get admin role
const ADMIN_EMAILS = [
  "steven@earnyour.com",
  // Add more admin emails here
];

export async function getOrCreateUser(email: string, name?: string) {
  const emailLower = email.toLowerCase();
  const isAdminEmail = ADMIN_EMAILS.includes(emailLower);
  
  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser({
      email: emailLower,
      name: name || null,
      role: isAdminEmail ? "admin" : "student",
      status: "active",
      deleted_at: null,
      // GHL fields are optional and will default to null in database
      ghl_contact_id: null,
      ghl_location_id: null,
      whitelabel_id: null,
    });
  } else if (isAdminEmail && user.role !== "admin") {
    // If user exists but should be admin, update their role
    const { updateUser } = await import("@/lib/db/users");
    user = await updateUser(user.id, { role: "admin" });
  }
  return user;
}

