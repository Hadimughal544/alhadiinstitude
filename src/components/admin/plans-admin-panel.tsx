"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { createPlanAction, updatePlanAction } from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PLAN_CURRENCIES } from "@/lib/currencies";
import { useServerAction } from "@/hooks/use-server-action";

export type AdminPlan = {
  id: string;
  name: string;
  badge: string | null;
  classesOrHours: string | null;
  durationMins: number | null;
  features: unknown;
  featured: boolean;
  active: boolean;
  service: { id: string; title: string };
  prices: Array<{ currencyCode: string; amount: string }>;
};

function toFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? ""));
}

type CreateValues = {
  serviceId: string;
  name: string;
  badge: string;
  classesOrHours: string;
  durationMins: string;
  baseGbp: string;
  featured: boolean;
};

type EditValues = {
  name: string;
  badge: string;
  classesOrHours: string;
  durationMins: string;
  featured: boolean;
  active: boolean;
  features: string[];
  prices: Record<string, string>;
};

export function PlansAdminPanel({
  plans,
  services,
}: {
  plans: AdminPlan[];
  services: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminPlan | null>(null);

  const close = () => {
    setOpen(null);
    router.refresh();
  };

  const columns: DataTableColumn<AdminPlan>[] = [
    {
      key: "name",
      header: "Plan",
      render: (p) => (
        <div>
          <p className="font-semibold">{p.service.title} — {p.name}</p>
          <p className="text-xs text-muted">{p.prices.length} currencies</p>
        </div>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (p) => (
        <Badge variant={p.featured ? "teal" : "outline"}>{p.featured ? "Featured" : "Standard"}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge variant={p.active ? "success" : "outline"}>{p.active ? "Active" : "Hidden"}</Badge>,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Plans & Prices</h1>
          <p className="mt-1 text-sm text-muted">Edit packages and multi-currency pricing.</p>
        </div>
        <Button type="button" onClick={() => setOpen("create")}>
          <Plus className="h-4 w-4" /> Add plan
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={plans} onRowClick={(p) => setOpen(p)} emptyLabel="No plans yet." />
      </div>

      <CreatePlanModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        onSaved={close}
        services={services}
      />
      <EditPlanModal plan={typeof open === "object" ? open : null} onClose={() => setOpen(null)} onSaved={close} />
    </div>
  );
}

function CreatePlanModal({
  open,
  onClose,
  onSaved,
  services,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  services: Array<{ id: string; title: string }>;
}) {
  const { run, pending, error, reset } = useServerAction(createPlanAction);
  const form = useForm<CreateValues>({
    defaultValues: {
      serviceId: "",
      name: "",
      badge: "",
      classesOrHours: "",
      durationMins: "",
      baseGbp: "",
      featured: false,
    },
  });

  const handleClose = () => {
    reset();
    form.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit((values) => {
    const fd = new FormData();
    fd.set("serviceId", values.serviceId);
    fd.set("name", values.name);
    fd.set("badge", values.badge);
    fd.set("classesOrHours", values.classesOrHours);
    fd.set("durationMins", values.durationMins);
    fd.set("baseGbp", values.baseGbp);
    fd.set("featured", values.featured ? "on" : "off");
    run(fd, () => {
      form.reset();
      onSaved();
    });
  });

  return (
    <AdminModal open={open} onClose={handleClose} title="Add plan" description="Optional GBP amount seeds all currencies.">
      {error && (
        <p className="mb-4 rounded-xl bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="serviceId"
            rules={{ required: "Select a service." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <FormControl>
                  <Select {...field} required>
                    <option value="">Select service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Plan name is required." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan name</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="badge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classesOrHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classes / Hours</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (mins)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="baseGbp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price in GBP</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </FormControl>
                <FormLabel className="mt-0!">Featured plan</FormLabel>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create plan"}
          </Button>
        </form>
      </Form>
    </AdminModal>
  );
}

function EditPlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminPlan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { run, pending, error, reset } = useServerAction(updatePlanAction);
  const form = useForm<EditValues>({
    values: plan
      ? {
          name: plan.name,
          badge: plan.badge ?? "",
          classesOrHours: plan.classesOrHours ?? "",
          durationMins: plan.durationMins != null ? String(plan.durationMins) : "",
          featured: plan.featured,
          active: plan.active,
          features: toFeatures(plan.features),
          prices: Object.fromEntries(
            PLAN_CURRENCIES.map((code) => [
              code,
              plan.prices.find((p) => p.currencyCode === code)?.amount ?? "",
            ])
          ),
        }
      : undefined,
  });

  const featureArray = useFieldArray({
    control: form.control,
    name: "features" as never,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!plan) return;
    const fd = new FormData();
    fd.set("id", plan.id);
    fd.set("name", values.name);
    fd.set("badge", values.badge);
    fd.set("classesOrHours", values.classesOrHours);
    fd.set("durationMins", values.durationMins);
    fd.set("featured", values.featured ? "on" : "off");
    fd.set("active", values.active ? "on" : "off");
    fd.set("features", JSON.stringify(values.features));
    for (const code of PLAN_CURRENCIES) {
      fd.set(`price_${code}`, values.prices[code] ?? "");
    }
    run(fd, onSaved);
  });

  return (
    <AdminModal
      open={!!plan}
      onClose={handleClose}
      title={plan ? `${plan.service.title} — ${plan.name}` : "Edit plan"}
      wide
    >
      {error && (
        <p className="mb-4 rounded-xl bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {plan && (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classesOrHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes / Hours</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Features</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => featureArray.append("")}>
                  <Plus className="h-3.5 w-3.5" /> Add feature
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {featureArray.fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background/50 p-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted" />
                    <Controller
                      control={form.control}
                      name={`features.${index}` as const}
                      render={({ field }) => (
                        <Input placeholder="Feature" className="flex-1" {...field} />
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => featureArray.remove(index)}
                      aria-label="Remove feature"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {featureArray.fields.length === 0 && <p className="text-sm text-muted">No features yet.</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </FormControl>
                    <FormLabel className="mt-0!">Featured</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </FormControl>
                    <FormLabel className="mt-0!">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Prices by currency</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {PLAN_CURRENCIES.map((code) => (
                  <FormField
                    key={code}
                    control={form.control}
                    name={`prices.${code}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{code}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save plan"}
            </Button>
          </form>
        </Form>
      )}
    </AdminModal>
  );
}
