import { authConfig } from "@rift/next-shared";
import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";

const nextAuth: NextAuthResult = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = nextAuth.auth;
