import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const metadata: Metadata = {
  title: "Admin Panel — SecureCam",
  description: "Admin panel for managing products, categories, orders",
};

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: token },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) return null;

  return admin;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminHeader admin={admin} />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}