"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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

interface AddonForm {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

interface AddonRow {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

const CATEGORIES = ["candles", "toppers", "decorations", "packaging", "extras"];

export default function AddonsPage() {
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<AddonForm>({
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        category: "extras",
        image: "",
        price: 0,
        stock: 0,
        isAvailable: true,
      },
    });

  const fetchAddons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/addons");
      const data = await res.json();
      setAddons(data);
    } catch {
      toast.error("Failed to load addons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

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
      category: "extras",
      image: "",
      price: 0,
      stock: 0,
      isAvailable: true,
    });
    setDialogOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/addons/${id}`);
      const data = await res.json();
      setEditing(id);
      reset(data);
      setDialogOpen(true);
    } catch {
      toast.error("Failed to load addon");
    }
  };

  const onSubmit = async (data: AddonForm) => {
    try {
      const url = editing
        ? `/api/admin/addons/${editing}`
        : "/api/admin/addons";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      toast.success(editing ? "Addon updated" : "Addon created");
      setDialogOpen(false);
      fetchAddons();
    } catch {
      toast.error("Failed to save addon");
    }
  };

  const deleteAddon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this addon?")) return;
    try {
      const res = await fetch(`/api/admin/addons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Addon deleted");
      fetchAddons();
    } catch {
      toast.error("Failed to delete addon");
    }
  };

  const columns: Column<AddonRow>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Category",
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.category}
        </Badge>
      ),
    },
    { header: "Price", cell: (row) => formatPrice(row.price) },
    { header: "Stock", cell: (row) => String(row.stock) },
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
          <Button variant="ghost" size="icon" onClick={() => openEdit(row._id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteAddon(row._id)}>
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
          <h2 className="font-heading text-2xl font-bold">Addons</h2>
          <p className="text-muted-foreground">Manage cake addons and extras</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" />
          Add Addon
        </Button>
      </div>

      <DataTable<AddonRow>
        columns={columns}
        data={addons}
        searchKey={"name"}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Addon" : "Add New Addon"}</DialogTitle>
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

            <div>
              <Label>Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(val) => setValue("category", val as "candles" | "toppers" | "decorations" | "packaging" | "extras")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Image</Label>
              <ImageUploader
                value={watch("image")}
                onChange={(url) => setValue("image", url)}
                folder="addons"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isAvailable")}
                onCheckedChange={(checked) => setValue("isAvailable", !!checked)}
              />
              <Label>Available</Label>
            </div>

            <Button type="submit" className="w-full">
              {editing ? "Update Addon" : "Create Addon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
