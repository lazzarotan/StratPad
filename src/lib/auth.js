import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { username } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    //autoSignIn: false, //default is auto sign in upon registration
    //requireEmailVerification: true,
  },
  session: {
    expiresIn: 24 * 60 * 60, //sessions last 1 day
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  /* emailVerification: {
    sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmailMail({
        to: user.email,
        verificationUrl: url,
        userName: user.name ?? user.email,
      });
    },
  }, */
  plugins: [username({
    minUsernameLength: 5,
    //maxUsernameLength:  //defualt is 30
    normalizer: (username) => username.toLowerCase().replace(/\s/g, ""),
  })]
});