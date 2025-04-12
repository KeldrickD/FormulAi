import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// Custom token type
interface ExtendedToken extends JWT {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  error?: string;
  user?: any;
}

// Custom session type
interface ExtendedSession extends Session {
  accessToken?: string;
  error?: string;
}

// Function to refresh Google token
async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken || "",
    });

    const response = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const refreshedTokens = response.data;

    if (!response.status || response.status !== 200) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/spreadsheets",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0, // Convert to ms
          refreshToken: account.refresh_token,
          user,
        };
      }

      const extendedToken = token as ExtendedToken;

      // Return previous token if the access token has not expired yet
      if (extendedToken.accessTokenExpires && 
          typeof extendedToken.accessTokenExpires === 'number' && 
          Date.now() < extendedToken.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedToken;

      if (extendedToken.accessToken) {
        extendedSession.accessToken = extendedToken.accessToken;
      }
      
      if (extendedToken.error) {
        extendedSession.error = extendedToken.error;
      }
      
      if (extendedToken.user) {
        session.user = extendedToken.user;
      }
      
      return extendedSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".getformulai.com" : undefined
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 