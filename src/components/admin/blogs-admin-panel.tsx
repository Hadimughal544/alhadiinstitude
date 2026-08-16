"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { BlogEditor } from "@/components/admin/blog-editor";

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Blogs</h1>
          <p className="mt-1 text-sm text-muted">
            Create and publish articles for the public blog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen("create")}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-foreground/15 px-5 py-10 text-center text-sm text-muted">
            No blog posts yet. Create your first article.
          </p>
        )}
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setOpen(post)}
            className="rounded-2xl border border-foreground/10 bg-card p-5 text-left shadow-sm transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-muted">/blog/{post.slug}</p>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs font-medium ${
                  post.status === "PUBLISHED"
                    ? "text-teal dark:text-gold"
                    : "text-muted"
                }`}
              >
                {post.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
          </button>
        ))}
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
