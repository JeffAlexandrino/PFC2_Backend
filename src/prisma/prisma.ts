import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required for Prisma");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter }).$extends({
        query: {
            user: {
                $allOperations({ operation, args, query }) {
                    if (["findMany", "findFirst", "findUnique"].includes(operation) && "where" in args) {
                        args.where = {
                            ...args.where,
                            ativo: true,
                        };
                    }
                    return query(args);
                },
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
