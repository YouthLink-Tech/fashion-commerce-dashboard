import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

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
      async authorize(credentials, req) {
        try {
          const ip = req.headers["x-forwarded-for"]?.split(",")[0] || // from proxy/load balancer
            req.socket?.remoteAddress ||
            null;

          const { data } = await axios.post(
            `https://fc-backend-664306765395.asia-south1.run.app/loginForDashboard`, {
            ...credentials,
            ipAddress: ip,
          });

          if (!data) {
            throw new Error("Invalid email/username or password"); // ❌ Prevent returning null
          }

          return {
            _id: data._id,
            ipAddress: ip,
          };
        } catch (error) {
          // Return specific error messages from backend if available
          throw new Error(
            error.response?.data?.message ||
            "Login failed! Please check your credentials.",
          );
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user?._id;
        token.ipAddress = user.ipAddress;
      }

      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.ipAddress = token.ipAddress;
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
