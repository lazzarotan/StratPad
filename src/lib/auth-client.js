import { createAuthClient } from "better-auth/react";
import {usernameClient} from "better-auth/client/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [usernameClient()],
});

export const { signUp, signOut, signIn, isUsernameAvailable, useSession, updateUser, changeEmail, changePassword, deleteUser } = authClient;
