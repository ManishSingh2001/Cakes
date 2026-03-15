"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface HeaderForm {
  logo: {
    imageUrl: string;
    altText: string;
    linkTo: string;
  };
  navigation: {
    label: string;
    href: string;
    order: number;
    isVisible: boolean;
  }[];
  ctaButton: {
    text: string;
    href: string;
    isVisible: boolean;
  };
  isSticky: boolean;
}

export default function HeaderPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<HeaderForm>({
      defaultValues: {
        logo: { imageUrl: "", altText: "", linkTo: "/" },
        navigation: [],
        ctaButton: { text: "Order Now", href: "/menu", isVisible: true },
        isSticky: true,
      },
    });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "navigation",
  });

  useEffect(() => {
    fetch("/api/admin/header")
      .then((r) => r.json())
      .then((data) => {
        if (data) reset(data);
      })
      .catch(() => toast.error("Failed to load header data"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: HeaderForm) => {
    try {
      const res = await fetch("/api/admin/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Header updated successfully");
    } catch {
      toast.error("Failed to update header");
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
        <h2 className="font-heading text-2xl font-bold">Header Settings</h2>
        <p className="text-muted-foreground">
          Manage your site header, logo, and navigation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Logo Image</Label>
              <ImageUploader
                value={watch("logo.imageUrl")}
                onChange={(url) => setValue("logo.imageUrl", url)}
                folder="branding"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="logoAlt">Alt Text</Label>
                <Input id="logoAlt" {...register("logo.altText")} />
              </div>
              <div>
                <Label htmlFor="logoLink">Link To</Label>
                <Input id="logoLink" {...register("logo.linkTo")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Navigation Links</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  label: "",
                  href: "",
                  order: fields.length,
                  isVisible: true,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Link
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Label"
                    {...register(`navigation.${index}.label`)}
                  />
                  <Input
                    placeholder="/path"
                    {...register(`navigation.${index}.href`)}
                  />
                </div>
                <Switch
                  checked={watch(`navigation.${index}.isVisible`)}
                  onCheckedChange={(checked) =>
                    setValue(`navigation.${index}.isVisible`, !!checked)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No navigation links added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* CTA Button */}
        <Card>
          <CardHeader>
            <CardTitle>CTA Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ctaText">Button Text</Label>
                <Input id="ctaText" {...register("ctaButton.text")} />
              </div>
              <div>
                <Label htmlFor="ctaHref">Button Link</Label>
                <Input id="ctaHref" {...register("ctaButton.href")} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("ctaButton.isVisible")}
                onCheckedChange={(checked) =>
                  setValue("ctaButton.isVisible", !!checked)
                }
              />
              <Label>Show CTA Button</Label>
            </div>
          </CardContent>
        </Card>

        {/* Sticky */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-medium">Sticky Header</p>
              <p className="text-sm text-muted-foreground">
                Keep header fixed at top while scrolling
              </p>
            </div>
            <Switch
              checked={watch("isSticky")}
              onCheckedChange={(checked) => setValue("isSticky", !!checked)}
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save Header
        </Button>
      </form>
    </div>
  );
}
