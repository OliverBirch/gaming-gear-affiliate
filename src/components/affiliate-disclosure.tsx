import Link from "next/link";

export function AffiliateDisclosure() {
  return (
    <div className="bg-muted/50 border-t py-3 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-5xl px-4">
        Nogle links på denne side er affiliate-links. Hvis du handler via vores links,
        kan vi modtage en provision uden ekstra omkostning for dig. Læs mere på{" "}
<Link href="/transparens" className="underline">
        vores transparens-side
        </Link>
        .
      </div>
    </div>
  );
}
