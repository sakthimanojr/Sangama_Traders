import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/config/site";
import { isAdminSession } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdminSession()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-bold">{site.name}</h1>
      <p className="mb-6 text-sm text-ink-600">Admin sign in</p>
      <LoginForm />
    </main>
  );
}
