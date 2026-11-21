import { asc, eq } from "drizzle-orm";

import { UsersClient } from "@/components/office/settings/users-client";
import { db } from "@/db";
import { roles, users } from "@/db/schema";

export default async function UsersSettingsPage() {
  const [userRows, roleRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .orderBy(asc(users.name)),
    db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name)),
  ]);

  return (
    <UsersClient
      users={userRows}
      roles={roleRows}
    />
  );
}

