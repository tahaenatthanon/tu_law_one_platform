import { defineConfig } from "prisma/config";

export default defineConfig({
  database: {
    connectionString: process.env.DATABASE_URL!,
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
