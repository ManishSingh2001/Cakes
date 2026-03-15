"use client";

import { useState } from "react";

interface UploadResult {
  url: string;
  filename: string;
}

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder: string = "general"): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setProgress(100);
      const data = await response.json();
      return { url: data.url, filename: data.filename };
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, progress };
}
