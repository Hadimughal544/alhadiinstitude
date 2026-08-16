import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alhadiinstitute.com";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function attachmentLabel(type: string | null) {
  if (!type) return "Download file";
  if (type === "pdf") return "Download PDF";
  if (type === "docx" || type === "doc") return "Download Word document";
  return "Download file";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) return { title: "Article not found" };

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription ||
    post.excerpt ||
    `Read ${post.title} on the Al-Hadi Institute blog.`;

  return {
    title,
    description,
    keywords: [
      post.title,
      "Al-Hadi Institute",
      "Quran education",
      "online tuition",
      "IT services",
    ],
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  const dateLabel = formatDate(post.publishedAt ?? post.createdAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.metaDescription || undefined,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Al-Hadi Institute",
    },
    publisher: {
      "@type": "Organization",
      name: "Al-Hadi Institute",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <article className="mesh-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <Link
          href="/blog"
          className="text-sm font-semibold text-muted transition hover:text-teal dark:hover:text-gold"
        >
          ← All articles
        </Link>

        <header className="mt-8">
          {dateLabel && (
            <time className="text-xs font-bold uppercase tracking-[0.18em] text-teal dark:text-gold">
              {dateLabel}
            </time>
          )}
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-foreground">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.coverImage && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-border/50 dark:ring-gold/15">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {post.attachmentUrl && (
          <a
            href={post.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            download={post.attachmentName || undefined}
            className="mt-8 flex items-center gap-3 rounded-2xl border border-teal/25 bg-teal/5 px-4 py-4 transition hover:border-gold/50 hover:bg-gold/10 dark:border-gold/25 dark:bg-gold/5 sm:px-5"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal text-cream dark:bg-gold dark:text-ink">
              <Download className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">
                {attachmentLabel(post.attachmentType)}
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted">
                {post.attachmentName || "Attached file"}
              </span>
            </span>
          </a>
        )}

        <div
          className="prose-blog mt-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
