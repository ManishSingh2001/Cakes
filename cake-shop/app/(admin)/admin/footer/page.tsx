"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface FooterLink {
  label: string;
  href: string;
  isExternal: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
  order: number;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterForm {
  logo: {
    imageUrl: string;
    altText: string;
  };
  description: string;
  sections: FooterSection[];
  socialLinks: SocialLink[];
  copyrightText: string;
}

export default function FooterPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<FooterForm>({
      defaultValues: {
        logo: { imageUrl: "", altText: "" },
        description: "",
        sections: [],
        socialLinks: [],
        copyrightText: "",
      },
    });

  const sections = useFieldArray({ control, name: "sections" });
  const socialLinks = useFieldArray({ control, name: "socialLinks" });

  useEffect(() => {
    fetch("/api/admin/footer")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) reset(res.data);
      })
      .catch(() => toast.error("Failed to load footer data"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FooterForm) => {
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Footer updated");
    } catch {
      toast.error("Failed to update footer");
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
        <h2 className="font-heading text-2xl font-bold">Footer Settings</h2>
        <p className="text-muted-foreground">Manage footer content and links</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Description */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Footer Logo</Label>
              <ImageUploader
                value={watch("logo.imageUrl")}
                onChange={(url) => setValue("logo.imageUrl", url)}
                folder="branding"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input {...register("logo.altText")} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Footer Sections</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                sections.append({
                  title: "",
                  links: [{ label: "", href: "", isExternal: false }],
                  order: sections.fields.length,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.fields.map((section, sIdx) => (
              <div key={section.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Section title"
                    {...register(`sections.${sIdx}.title`)}
                    className="max-w-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => sections.remove(sIdx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <SectionLinks
                  control={control}
                  sectionIndex={sIdx}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Links</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                socialLinks.append({ platform: "", url: "", icon: "" })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Link
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialLinks.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Input
                  placeholder="Platform"
                  {...register(`socialLinks.${index}.platform`)}
                  className="w-32"
                />
                <Input
                  placeholder="URL"
                  {...register(`socialLinks.${index}.url`)}
                  className="flex-1"
                />
                <Input
                  placeholder="Icon"
                  {...register(`socialLinks.${index}.icon`)}
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => socialLinks.remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Copyright */}
        <Card>
          <CardHeader>
            <CardTitle>Copyright</CardTitle>
          </CardHeader>
          <CardContent>
            <Input {...register("copyrightText")} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save Footer
        </Button>
      </form>
    </div>
  );
}

// Sub-component for section links
function SectionLinks({
  control,
  sectionIndex,
  register,
  watch,
  setValue,
}: {
  control: ReturnType<typeof useForm<FooterForm>>["control"];
  sectionIndex: number;
  register: ReturnType<typeof useForm<FooterForm>>["register"];
  watch: ReturnType<typeof useForm<FooterForm>>["watch"];
  setValue: ReturnType<typeof useForm<FooterForm>>["setValue"];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.links`,
  });

  return (
    <div className="space-y-2 pl-4">
      {fields.map((link, lIdx) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input
            placeholder="Label"
            {...register(
              `sections.${sectionIndex}.links.${lIdx}.label`
            )}
            className="w-36"
          />
          <Input
            placeholder="/path or URL"
            {...register(
              `sections.${sectionIndex}.links.${lIdx}.href`
            )}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Switch
              checked={watch(
                `sections.${sectionIndex}.links.${lIdx}.isExternal`
              )}
              onCheckedChange={(checked) =>
                setValue(
                  `sections.${sectionIndex}.links.${lIdx}.isExternal`,
                  !!checked
                )
              }
            />
            <span className="text-xs text-muted-foreground">Ext</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(lIdx)}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          append({ label: "", href: "", isExternal: false })
        }
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Link
      </Button>
    </div>
  );
}
