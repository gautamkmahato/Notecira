export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  providers: string[];
  emailVerified: boolean;
  createdAt: string | null;
};

export function userDisplayName(user: SessionUser): string {
  const name = user.name?.trim();
  if (name) return name;
  const local = user.email.split("@")[0]?.trim();
  return local || "User";
}

export function userInitial(user: SessionUser): string {
  const name = user.name?.trim();
  if (name) return name[0]!.toUpperCase();
  if (user.email) return user.email[0]!.toUpperCase();
  return "?";
}
