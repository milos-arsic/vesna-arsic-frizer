import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ShopFooter } from "@/components/ShopFooter";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={<LoadingSpinner className="min-h-full flex-1" />}>
        <LoginForm />
      </Suspense>
      <ShopFooter />
    </div>
  );
}
