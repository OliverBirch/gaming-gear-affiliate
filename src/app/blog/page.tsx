import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Nyheder, guides og analyser om gaming-mus, pro settings og esport. Følg med i roster moves, nye launches og tendenser.",
};

export default function BlogPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground mb-10">
          Nyheder, guides og analyser om gaming-mus og esport.
        </p>

        <div className="space-y-8">
          {blogPosts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <time className="text-xs text-muted-foreground" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("da-DK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="text-xl font-semibold mt-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
        </div>
      </div>

      <Script
        id="schema-blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://prosetups.dk/blog" },
            ],
          }),
        }}
      />
    </>
  );
}
