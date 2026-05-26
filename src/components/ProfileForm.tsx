"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { msg } from "@/lib/messages";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
};

type ProfileFormProps = {
  needsPhone?: boolean;
};

export function ProfileForm({ needsPhone = false }: ProfileFormProps) {
  const { update } = useSession();
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error(msg.error);
        const data = await response.json();
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
      } catch {
        setError(msg.error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? msg.profileSaveError);
        return;
      }

      const session = await update({
        phone: data.phone,
        name: data.name,
      });

      setForm({
        name: data.name ?? form.name,
        email: data.email ?? form.email,
        phone: data.phone ?? form.phone,
      });

      if (needsPhone) {
        if (!session?.user?.phone) {
          setError(msg.profileSaveError);
          return;
        }
        const destination = session.user.role === "admin" ? "/admin" : "/calendar";
        window.location.href = destination;
        return;
      }

      if (!session?.user?.phone) {
        setError(msg.profileSaveError);
        return;
      }

      setSuccess(true);
    } catch {
      setError(msg.profileSaveError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700">
          {msg.nameLabel}
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="w-full rounded-xl border border-stone-200 bg-white/90 px-4 py-3 text-base text-stone-900 outline-none sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
          {msg.emailLabel}
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500"
        />
        <p className="mt-2 text-sm text-stone-500">{msg.emailReadOnlyHint}</p>
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-stone-700">
          {msg.phoneLabel}
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder={msg.phonePlaceholder}
          className="w-full rounded-xl border border-stone-200 bg-white/90 px-4 py-3 text-base text-stone-900 outline-none sm:text-sm"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {msg.profileSaved}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary min-h-11 px-5 py-3 text-sm"
      >
        {saving ? msg.saving : needsPhone ? msg.continueBtn : msg.save}
      </button>
    </form>
  );
}
