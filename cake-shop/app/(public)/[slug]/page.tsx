import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { CustomPage } from "@/lib/models/CustomPage";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  await connectDB();
  const page = await CustomPage.findOne({ slug, isPublished: true }).lean();
  return page ? JSON.parse(JSON.stringify(page)) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || "",
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        {page.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={page.coverImage}
              alt={page.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h1 className="heading-primary">{page.title}</h1>
        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
