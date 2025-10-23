import { decodeJwt } from "jose";
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
        if (credentials?.email) {
          return {
            _id: credentials._id,
            accessToken: credentials.accessToken,
            email: credentials.email,
            permissions: JSON.parse(credentials.permissions),
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
        token.email = user.email;
        token.permissions = user.permissions;
      }
      // Handle manual updates (e.g., refresh via update())
      if (trigger === "update" && session?.user) {
        token.accessToken = session.user.accessToken;  // Update token string
        // Decode new token for permissions (fresh embed)
        try {
          const decoded = decodeJwt(token.accessToken);
          token.permissions = decoded.permissions || token.permissions;
        } catch (err) {
          console.error("JWT decode in update failed:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // 🔹 Always decode accessToken for fresh embedded permissions (runs every time)
      try {
        const decodedAccess = decodeJwt(token.accessToken);
        session.user._id = decodedAccess._id || token._id;
        session.user.email = decodedAccess.email || token.email;
        session.user.permissions = decodedAccess.permissions || token.permissions;  // Fresh from token!
      } catch (err) {
        console.error("Session decode failed:", err);
        // Fallback to token (stale safe-net)
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.permissions = token.permissions;
      }
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
