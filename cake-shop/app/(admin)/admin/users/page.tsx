import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getUsers() {
  await connectDB();
  const users = await User.find()
    .select("name email role isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(users));
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">Manage registered users</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: Record<string, unknown>) => (
                <TableRow key={user._id as string}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {user.name as string}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email as string}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.role as string}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt as string)}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No users found
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
