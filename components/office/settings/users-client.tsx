"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteUser,
  inviteUser,
  setUserStatus,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  roleName: string | null;
}

export function UsersClient({
  users,
  roles,
}: {
  users: UserRow[];
  roles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [roleId, setRoleId] = React.useState<string>("none");
  const [error, setError] = React.useState<string | null>(null);

  const invite = async () => {
    setError(null);
    const res = await inviteUser({
      name,
      email,
      roleId: roleId === "none" ? undefined : roleId,
    });
    if (res && "errors" in res && res.errors) {
      const flat = res.errors as Record<string, string[] | undefined>;
      setError(Object.values(flat).flat()[0] ?? "Validation failed");
      return;
    }
    setInviteOpen(false);
    setName("");
    setEmail("");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 px-2 pb-8">
      <ListToolbarHeader onInvite={() => setInviteOpen(true)} />

      {inviteOpen && (
        <div className="mx-2 rounded-md border bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select onValueChange={setRoleId} value={roleId}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No role</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={invite}>
              <UserPlus className="mr-1 h-4 w-4" /> Send Invite
            </Button>
            <Button size="sm" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.roleName ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={u.status === "active" ? "secondary" : "outline"}>
                    {u.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${u.name}`}
                    onClick={async () => {
                      if (window.confirm(`Remove ${u.name}?`)) {
                        await deleteUser(u.id);
                        router.refresh();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ListToolbarHeader({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="sticky top-0 mx-2 my-4 flex items-center justify-between">
      <h2 className="px-2 text-xl font-medium">Users & Roles</h2>
      <Button size={"sm"} onClick={onInvite}>
        <UserPlus className="mr-1 h-4 w-4" /> Invite User
      </Button>
    </div>
  );
}

