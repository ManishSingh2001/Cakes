import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Update } from "@/lib/models/Update";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getUpdate(slug: string) {
  await connectDB();
  const update = await Update.findOne({ slug, isPublished: true }).lean();
  return update ? JSON.parse(JSON.stringify(update)) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const update = await getUpdate(slug);
  if (!update) return { title: "Update Not Found" };
  return {
    title: update.title,
    description: update.excerpt || "",
  };
}

export default async function UpdatePage({ params }: Props) {
  const { slug } = await params;
  const update = await getUpdate(slug);
  if (!update) notFound();

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        {update.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={update.coverImage}
              alt={update.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{update.category}</Badge>
          <span className="text-muted-foreground text-sm">
            {formatDate(update.publishedAt || update.createdAt)}
          </span>
        </div>
        <h1 className="heading-primary">{update.title}</h1>
        {update.excerpt && (
          <p className="text-muted-foreground mt-2 text-lg">{update.excerpt}</p>
        )}
        {update.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {update.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: update.content }}
        />
      </div>
    </div>
  );
}
