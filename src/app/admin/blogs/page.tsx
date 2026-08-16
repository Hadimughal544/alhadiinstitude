import { BlogsAdminPanel } from "@/components/admin/blogs-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <BlogsAdminPanel
      posts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        attachmentUrl: p.attachmentUrl,
        attachmentName: p.attachmentName,
        attachmentType: p.attachmentType,
        status: p.status,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      }))}
    />
  );
}
