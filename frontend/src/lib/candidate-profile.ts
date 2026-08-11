import type { CandidateProfile, User } from "@/lib/types";

/**
 * Real completion percentage derived from the candidate's actual data —
 * not a mock. Each of the 5 fields below is worth 20%.
 */
export function computeProfileCompletion(
  user: Pick<User, "fullName" | "phone"> | null | undefined,
  profile: Pick<CandidateProfile, "bio" | "skills" | "cvUrl"> | null | undefined
): number {
  const checks = [
    Boolean(user?.fullName && user.fullName.trim().length >= 2),
    Boolean(user?.phone && user.phone.trim().length > 0),
    Boolean(profile?.bio && profile.bio.trim().length > 0),
    Boolean(profile?.skills && profile.skills.trim().length > 0),
    Boolean(profile?.cvUrl),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
