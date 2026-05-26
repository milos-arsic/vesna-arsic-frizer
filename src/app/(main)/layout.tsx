import { auth } from "@/auth";
import { ShopFooter } from "@/components/ShopFooter";
import { TopNav } from "@/components/TopNav";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="relative flex min-h-full flex-col">
      <TopNav user={session.user} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}
