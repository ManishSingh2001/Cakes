"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface HeroForm {
  slides: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
    overlayOpacity: number;
    order: number;
    isActive: boolean;
  }[];
  autoplaySpeed: number;
}

export default function HeroPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<HeroForm>({
      defaultValues: { slides: [], autoplaySpeed: 5000 },
    });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "slides",
  });

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) reset(res.data);
      })
      .catch(() => toast.error("Failed to load hero data"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: HeroForm) => {
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Hero section updated");
    } catch {
      toast.error("Failed to update hero");
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
        <h2 className="font-heading text-2xl font-bold">Hero Section</h2>
        <p className="text-muted-foreground">Manage hero banner slides</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Slides</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                title: "",
                subtitle: "",
                backgroundImage: "",
                ctaText: "Explore Our Cakes",
                ctaLink: "/menu",
                overlayOpacity: 0.4,
                order: fields.length,
                isActive: true,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Slide
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Slide {index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch(`slides.${index}.isActive`)}
                  onCheckedChange={(checked) =>
                    setValue(`slides.${index}.isActive`, !!checked)
                  }
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(index, index - 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
                {index < fields.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(index, index + 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Image</Label>
                <ImageUploader
                  value={watch(`slides.${index}.backgroundImage`)}
                  onChange={(url) =>
                    setValue(`slides.${index}.backgroundImage`, url)
                  }
                  folder="hero"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input {...register(`slides.${index}.title`)} />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input {...register(`slides.${index}.subtitle`)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>CTA Text</Label>
                  <Input {...register(`slides.${index}.ctaText`)} />
                </div>
                <div>
                  <Label>CTA Link</Label>
                  <Input {...register(`slides.${index}.ctaLink`)} />
                </div>
              </div>
              <div>
                <Label>
                  Overlay Opacity: {watch(`slides.${index}.overlayOpacity`)}
                </Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[watch(`slides.${index}.overlayOpacity`)]}
                  onValueChange={(val) =>
                    setValue(`slides.${index}.overlayOpacity`, Array.isArray(val) ? val[0] : val)
                  }
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No slides added yet. Click &quot;Add Slide&quot; to get started.
            </CardContent>
          </Card>
        )}

        <Button type="submit" size="lg">
          Save Hero
        </Button>
      </form>
    </div>
  );
}
