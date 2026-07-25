import { notFound } from "next/navigation";
import { updateServiceAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Edit: {service.title}</h1>
      <form action={updateServiceAction} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="slug" value={service.slug} />

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Title</span>
          <input name="title" defaultValue={service.title} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subtitle</span>
          <input name="subtitle" defaultValue={service.subtitle} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea name="description" rows={4} defaultValue={service.description} className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Hero image URL</span>
          <input name="heroImage" defaultValue={service.heroImage ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Features (JSON)</span>
          <textarea
            name="features"
            rows={8}
            defaultValue={JSON.stringify(service.features, null, 2)}
            className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">FAQs (JSON)</span>
          <textarea
            name="faqs"
            rows={8}
            defaultValue={JSON.stringify(service.faqs, null, 2)}
            className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service.active} />
          Active
        </label>
        <Button type="submit">Save service</Button>
      </form>
    </div>
  );
}
