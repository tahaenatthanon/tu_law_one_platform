import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config(); // Load .env for Prisma CLI

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
