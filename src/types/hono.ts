import type { AuthUser } from "../lib/auth.server";

export type { AuthUser };

export type AppEnv = {
  Variables: {
    user: AuthUser;
  };
};
