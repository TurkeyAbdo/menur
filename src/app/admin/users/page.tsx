"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  provider: string;
  createdAt: string;
}

const roleBadgeColors: Record<string, string> = {
  OWNER: "bg-blue-50 text-blue-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
  ADMIN: "bg-purple-50 text-purple-700",
};

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    userId: string;
    newRole: string;
  } | null>(null);

  const fetchData = useCallback((s: string, p: number) => {
    setLoading(true);
    fetch(
      `/api/admin/users?search=${encodeURIComponent(s)}&page=${p}&limit=20`
    )
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(search, page);
  }, [page, fetchData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchData(search, 1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, fetchData]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setConfirmDialog({ userId, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmDialog) return;

    try {
      const res = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: confirmDialog.newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === confirmDialog.userId
              ? { ...u, role: confirmDialog.newRole }
              : u
          )
        );
        toast("success", t("users.roleUpdated"));
      } else {
        toast("error", t("users.roleUpdateFailed"));
      }
    } catch {
      toast("error", t("users.roleUpdateFailed"));
    }

    setConfirmDialog(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("users.title")}</h1>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("users.searchUsers")}
            className="w-full rounded-lg border border-gray-200 py-2 ps-10 pe-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {t("pagination.showing")} {total} {t("pagination.entries")}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {t("users.noUsers")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.name")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.email")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.role")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.provider")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.created")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 ${roleBadgeColors[user.role] || roleBadgeColors.CUSTOMER}`}
                      >
                        <option value="OWNER">{t("roles.OWNER")}</option>
                        <option value="CUSTOMER">{t("roles.CUSTOMER")}</option>
                        <option value="ADMIN">{t("roles.ADMIN")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-500">
              {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Role Change Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("users.confirmRoleChange")}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {t("users.confirmRoleChangeMessage", {
                role: t(`roles.${confirmDialog.newRole}`),
              })}
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {t("pagination.prev")}
              </button>
              <button
                onClick={confirmRoleChange}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                {t("users.changeRole")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
