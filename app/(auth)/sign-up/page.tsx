import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getUserId } from "@/server/helpers/session";

export const metadata = { title: "Create your account" };

export default async function SignUpPage() {
  if (await getUserId()) redirect("/dashboard");

  return <AuthForm mode="sign-up" />;
}
