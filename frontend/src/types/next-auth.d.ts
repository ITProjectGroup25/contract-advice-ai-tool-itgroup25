import "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session types to include user information
   */
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

