import {PrismaClient} from "@prisma/client";
const x=globalThis as unknown as {prisma?:PrismaClient};
export const db=x.prisma||new PrismaClient();
if(process.env.NODE_ENV!=="production")x.prisma=db;