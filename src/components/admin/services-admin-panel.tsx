"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { createServiceAction, updateServiceAction } from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { useServerAction } from "@/hooks/use-server-action";

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  heroImage: string | null;
  features: unknown;
  faqs: unknown;
  active: boolean;
};

type Feature = { title: string; description: string };
type Faq = { q: string; a: string };

function toFeatures(value: unknown): Feature[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    title: String((item as Feature)?.title ?? ""),
    description: String((item as Feature)?.description ?? ""),
  }));
}

function toFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    q: String((item as Faq)?.q ?? ""),
    a: String((item as Faq)?.a ?? ""),
  }));
}

type CreateValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  heroImage: string;
};

type EditValues = CreateValues & {
  active: boolean;
  features: Feature[];
  faqs: Faq[];
};

export function ServicesAdminPanel({ services }: { services: AdminService[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminService | null>(null);

  const close = () => {
    setOpen(null);
    router.refresh();
  };

  const columns: DataTableColumn<AdminService>[] = [
    {
      key: "title",
      header: "Service",
      render: (s) => (
        <div>
          <p className="font-semibold">{s.title}</p>
          <p className="text-xs text-muted">/{s.slug}</p>
        </div>
      ),
    },
    {
      key: "subtitle",
      header: "Subtitle",
      render: (s) => <span className="text-sm text-muted">{s.subtitle}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge variant={s.active ? "success" : "outline"}>{s.active ? "Active" : "Hidden"}</Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Services</h1>
          <p className="mt-1 text-sm text-muted">Manage public service pages and content.</p>
        </div>
        <Button type="button" onClick={() => setOpen("create")}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={services}
          onRowClick={(s) => setOpen(s)}
          emptyLabel="No services yet."
        />
      </div>

      <CreateServiceModal open={open === "create"} onClose={() => setOpen(null)} onSaved={close} />
      <EditServiceModal
        service={typeof open === "object" ? open : null}
        onClose={() => setOpen(null)}
        onSaved={close}
      />
    </div>
  );
}

function CreateServiceModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { run, pending, error, reset } = useServerAction(createServiceAction);
  const form = useForm<CreateValues>({
    defaultValues: { title: "", slug: "", subtitle: "", description: "", heroImage: "" },
  });

  const handleClose = () => {
    reset();
    form.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit((values) => {
    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("slug", values.slug);
    fd.set("subtitle", values.subtitle);
    fd.set("description", values.description);
    fd.set("heroImage", values.heroImage);
    run(fd, () => {
      form.reset();
      onSaved();
    });
  });

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title="Add service"
      description="Create a new service vertical for the public site."
    >
      {error && (
        <p className="mb-4 rounded-xl bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Title is required." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="auto-from-title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            rules={{ required: "Subtitle is required." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            rules={{ required: "Description is required." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heroImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create service"}
          </Button>
        </form>
      </Form>
    </AdminModal>
  );
}

function EditServiceModal({
  service,
  onClose,
  onSaved,
}: {
  service: AdminService | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { run, pending, error, reset } = useServerAction(updateServiceAction);
  const form = useForm<EditValues>({
    values: service
      ? {
          title: service.title,
          slug: service.slug,
          subtitle: service.subtitle,
          description: service.description,
          heroImage: service.heroImage ?? "",
          active: service.active,
          features: toFeatures(service.features),
          faqs: toFaqs(service.faqs),
        }
      : undefined,
  });

  const featureArray = useFieldArray({ control: form.control, name: "features" });
  const faqArray = useFieldArray({ control: form.control, name: "faqs" });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!service) return;
    const fd = new FormData();
    fd.set("id", service.id);
    fd.set("slug", service.slug);
    fd.set("title", values.title);
    fd.set("subtitle", values.subtitle);
    fd.set("description", values.description);
    fd.set("heroImage", values.heroImage);
    fd.set("active", values.active ? "on" : "off");
    fd.set("features", JSON.stringify(values.features));
    fd.set("faqs", JSON.stringify(values.faqs));
    run(fd, onSaved);
  });

  return (
    <AdminModal
      open={!!service}
      onClose={handleClose}
      title={service ? `Edit: ${service.title}` : "Edit service"}
      wide
    >
      {error && (
        <p className="mb-4 rounded-xl bg-destructive-muted px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {service && (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heroImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Features</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => featureArray.append({ title: "", description: "" })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add feature
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {featureArray.fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-xl border border-border bg-background/50 p-3"
                  >
                    <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted" />
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <Controller
                        control={form.control}
                        name={`features.${index}.title`}
                        render={({ field }) => <Input placeholder="Feature title" {...field} />}
                      />
                      <Controller
                        control={form.control}
                        name={`features.${index}.description`}
                        render={({ field }) => <Input placeholder="Feature description" {...field} />}
                      />
                    </div>
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
                {featureArray.fields.length === 0 && (
                  <p className="text-sm text-muted">No features yet.</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">FAQs</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => faqArray.append({ q: "", a: "" })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add FAQ
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {faqArray.fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-xl border border-border bg-background/50 p-3"
                  >
                    <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted" />
                    <div className="flex-1 space-y-2">
                      <Controller
                        control={form.control}
                        name={`faqs.${index}.q`}
                        render={({ field }) => <Input placeholder="Question" {...field} />}
                      />
                      <Controller
                        control={form.control}
                        name={`faqs.${index}.a`}
                        render={({ field }) => <Textarea rows={2} placeholder="Answer" {...field} />}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => faqArray.remove(index)}
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {faqArray.fields.length === 0 && <p className="text-sm text-muted">No FAQs yet.</p>}
              </div>
            </div>

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
                  <FormLabel className="!mt-0">Active</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save service"}
            </Button>
          </form>
        </Form>
      )}
    </AdminModal>
  );
}
