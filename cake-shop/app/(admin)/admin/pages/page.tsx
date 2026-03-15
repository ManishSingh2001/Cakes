import { connectDB } from "@/lib/db";
import { CustomPage } from "@/lib/models/CustomPage";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPages() {
  await connectDB();
  const pages = await CustomPage.find()
    .sort({ createdAt: -1 })
    .populate("author", "name")
    .lean();
  return JSON.parse(JSON.stringify(pages));
}

export default async function PagesPage() {
  const pages = await getPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Custom Pages</h2>
          <p className="text-muted-foreground">Manage static pages</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page: Record<string, unknown>) => (
                <TableRow key={page._id as string}>
                  <TableCell>
                    <Link
                      href={`/admin/pages/${page._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {page.title as string}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{page.slug as string}
                  </TableCell>
                  <TableCell>
                    {(page.author as Record<string, string>)?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(page.createdAt as string)}</TableCell>
                </TableRow>
              ))}
              {pages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No pages created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
