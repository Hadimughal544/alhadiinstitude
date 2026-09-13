"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { BlogEditor } from "@/components/admin/blog-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string | null;
  metaDescription: string | null;
};

export function BlogsAdminPanel({ posts }: { posts: AdminBlogPost[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminBlogPost | null>(null);

  const close = () => {
    setOpen(null);
    router.refresh();
  };

  const columns: DataTableColumn<AdminBlogPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (post) => (
        <div className="min-w-0">
          <p className="font-semibold">{post.title}</p>
          <p className="text-sm text-muted">/blog/{post.slug}</p>
        </div>
      ),
    },
    {
      key: "excerpt",
      header: "Excerpt",
      render: (post) => (
        <p className="line-clamp-2 max-w-md text-sm text-muted">{post.excerpt || "—"}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (post) => (
        <Badge variant={post.status === "PUBLISHED" ? "teal" : "outline"}>
          {post.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Blogs</h1>
          <p className="mt-1 text-sm text-muted">
            Create and publish articles for the public blog.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen("create")} className="gap-1.5">
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={posts}
          onRowClick={(post) => setOpen(post)}
          emptyLabel="No blog posts yet. Create your first article."
        />
      </div>

      <AdminModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="New blog post"
        description="Write and publish with cover image, rich content, and optional PDF/Word."
        wide
      >
        <BlogEditor mode="create" onSuccess={close} />
      </AdminModal>

      <AdminModal
        open={typeof open === "object" && open !== null}
        onClose={() => setOpen(null)}
        title="Edit post"
        description={typeof open === "object" && open ? `/blog/${open.slug}` : undefined}
        wide
      >
        {typeof open === "object" && open && (
          <BlogEditor mode="edit" post={open} onSuccess={close} />
        )}
      </AdminModal>
    </div>
  );
}
