import { UsersClient } from "@/components/office/settings/users-client";
import { api } from "@/lib/api-client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  roleName: string | null;
};

type RoleRow = { id: string; name: string };

export default async function UsersSettingsPage() {
  const { users, roles } = await api.get<{ users: UserRow[]; roles: RoleRow[] }>("/settings/users");

  return <UsersClient users={users} roles={roles} />;
}
