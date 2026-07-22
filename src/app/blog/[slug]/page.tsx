import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { blogPosts, getBlogPost } from "@/data/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Tilbage til blog
        </Link>

        <header className="mb-8">
          <time
            className="text-xs text-muted-foreground"
            dateTime={post.date}
          >
            {new Date(post.date).toLocaleDateString("da-DK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 mb-4">
            {post.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {post.description}
          </p>
          <div className="flex gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4 leading-relaxed">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-semibold text-foreground mt-8 mb-3">
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith("- **")) {
              const match = line.match(/^- \*\*(.+?)\*\*:(.+)$/);
              if (match) {
                return (
                  <p key={i} className="ml-4">
                    <strong className="text-foreground">{match[1]}:</strong>
                    {match[2]}
                  </p>
                );
              }
            }
            if (line === "") return null;
            return (
              <p key={i}>
                {line}
              </p>
            );
          })}
        </div>
      </article>

      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: {
              "@type": "Organization",
              name: "ProSetups.dk",
            },
          }),
        }}
      />

      <Script
        id="schema-blog-post-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://prosetups.dk/blog" },
              { "@type": "ListItem", position: 3, name: post.title, item: `https://prosetups.dk/blog/${post.slug}` },
            ],
          }),
        }}
      />
    </>
  );
}
