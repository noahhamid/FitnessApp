/** Remote auth calls (Supabase, REST) — wire when backend is ready */
export const authService = {
  async signInWithPassword(_email: string, _password: string) {
    return { ok: false as const };
  },
};
