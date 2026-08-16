import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alhadiinstitute.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles and insights from Al-Hadi Institute on Quran learning, online tuition, and IT education.",
  keywords: [
    "Al-Hadi Institute blog",
    "Quran learning tips",
    "online tuition",
    "Islamic education",
    "IT training articles",
  ],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: "Blog | Al-Hadi Institute",
    description:
      "Articles and insights on Quran learning, online tuition, and IT education.",
    type: "website",
    url: `${siteUrl}/blog`,
  },
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mesh-bg">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal dark:text-gold">
            Insights & guidance
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4rem)] font-extrabold tracking-tight text-foreground">
            Blog
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Guidance and updates from Al-Hadi Institute — faith, learning, and technology for families worldwide.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center text-muted dark:border-gold/20">
            New articles are coming soon. Check back shortly.
          </p>
        ) : (
          <ul className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
            {posts.map((post) => {
              const dateLabel = formatDate(post.publishedAt ?? post.createdAt);
              return (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <article className="flex h-full flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-border/60 transition duration-500 group-hover:ring-gold/50 dark:ring-white/10">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-teal/50 via-teal/25 to-gold/35" />
                        )}
                      </div>
                      <div className="mt-5 flex flex-1 flex-col">
                        {dateLabel && (
                          <time className="text-xs font-semibold uppercase tracking-[0.16em] text-teal dark:text-gold">
                            {dateLabel}
                          </time>
                        )}
                        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground transition group-hover:text-teal dark:group-hover:text-gold sm:text-[1.65rem]">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="mt-5 text-sm font-bold text-teal dark:text-gold">
                          Read article →
                        </span>
                      </div>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
