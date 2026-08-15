import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  migrations: {
    seed: "yarn ts-node --compiler-options {\"module\":\"CommonJS\"} ./prisma/seeds/seeds.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
