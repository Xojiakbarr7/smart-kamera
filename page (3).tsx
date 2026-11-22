import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminAdminsClient } from "./AdminAdminsClient";

export const metadata: Metadata = {
  title: "Adminlar — SecureCam Admin",
};

async function getAdmins() {
  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return admins;
}

export default async function AdminAdminsPage() {
  const admins = await getAdmins();
  return <AdminAdminsClient initialAdmins={admins} />;
}