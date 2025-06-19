import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials-backend",
      name: "Backend Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        otp: {
          label: "OTP",
          type: "text",
          placeholder: "Enter OTP if received",
        },
      },
      async authorize(credentials) {
        if (credentials?.accessToken && credentials?._id) {
          return {
            _id: credentials._id,
            accessToken: credentials.accessToken,
          };
        }
        return null;
      },
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token._id = user._id;
        token.accessToken = user.accessToken;
      }
      // ✅ session is now defined
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/auth/restricted-access" },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes in seconds
    updateAge: 0,    // prevent auto-renewal unless activity occurs
  },
  jwt: {
    maxAge: 30 * 60,
  },
};
