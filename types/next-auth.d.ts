import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      /** User's unique identifier */
      id: string;
    } & DefaultSession['user'];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    /** User's unique identifier */
    id: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the JWT token types
   */
  interface JWT {
    /** User's unique identifier */
    id: string;
  }
}
