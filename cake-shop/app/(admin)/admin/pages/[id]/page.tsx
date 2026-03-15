"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) reset(data);
      })
      .catch(() => toast.error("Failed to load page"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: PageForm) => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Page updated");
    } catch {
      toast.error("Failed to update page");
    }
  };

  const deletePage = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Page deleted");
      router.push("/admin/pages");
    } catch {
      toast.error("Failed to delete page");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Edit Page</h2>
          <p className="text-muted-foreground">Update page content</p>
        </div>
        <Button variant="destructive" onClick={deletePage}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete Page
        </Button>
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
            <Label>Published</Label>
          </div>
          <Button type="submit" size="lg">
            Update Page
          </Button>
        </div>
      </form>
    </div>
  );
}
