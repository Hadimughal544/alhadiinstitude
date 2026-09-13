"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<AdminPerson | null>(null);

  const title = kind === "teacher" ? "Teachers" : "Students";
  const extraLabel = kind === "teacher" ? "Specialization" : "Age group";
  const extraName = kind === "teacher" ? "specialization" : "ageGroup";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.countryName?.toLowerCase().includes(q) ?? false)
    );
  }, [people, search]);

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

  const columns: DataTableColumn<AdminPerson>[] = [
    {
      key: "name",
      header: "Name",
      render: (person) => (
        <div>
          <p className="font-medium">{person.name}</p>
          <p className="text-xs text-muted">{person.email}</p>
        </div>
      ),
    },
    {
      key: "meta",
      header: kind === "teacher" ? "Specialization" : "Age group",
      render: (person) => (
        <span className="text-sm text-muted">
          {[person.countryName, person.extra].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "count",
      header: kind === "teacher" ? "Lectures" : "Enrollments",
      className: "text-center",
      render: (person) => person.count,
    },
    {
      key: "active",
      header: "Status",
      render: (person) => (
        <Badge variant={person.active ? "success" : "outline"}>
          {person.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (person) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Actions for ${person.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={() => {
                setError(null);
                setOpen(person);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={pending}
              onClick={() => run(() => resetPasswordAction(person.id))}
            >
              Reset password
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={pending}
              onClick={() => run(() => setActiveAction(person.id, !person.active))}
            >
              {person.active ? "Deactivate" : "Reactivate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={pending}
              className="text-red-600 dark:text-red-400"
              onClick={() => setConfirmDelete(person)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        description="Admin-created accounts. People sign in at /login with the password you set or generate."
        action={
          <Button
            type="button"
            onClick={() => {
              setError(null);
              setOpen("create");
            }}
          >
            <Plus className="h-4 w-4" /> Add {kind}
          </Button>
        }
      />

      <Input
        placeholder={`Search ${kind}s…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-md"
      />

      {passwordNotice && (
        <Card className="mb-4 border-gold/40 bg-gold/10">
          <CardContent className="p-4">
            <p className="font-medium">Copy this password now. It will not be shown again.</p>
            <p className="mt-2 select-all font-mono text-base">{passwordNotice}</p>
            <button
              type="button"
              className="mt-3 text-sm text-muted underline"
              onClick={() => setPasswordNotice(null)}
            >
              Dismiss
            </button>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        emptyLabel={`No ${kind}s found.`}
        onRowClick={(person) => {
          setError(null);
          setOpen(person);
        }}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(null);
        }}
        title={`Delete this ${kind}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => {
          if (!confirmDelete) return;
          const target = confirmDelete;
          run(
            () => deleteAction(target.id),
            () => {
              setConfirmDelete(null);
              close();
            }
          );
        }}
      />

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
            {countries.length > 0 && (
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
                    onClick={() => run(() => resetPasswordAction(open.id), () => close())}
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
                    onClick={() => setConfirmDelete(open)}
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
