import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getUserId } from "@/server/helpers/session";

export const metadata = { title: "Sign in" };

export default async function SignInPage() {
  // Already signed in: no reason to see this page.
  if (await getUserId()) redirect("/dashboard");

  return <AuthForm mode="sign-in" />;
}
