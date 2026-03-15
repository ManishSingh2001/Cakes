"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface PageForm {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
  isPublished: boolean;
}

export default function NewPagePage() {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<PageForm>({
      defaultValues: {
        title: "",
        slug: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
        coverImage: "",
        isPublished: false,
      },
    });

  const titleValue = watch("title");
  useEffect(() => {
    if (titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, setValue]);

  const onSubmit = async (data: PageForm) => {
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Page created");
      router.push("/admin/pages");
    } catch {
      toast.error("Failed to create page");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Create New Page</h2>
        <p className="text-muted-foreground">Add a new static page</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input {...register("title", { required: true })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input {...register("slug", { required: true })} />
              </div>
            </div>

            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={watch("content")}
                onChange={(val) => setValue("content", val)}
              />
            </div>

            <div>
              <Label>Cover Image</Label>
              <ImageUploader
                value={watch("coverImage")}
                onChange={(url) => setValue("coverImage", url)}
                folder="pages"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input {...register("metaTitle")} />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea {...register("metaDescription")} rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={watch("isPublished")}
              onCheckedChange={(checked) => setValue("isPublished", !!checked)}
            />
            <Label>Publish</Label>
          </div>
          <Button type="submit" size="lg">
            Create Page
          </Button>
        </div>
      </form>
    </div>
  );
}
