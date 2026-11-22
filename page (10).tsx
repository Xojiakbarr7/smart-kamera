import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata: Metadata = {
  title: "Sozlamalar — SecureCam Admin",
};

async function getSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: "SecureCam",
        siteDescription: "Aqlli kuzatuv kameralari do'koni",
        currency: "UZS",
        timezone: "Asia/Tashkent",
        freeDelivery: true,
      },
    });
  }

  const { telegramBotToken, ...safeSettings } = settings;
  return safeSettings;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <AdminSettingsClient initialSettings={settings} />;
}