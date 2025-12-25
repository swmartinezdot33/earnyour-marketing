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

export async function getOrCreateUser(email: string, name?: string) {
  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser({
      email: email.toLowerCase(),
      name: name || null,
      role: "student",
      ghl_contact_id: null,
      ghl_location_id: null,
      whitelabel_id: null,
      status: "active",
      deleted_at: null,
    });
    
    // Sync new user to GHL in the appropriate location
    try {
      const { syncUserToGHL } = await import("@/lib/ghl/contacts");
      await syncUserToGHL(user.id);
    } catch (error) {
      console.error("Error syncing new user to GHL:", error);
      // Don't fail user creation if GHL sync fails
    }
  }
  return user;
}

