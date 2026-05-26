import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.phone) {
    redirect("/profile");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  redirect("/calendar");
}
