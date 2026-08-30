"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import type { UserActionResult } from "@/actions/admin/users";
import { toActionError } from "@/lib/action-result";

export type AdminPerson = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  extra: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  active: boolean;
  count: number;
};

export type AdminCountryOption = { code: string; name: string };

type PeopleKind = "teacher" | "student";

export function PeopleAdminPanel({
  kind,
  people,
  countries = [],
  createAction,
  updateAction,
  setActiveAction,
  deleteAction,
  resetPasswordAction,
}: {
  kind: PeopleKind;
  people: AdminPerson[];
  countries?: AdminCountryOption[];
  createAction: (formData: FormData) => Promise<UserActionResult>;
  updateAction: (formData: FormData) => Promise<UserActionResult>;
  setActiveAction: (id: string, active: boolean) => Promise<UserActionResult>;
  deleteAction: (id: string) => Promise<UserActionResult>;
  resetPasswordAction: (id: string) => Promise<UserActionResult>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminPerson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title = kind === "teacher" ? "Teachers" : "Students";
  const extraLabel = kind === "teacher" ? "Specialization" : "Age group";
  const extraName = kind === "teacher" ? "specialization" : "ageGroup";
  const countLabel = kind === "teacher" ? "lectures" : "enrollments";

  const close = () => {
    setOpen(null);
    setError(null);
    router.refresh();
  };

  const run = (task: () => Promise<UserActionResult>, after?: (result: Extract<UserActionResult, { ok: true }>) => void) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (result.generatedPassword) {
          setPasswordNotice(result.generatedPassword);
        }
        after?.(result);
      } catch (e) {
        setError(toActionError(e));
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            Admin-created accounts. People sign in at /login with the password you set or generate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen("create");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add {kind}
        </button>
      </div>

      {passwordNotice && (
        <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          <p className="font-medium">Copy this password now. It will not be shown again.</p>
          <p className="mt-2 select-all font-mono text-base">{passwordNotice}</p>
          <button
            type="button"
            className="mt-3 text-sm text-muted underline"
            onClick={() => setPasswordNotice(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {people.length === 0 && (
          <p className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center text-sm text-muted">
            No {kind}s yet.
          </p>
        )}
        {people.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => {
              setError(null);
              setOpen(person);
            }}
            className="rounded-2xl border border-foreground/10 bg-card p-4 text-left shadow-sm transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-muted">{person.email}</p>
                {kind === "student" && person.countryName && (
                  <p className="mt-1 text-xs text-muted">{person.countryName}</p>
                )}
                {person.extra && <p className="mt-1 text-xs text-muted">{person.extra}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs">
                  {person.count} {countLabel}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    person.active ? "bg-teal/10 text-teal dark:bg-gold/15 dark:text-gold" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {person.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <AdminModal
        open={open !== null}
        onClose={close}
        title={open === "create" ? `Add ${kind}` : `Edit ${kind}`}
        description={
          open === "create"
            ? "Leave password blank to generate one."
            : "Update details, reset the password, or remove the account."
        }
      >
        {open && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              run(
                () => (open === "create" ? createAction(formData) : updateAction(formData)),
                () => close()
              );
            }}
          >
            {open !== "create" && <input type="hidden" name="id" value={open.id} />}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Name</span>
              <input
                name="name"
                required
                defaultValue={open === "create" ? "" : open.name}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={open === "create" ? "" : open.email}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Phone</span>
              <input
                name="phone"
                defaultValue={open === "create" ? "" : open.phone ?? ""}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">{extraLabel}</span>
              <input
                name={extraName}
                defaultValue={open === "create" ? "" : open.extra ?? ""}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
            {kind === "student" && (
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Country</span>
                <select
                  name="countryCode"
                  required
                  defaultValue={open === "create" ? "" : open.countryCode ?? ""}
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {open === "create" && (
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Password (optional)</span>
                <input
                  name="password"
                  type="text"
                  minLength={8}
                  placeholder="Leave blank to generate"
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                />
              </label>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : open === "create" ? "Create" : "Save"}
              </Button>
              {open !== "create" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      run(() => resetPasswordAction(open.id), () => close())
                    }
                  >
                    Reset password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      run(
                        () => setActiveAction(open.id, !open.active),
                        () => close()
                      )
                    }
                  >
                    {open.active ? "Deactivate" : "Reactivate"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`Delete this ${kind}? This cannot be undone.`)) return;
                      run(() => deleteAction(open.id), () => close());
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
