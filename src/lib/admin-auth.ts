import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401, session: null };
  }

  if (session.user.role !== Role.ADMIN) {
    return { error: "Forbidden", status: 403, session: null };
  }

  return { error: null, status: null, session };
}
