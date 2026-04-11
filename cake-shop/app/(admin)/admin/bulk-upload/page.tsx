"use client";

import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface UploadResult {
  summary: { total: number; created: number; failed: number };
  errors: { row: number; name: string; errors: string[] }[];
}

const CAKE_COLUMNS = [
  "sku",
  "name",
  "description",
  "caketype",
  "type",
  "category",
  "slug",
  "weight",
  "costPrice",
  "sellPrice",
  "tags",
  "isFeatured",
  "isAvailable",
  "imageUrl",
  "imageAlt",
];

const ADDON_COLUMNS = [
  "name",
  "slug",
  "description",
  "category",
  "image",
  "price",
  "stock",
  "isAvailable",
];

const CAKE_SAMPLE = [
  {
    sku: "CK-CHOC-001",
    name: "Chocolate Truffle",
    description: "Rich dark chocolate cake",
    caketype: "cake",
    type: "eggless",
    category: "Birthday",
    slug: "",
    weight: 0.5,
    costPrice: 200,
    sellPrice: 450,
    tags: "chocolate, birthday",
    isFeatured: "true",
    isAvailable: "true",
    imageUrl: "",
    imageAlt: "",
  },
  {
    sku: "",
    name: "Chocolate Truffle",
    description: "",
    caketype: "",
    type: "",
    category: "",
    slug: "",
    weight: 1,
    costPrice: 350,
    sellPrice: 800,
    tags: "",
    isFeatured: "",
    isAvailable: "",
    imageUrl: "",
    imageAlt: "",
  },
  {
    sku: "CK-VAN-001",
    name: "Vanilla Dream",
    description: "Classic vanilla sponge",
    caketype: "cake",
    type: "egg",
    category: "Wedding",
    slug: "",
    weight: 1,
    costPrice: 300,
    sellPrice: 700,
    tags: "vanilla, wedding",
    isFeatured: "false",
    isAvailable: "true",
    imageUrl: "",
    imageAlt: "",
  },
];

const ADDON_SAMPLE = [
  {
    name: "Birthday Candles (10 pack)",
    slug: "",
    description: "Colorful birthday candles",
    category: "candles",
    image: "",
    price: 50,
    stock: 100,
    isAvailable: "true",
  },
  {
    name: "Gold Cake Topper",
    slug: "",
    description: "Happy Birthday gold topper",
    category: "toppers",
    image: "",
    price: 150,
    stock: 50,
    isAvailable: "true",
  },
];

export default function BulkUploadPage() {
  const [type, setType] = useState<"cakes" | "addons">("cakes");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Upload failed");
        return;
      }

      setResult(data);

      if (data.summary.failed === 0) {
        toast.success(`All ${data.summary.created} records created successfully!`);
      } else {
        toast.warning(
          `${data.summary.created} created, ${data.summary.failed} failed`
        );
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const columns = type === "cakes" ? CAKE_COLUMNS : ADDON_COLUMNS;
    const sampleData = type === "cakes" ? CAKE_SAMPLE : ADDON_SAMPLE;

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: columns });

    // Set column widths
    ws["!cols"] = columns.map((col) => ({
      wch: Math.max(col.length + 2, 15),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === "cakes" ? "Cakes" : "Addons");
    XLSX.writeFile(wb, `${type}-template.xlsx`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Bulk Upload</h2>
        <p className="text-muted-foreground">
          Import cakes or addons from an Excel file
        </p>
      </div>

      {/* Type & Template */}
      <Card>
        <CardHeader>
          <CardTitle>1. Choose Type & Download Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Upload Type</Label>
              <Select
                value={type}
                onValueChange={(val) => {
                  setType(val as "cakes" | "addons");
                  setFile(null);
                  setResult(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cakes">Cakes</SelectItem>
                  <SelectItem value="addons">Addons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {type === "cakes" && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Cakes template guide:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <strong>sku:</strong> Unique product code (e.g. "CK-CHOC-001"). Only needed on the first row per product.
                </li>
                <li>
                  <strong>Multiple prices:</strong> Use multiple rows with the
                  same <code>name</code> — each row adds a price tier
                  (weight/costPrice/sellPrice)
                </li>
                <li>
                  <strong>caketype:</strong> "cake" or "pastries"
                </li>
                <li>
                  <strong>type:</strong> "egg" or "eggless"
                </li>
                <li>
                  <strong>slug:</strong> Leave blank to auto-generate from name
                </li>
                <li>
                  <strong>tags:</strong> Comma-separated (e.g. "chocolate, birthday")
                </li>
              </ul>
            </div>
          )}

          {type === "addons" && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Addons template guide:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <strong>category:</strong> candles, toppers, decorations,
                  packaging, or extras
                </li>
                <li>
                  <strong>slug:</strong> Leave blank to auto-generate from name
                </li>
                <li>
                  <strong>price:</strong> Must be a positive number
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>2. Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-10 w-10 text-green-600" />
                <div className="text-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB — Click or drop to
                    replace
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">
                    Drop your Excel file or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .xlsx and .xls files
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Import {type === "cakes" ? "Cakes" : "Addons"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>3. Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.summary.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600">
                  {result.summary.created}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
              <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950/30">
                <p className="text-2xl font-bold text-red-600">
                  {result.summary.failed}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* Success message */}
            {result.summary.failed === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                All records imported successfully!
              </div>
            )}

            {/* Error details */}
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {result.errors.length} record(s) failed:
                  </span>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Badge variant="secondary">{err.row}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {err.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-destructive">
                            {err.errors.join("; ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
