import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized", errorAr: "غير مصرح", status: 401, session: null };
  }

  if (session.user.role !== Role.ADMIN) {
    return { error: "Forbidden", errorAr: "غير مسموح", status: 403, session: null };
  }

  return { error: null, errorAr: null, status: null, session };
}
