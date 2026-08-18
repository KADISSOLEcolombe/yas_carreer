import type { CandidateProfile, User } from "@/lib/types";

/**
 * Real completion percentage derived from the candidate's actual data —
 * not a mock. Each of the 5 checks below is worth 20%. `hasDocuments`
 * reflects "Mes documents" (CV, lettre, diplômes… tous stockés dans le
 * même dossier permanent) plutôt qu'un champ CV dédié.
 */
export function computeProfileCompletion(
  user: Pick<User, "fullName" | "phone"> | null | undefined,
  profile: Pick<CandidateProfile, "bio" | "skills"> | null | undefined,
  hasDocuments = false
): number {
  const checks = [
    Boolean(user?.fullName && user.fullName.trim().length >= 2),
    Boolean(user?.phone && user.phone.trim().length > 0),
    Boolean(profile?.bio && profile.bio.trim().length > 0),
    Boolean(profile?.skills && profile.skills.trim().length > 0),
    hasDocuments,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
