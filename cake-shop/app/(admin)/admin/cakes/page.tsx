"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { slugify, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface CakeForm {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "egg" | "eggless";
  category: string;
  images: { url: string; alt: string }[];
  prices: { weight: number; costPrice: number; sellPrice: number }[];
  tags: string;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface CakeRow {
  _id: string;
  name: string;
  caketype: string;
  type: string;
  category: string;
  isFeatured: boolean;
  isAvailable: boolean;
  prices: { weight: number; sellPrice: number }[];
}

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<CakeForm>({
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        caketype: "cake",
        type: "eggless",
        category: "",
        images: [],
        prices: [{ weight: 0.5, costPrice: 0, sellPrice: 0 }],
        tags: "",
        isFeatured: false,
        isAvailable: true,
      },
    });

  const imagesField = useFieldArray({ control, name: "images" });
  const pricesField = useFieldArray({ control, name: "prices" });

  const fetchCakes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cakes");
      const data = await res.json();
      setCakes(data.data || []);
    } catch {
      toast.error("Failed to load cakes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCakes();
  }, [fetchCakes]);

  const nameValue = watch("name");
  useEffect(() => {
    if (!editing && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, editing, setValue]);

  const openNew = () => {
    setEditing(null);
    reset({
      name: "",
      slug: "",
      description: "",
      caketype: "cake",
      type: "eggless",
      category: "",
      images: [],
      prices: [{ weight: 0.5, costPrice: 0, sellPrice: 0 }],
      tags: "",
      isFeatured: false,
      isAvailable: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const cake = cakes.find((c) => c._id === id);
    if (!cake) {
      toast.error("Failed to load cake");
      return;
    }
    setEditing(id);
    reset({
      ...cake,
      tags: cake.tags?.join(", ") || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CakeForm) => {
    try {
      const body = {
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const method = editing ? "PUT" : "POST";

      const res = await fetch("/api/admin/cakes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...body, _id: editing } : body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.errors
          ? Object.values(err.errors).flat().join(", ")
          : err?.message || "Failed to save cake";
        toast.error(msg);
        return;
      }
      toast.success(editing ? "Cake updated" : "Cake created");
      setDialogOpen(false);
      fetchCakes();
    } catch {
      toast.error("Failed to save cake");
    }
  };

  const deleteCake = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cake?")) return;
    try {
      const res = await fetch(`/api/admin/cakes?_id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Cake deleted");
      fetchCakes();
    } catch {
      toast.error("Failed to delete cake");
    }
  };

  const columns: Column<CakeRow>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", cell: (row) => `${row.caketype} / ${row.type}` },
    { header: "Category", accessorKey: "category" },
    {
      header: "Price",
      cell: (row) =>
        row.prices?.[0] ? formatPrice(row.prices[0].sellPrice) : "N/A",
    },
    {
      header: "Featured",
      cell: (row) =>
        row.isFeatured ? (
          <Badge>Featured</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
    {
      header: "Available",
      cell: (row) =>
        row.isAvailable ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            No
          </Badge>
        ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(row._id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteCake(row._id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Cakes</h2>
          <p className="text-muted-foreground">Manage your cake catalog</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" />
          Add Cake
        </Button>
      </div>

      <DataTable<CakeRow>
        columns={columns}
        data={cakes}
        searchKey={"name"}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Cake" : "Add New Cake"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input {...register("slug", { required: true })} />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Cake Type</Label>
                <Select
                  value={watch("caketype")}
                  onValueChange={(val) =>
                    setValue("caketype", val as "cake" | "pastries")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cake">Cake</SelectItem>
                    <SelectItem value="pastries">Pastries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(val) =>
                    setValue("type", val as "egg" | "eggless")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="egg">Egg</SelectItem>
                    <SelectItem value="eggless">Eggless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  {...register("category", { required: true })}
                  placeholder="e.g. Birthday"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imagesField.append({ url: "", alt: "" })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              {imagesField.fields.map((field, index) => (
                <div key={field.id} className="mb-3 flex items-start gap-2">
                  <div className="flex-1">
                    <ImageUploader
                      value={watch(`images.${index}.url`)}
                      onChange={(url) => setValue(`images.${index}.url`, url)}
                      folder="cakes"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => imagesField.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Prices */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Prices (Weight-based)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pricesField.append({ weight: 0.5, costPrice: 0, sellPrice: 0 })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              {pricesField.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="mb-2 flex items-center gap-2"
                >
                  <Input
                    type="number"
                    step="0.25"
                    placeholder="Weight (kg)"
                    {...register(`prices.${index}.weight`, {
                      valueAsNumber: true,
                    })}
                    className="w-28"
                  />
                  <Input
                    type="number"
                    placeholder="Cost"
                    {...register(`prices.${index}.costPrice`, {
                      valueAsNumber: true,
                    })}
                    className="w-28"
                  />
                  <Input
                    type="number"
                    placeholder="Sell"
                    {...register(`prices.${index}.sellPrice`, {
                      valueAsNumber: true,
                    })}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => pricesField.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label>Tags (comma separated)</Label>
              <Input {...register("tags")} placeholder="chocolate, birthday, premium" />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) => setValue("isFeatured", !!checked)}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch("isAvailable")}
                  onCheckedChange={(checked) => setValue("isAvailable", !!checked)}
                />
                <Label>Available</Label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editing ? "Update Cake" : "Create Cake"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
