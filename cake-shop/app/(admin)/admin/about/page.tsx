"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface AboutForm {
  sectionTitle: string;
  heading: string;
  description: string;
  images: { url: string; alt: string; order: number }[];
  stats: { label: string; value: string; icon: string }[];
  teamMembers: { name: string; role: string; image: string; bio: string }[];
  isVisible: boolean;
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<AboutForm>({
      defaultValues: {
        sectionTitle: "Our Story",
        heading: "",
        description: "",
        images: [],
        stats: [],
        teamMembers: [],
        isVisible: true,
      },
    });

  const images = useFieldArray({ control, name: "images" });
  const stats = useFieldArray({ control, name: "stats" });
  const team = useFieldArray({ control, name: "teamMembers" });

  useEffect(() => {
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then((data) => {
        if (data) reset(data);
      })
      .catch(() => toast.error("Failed to load about data"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: AboutForm) => {
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("About section updated");
    } catch {
      toast.error("Failed to update about section");
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
      <div>
        <h2 className="font-heading text-2xl font-bold">About Section</h2>
        <p className="text-muted-foreground">
          Manage your about page content
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Section Title</Label>
                <Input {...register("sectionTitle")} />
              </div>
              <div>
                <Label>Heading</Label>
                <Input {...register("heading")} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <RichTextEditor
                content={watch("description")}
                onChange={(val) => setValue("description", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Images</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => images.append({ url: "", alt: "", order: images.fields.length })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Image
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {images.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex-1 space-y-2">
                  <ImageUploader
                    value={watch(`images.${index}.url`)}
                    onChange={(url) => setValue(`images.${index}.url`, url)}
                    folder="about"
                  />
                  <Input
                    placeholder="Alt text"
                    {...register(`images.${index}.alt`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => images.remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stats</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => stats.append({ label: "", value: "", icon: "" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Stat
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <Input placeholder="Label" {...register(`stats.${index}.label`)} />
                  <Input placeholder="Value" {...register(`stats.${index}.value`)} />
                  <Input placeholder="Icon name" {...register(`stats.${index}.icon`)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => stats.remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                team.append({ name: "", role: "", image: "", bio: "" })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input {...register(`teamMembers.${index}.name`)} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input {...register(`teamMembers.${index}.role`)} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => team.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label>Photo</Label>
                  <ImageUploader
                    value={watch(`teamMembers.${index}.image`)}
                    onChange={(url) => setValue(`teamMembers.${index}.image`, url)}
                    folder="team"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea {...register(`teamMembers.${index}.bio`)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save About Section
        </Button>
      </form>
    </div>
  );
}
