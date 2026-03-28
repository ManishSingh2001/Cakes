"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface SettingsForm {
  siteName: string;
  tagline: string;
  favicon: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
  };
  maintenance: {
    isEnabled: boolean;
    message: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<SettingsForm>({
      defaultValues: {
        siteName: "Sweet Delights Bakery",
        tagline: "",
        favicon: "",
        seo: {
          defaultTitle: "",
          defaultDescription: "",
          ogImage: "",
        },
        theme: {
          primaryColor: "#D4A574",
          secondaryColor: "#8B4513",
          accentColor: "#F5E6D3",
          fontHeading: "Playfair Display",
          fontBody: "Lato",
        },
        maintenance: {
          isEnabled: false,
          message: "We'll be back soon!",
        },
      },
    });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) reset(res.data);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error();
      if (result.data) reset(result.data);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
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
        <h2 className="font-heading text-2xl font-bold">Site Settings</h2>
        <p className="text-muted-foreground">
          Configure global site settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Site Name</Label>
                <Input {...register("siteName")} />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input {...register("tagline")} />
              </div>
            </div>
            <div>
              <Label>Favicon</Label>
              <ImageUploader
                value={watch("favicon")}
                onChange={(url) => setValue("favicon", url)}
                folder="branding"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Title</Label>
              <Input {...register("seo.defaultTitle")} />
            </div>
            <div>
              <Label>Default Description</Label>
              <Textarea {...register("seo.defaultDescription")} rows={2} />
            </div>
            <div>
              <Label>OG Image</Label>
              <ImageUploader
                value={watch("seo.ogImage")}
                onChange={(url) => setValue("seo.ogImage", url)}
                folder="branding"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.primaryColor")}
                    onChange={(e) => setValue("theme.primaryColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.primaryColor")}
                    onChange={(e) => setValue("theme.primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.secondaryColor")}
                    onChange={(e) => setValue("theme.secondaryColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.secondaryColor")}
                    onChange={(e) => setValue("theme.secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.accentColor")}
                    onChange={(e) => setValue("theme.accentColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.accentColor")}
                    onChange={(e) => setValue("theme.accentColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Heading Font</Label>
                <Input {...register("theme.fontHeading")} />
              </div>
              <div>
                <Label>Body Font</Label>
                <Input {...register("theme.fontBody")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("maintenance.isEnabled")}
                onCheckedChange={(checked) =>
                  setValue("maintenance.isEnabled", !!checked)
                }
              />
              <div>
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, visitors will see a maintenance page
                </p>
              </div>
            </div>
            <div>
              <Label>Maintenance Message</Label>
              <Textarea {...register("maintenance.message")} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
