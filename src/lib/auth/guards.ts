import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboardingUser() {
  const user = await requireUser();
  if (!user.profile?.onboardingCompleted) {
    redirect("/onboarding");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    redirect("/dashboard");
  }
  return user;
}
