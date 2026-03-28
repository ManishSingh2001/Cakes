"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaItem {
  _id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
}

const FOLDERS = [
  "all",
  "general",
  "cakes",
  "addons",
  "hero",
  "about",
  "team",
  "updates",
  "pages",
  "branding",
];

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const query = folder !== "all" ? `?folder=${folder}` : "";
      const res = await fetch(`/api/admin/media${query}`);
      const data = await res.json();
      setMedia(data.data);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder === "all" ? "general" : folder);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error();
      }
      toast.success("Files uploaded");
      fetchMedia();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const res = await fetch(`/api/admin/media?_id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("File deleted");
      setMedia((prev) => prev.filter((m) => m._id !== id));
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">
            {media.length} file{media.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-1 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* Folder filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Folder:</span>
        <Select value={folder} onValueChange={(val) => setFolder(val ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOLDERS.map((f) => (
              <SelectItem key={f} value={f} className="capitalize">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="mb-3 h-12 w-12" />
          <p>No media files found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <div className="aspect-square overflow-hidden">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{item.filename}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatSize(item.size)}
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {item.folder}
                  </Badge>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteMedia(item._id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
