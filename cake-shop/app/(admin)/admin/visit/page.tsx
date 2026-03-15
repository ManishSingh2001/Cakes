"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface VisitForm {
  sectionTitle: string;
  heading: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  businessHours: {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
  mapEmbedUrl: string;
}

export default function VisitPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<VisitForm>({
      defaultValues: {
        sectionTitle: "Visit Us",
        heading: "",
        description: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "India" },
        phone: "",
        email: "",
        businessHours: DAYS.map((day) => ({
          day,
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: false,
        })),
        mapEmbedUrl: "",
      },
    });

  const { fields } = useFieldArray({ control, name: "businessHours" });

  useEffect(() => {
    fetch("/api/admin/visit")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          // Ensure all 7 days are present
          const hours = DAYS.map((day) => {
            const existing = data.businessHours?.find(
              (h: Record<string, string>) => h.day === day
            );
            return (
              existing || {
                day,
                openTime: "09:00",
                closeTime: "18:00",
                isClosed: false,
              }
            );
          });
          reset({ ...data, businessHours: hours });
        }
      })
      .catch(() => toast.error("Failed to load visit data"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: VisitForm) => {
    try {
      const res = await fetch("/api/admin/visit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Visit section updated");
    } catch {
      toast.error("Failed to update visit section");
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
        <h2 className="font-heading text-2xl font-bold">Visit Section</h2>
        <p className="text-muted-foreground">
          Manage store location and hours
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
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
              <Textarea {...register("description")} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Street</Label>
              <Input {...register("address.street")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>City</Label>
                <Input {...register("address.city")} />
              </div>
              <div>
                <Label>State</Label>
                <Input {...register("address.state")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Zip Code</Label>
                <Input {...register("address.zipCode")} />
              </div>
              <div>
                <Label>Country</Label>
                <Input {...register("address.country")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="w-24 text-sm font-medium">
                  {watch(`businessHours.${index}.day`)}
                </span>
                <Input
                  type="time"
                  {...register(`businessHours.${index}.openTime`)}
                  className="w-32"
                  disabled={watch(`businessHours.${index}.isClosed`)}
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  {...register(`businessHours.${index}.closeTime`)}
                  className="w-32"
                  disabled={watch(`businessHours.${index}.isClosed`)}
                />
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    checked={watch(`businessHours.${index}.isClosed`)}
                    onCheckedChange={(checked) =>
                      setValue(`businessHours.${index}.isClosed`, !!checked)
                    }
                  />
                  <span className="text-sm text-muted-foreground">Closed</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Google Maps Embed URL</Label>
            <Input
              {...register("mapEmbedUrl")}
              placeholder="https://www.google.com/maps/embed?..."
            />
            {watch("mapEmbedUrl") && (
              <div className="mt-3 aspect-video overflow-hidden rounded-lg border">
                <iframe
                  src={watch("mapEmbedUrl")}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save Visit Section
        </Button>
      </form>
    </div>
  );
}
