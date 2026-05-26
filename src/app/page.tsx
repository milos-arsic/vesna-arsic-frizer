import { auth } from "@/auth";
import { PublicHomePage } from "@/components/PublicHomePage";
import { msg } from "@/lib/messages";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: msg.homeMetaTitle,
  description: msg.homeMetaDescription,
};

export default async function HomePage() {
  const session = await auth();

  if (session) {
    if (!session.user.phone) {
      redirect("/profile");
    }

    if (session.user.role === "admin") {
      redirect("/admin");
    }

    redirect("/calendar");
  }

  return <PublicHomePage />;
}
