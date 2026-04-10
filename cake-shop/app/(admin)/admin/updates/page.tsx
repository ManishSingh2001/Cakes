"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { slugify, formatDate } from "@/lib/utils";
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
import { DataTable, Column } from "@/components/admin/DataTable";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface UpdateForm {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  isPublished: boolean;
}

interface UpdateRow {
  _id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<UpdateForm>({
      defaultValues: {
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        category: "News",
        tags: "",
        isPublished: false,
      },
    });

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/updates");
      const data = await res.json();
      setUpdates(data.data || []);
    } catch {
      toast.error("Failed to load updates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const titleValue = watch("title");
  useEffect(() => {
    if (!editing && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, editing, setValue]);

  const openNew = () => {
    setEditing(null);
    reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "News",
      tags: "",
      isPublished: false,
    });
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const update = updates.find((u) => u._id === id);
    if (!update) {
      toast.error("Failed to load update");
      return;
    }
    setEditing(id);
    reset({
      ...update,
      tags: update.tags?.join(", ") || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: UpdateForm) => {
    try {
      const body = {
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const method = editing ? "PUT" : "POST";

      const res = await fetch("/api/admin/updates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...body, _id: editing } : body),
      });

      if (!res.ok) throw new Error();
      toast.success(editing ? "Post updated" : "Post created");
      setDialogOpen(false);
      fetchUpdates();
    } catch {
      toast.error("Failed to save post");
    }
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/updates?_id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Post deleted");
      fetchUpdates();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const columns: Column<UpdateRow>[] = [
    { header: "Title", accessorKey: "title" },
    {
      header: "Category",
      cell: (row) => <Badge variant="secondary">{row.category}</Badge>,
    },
    {
      header: "Published",
      cell: (row) =>
        row.isPublished ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
    {
      header: "Date",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row._id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteUpdate(row._id)}>
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
          <h2 className="font-heading text-2xl font-bold">Updates</h2>
          <p className="text-muted-foreground">Manage blog posts and updates</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" />
          Add Post
        </Button>
      </div>

      <DataTable<UpdateRow>
        columns={columns}
        data={updates}
        searchKey={"title"}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Add New Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label>Excerpt</Label>
              <Textarea {...register("excerpt")} rows={2} />
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
                folder="updates"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Input {...register("category")} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input {...register("tags")} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isPublished")}
                onCheckedChange={(checked) => setValue("isPublished", !!checked)}
              />
              <Label>Publish</Label>
            </div>

            <Button type="submit" className="w-full">
              {editing ? "Update Post" : "Create Post"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
