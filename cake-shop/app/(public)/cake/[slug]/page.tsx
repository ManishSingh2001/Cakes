import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { Addon } from "@/lib/models/Addon";
import { CakeDetail } from "@/components/public/CakeDetail";
import { RelatedCakes } from "@/components/public/RelatedCakes";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCake(slug: string) {
  await connectDB();
  const cake = await Cake.findOne({ slug, isAvailable: true }).lean();
  if (!cake) return null;

  const [addons, relatedCakes] = await Promise.all([
    Addon.find({ isAvailable: true }).sort({ order: 1 }).lean(),
    Cake.find({
      _id: { $ne: cake._id },
      isAvailable: true,
      $or: [{ category: cake.category }, { caketype: cake.caketype }],
    })
      .select("name slug images prices category caketype type averageRating totalReviews isFeatured")
      .limit(8)
      .lean(),
  ]);

  return {
    cake: JSON.parse(JSON.stringify(cake)),
    addons: JSON.parse(JSON.stringify(addons)),
    relatedCakes: JSON.parse(JSON.stringify(relatedCakes)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const cake = await Cake.findOne({ slug }).lean();
  if (!cake) return { title: "Cake Not Found" };
  return {
    title: cake.name,
    description: cake.description?.slice(0, 160) || `Order ${cake.name} online`,
  };
}

export default async function CakePage({ params }: Props) {
  const { slug } = await params;
  const data = await getCake(slug);
  if (!data) notFound();

  return (
    <>
      <div className="section-padding">
        <div className="container-custom">
          <CakeDetail cake={data.cake} addons={data.addons} />
        </div>
      </div>
      {data.relatedCakes.length > 0 && (
        <RelatedCakes cakes={data.relatedCakes} />
      )}
    </>
  );
}
