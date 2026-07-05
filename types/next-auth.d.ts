import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    roles: string[];
    departmentId?: number;
    status: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
      departmentId?: number;
      status: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
    departmentId?: number;
    status: string;
  }
}
