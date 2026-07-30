"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllUsers, type UserRecord } from "@/lib/firestore";
import { RoleRoute } from "@/components/auth/protected-route";

function escapeHtml(unsafe: string): string {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    getAllUsers()
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    let csvContent = "First Name,Last Name,Username,Email,Phone,Nationality,Signup Date\n";
    users.forEach((user) => {
      const signupDate = user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString() : "Unknown";
      const row = [
        `"${(user.firstname || "").replace(/"/g, '""')}"`,
        `"${(user.lastname || "").replace(/"/g, '""')}"`,
        `"${(user.username || "").replace(/"/g, '""')}"`,
        `"${(user.email || "").replace(/"/g, '""')}"`,
        `"${(user.phone || "").replace(/"/g, '""')}"`,
        `"${(user.country || "").replace(/"/g, '""')}"`,
        `"${signupDate.replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "afrid_users_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RoleRoute roles={["admin"]}>
    <section className="mx-auto max-w-[1000px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">ADMIN_PANEL</span>
          </div>
          <h1 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Signed Up Users</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            disabled={users.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[#39e0ff] transition-colors hover:text-[#b27bff]"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#03040d]/95 backdrop-blur-sm">
              <tr className="border-b border-white/[0.08] text-muted">
                <th className="py-3 pl-4 font-semibold">Name</th>
                <th className="py-3 font-semibold">Username</th>
                <th className="py-3 font-semibold">Email</th>
                <th className="py-3 font-semibold">Phone</th>
                <th className="py-3 font-semibold">Nationality</th>
                <th className="py-3 pr-4 font-semibold">Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(57, 224, 255,0.12)] text-[#39e0ff]">
                        <Users size={32} />
                      </div>
                      <p className="text-muted">No users have signed up yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((user, i) => (
                  <tr
                    key={user.uid || i}
                    className="border-b border-white/[0.04)] transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-4 pl-4 text-[#F5E6D3]">
                      {escapeHtml(user.firstname || "")} {escapeHtml(user.lastname || "")}
                    </td>
                    <td className="py-4 text-[#F5E6D3]">{escapeHtml(user.username || "")}</td>
                    <td className="py-4 text-[#F5E6D3]">{escapeHtml(user.email || "")}</td>
                    <td className="py-4 text-muted">{escapeHtml(user.phone || "")}</td>
                    <td className="py-4 text-muted capitalize">
                      {escapeHtml((user.country || "").replace("-", " "))}
                    </td>
                    <td className="py-4 pr-4 text-muted">{user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString() : "Unknown"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {users.length > pageSize && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, users.length)} of {users.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-muted">{currentPage} / {Math.ceil(users.length / pageSize)}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(users.length / pageSize), p + 1))}
              disabled={currentPage >= Math.ceil(users.length / pageSize)}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
    </RoleRoute>
  );
}
