import NextAuth from "next-auth";

import { authConfig } from "@rift/next-shared";

export const { auth } = NextAuth(authConfig);
