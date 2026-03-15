import type { MatchListing } from "@/data/product-data";

export type BattleResult = "win" | "loss" | "in-progress";

export type PlayerBattleHistoryEntry = {
  challenge: MatchListing;
  activityAt: string;
  href: string;
  opponentSlug: string;
  result: BattleResult;
};

export type PlayerLatestBattleSummary = {
  challengeId: string;
  href: string;
  opponentSlug: string;
  result: BattleResult;
  status: MatchListing["status"];
};

function isWatchPrimaryStatus(status: MatchListing["status"]) {
  return status === "accepted" || status === "live";
}

export function getChallengeActivityAt(challenge: MatchListing) {
  return challenge.settledAt ?? challenge.acceptedAt ?? challenge.createdAt;
}

export function sortChallengesByActivityDesc(challenges: MatchListing[]) {
  return [...challenges].sort((left, right) => {
    return Date.parse(getChallengeActivityAt(right)) - Date.parse(getChallengeActivityAt(left));
  });
}

export function getChallengeHref(challenge: MatchListing) {
  return challenge.status === "settlement" ? `/replay/${challenge.id}` : `/challenge/${challenge.id}`;
}

export function getBattleResultForPlayer(challenge: MatchListing, playerSlug: string): BattleResult {
  if (challenge.status !== "settlement") {
    return "in-progress";
  }

  return challenge.winnerSlug === playerSlug ? "win" : "loss";
}

export function getWatchFeedSections(challenges: MatchListing[], recentSettledLimit = 5) {
  const sortedChallenges = sortChallengesByActivityDesc(challenges);

  return {
    primaryMatches: sortedChallenges.filter((challenge) => isWatchPrimaryStatus(challenge.status)),
    recentSettled: sortedChallenges
      .filter((challenge) => challenge.status === "settlement")
      .slice(0, recentSettledLimit),
  };
}

export function getPlayerBattleHistory(challenges: MatchListing[], playerSlug: string): PlayerBattleHistoryEntry[] {
  return sortChallengesByActivityDesc(challenges)
    .filter((challenge) => challenge.challengerSlug === playerSlug || challenge.defenderSlug === playerSlug)
    .map((challenge) => ({
      challenge,
      activityAt: getChallengeActivityAt(challenge),
      href: getChallengeHref(challenge),
      opponentSlug: challenge.challengerSlug === playerSlug ? challenge.defenderSlug : challenge.challengerSlug,
      result: getBattleResultForPlayer(challenge, playerSlug),
    }));
}

export function getAdjacentChallenges(challenges: MatchListing[], challengeId: string) {
  const sortedChallenges = sortChallengesByActivityDesc(challenges);
  const currentIndex = sortedChallenges.findIndex((challenge) => challenge.id === challengeId);

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: currentIndex > 0 ? sortedChallenges[currentIndex - 1] : null,
    next: currentIndex < sortedChallenges.length - 1 ? sortedChallenges[currentIndex + 1] : null,
  };
}

export function getLatestReplayChallenges(challenges: MatchListing[], limit = 3) {
  return sortChallengesByActivityDesc(challenges)
    .filter((challenge) => challenge.status === "settlement")
    .slice(0, limit);
}

export function getPlayerLatestBattleMap(challenges: MatchListing[]) {
  const latestBattleMap: Record<string, PlayerLatestBattleSummary> = {};

  for (const challenge of sortChallengesByActivityDesc(challenges)) {
    const participants = [challenge.challengerSlug, challenge.defenderSlug] as const;

    for (const playerSlug of participants) {
      if (latestBattleMap[playerSlug]) {
        continue;
      }

      latestBattleMap[playerSlug] = {
        challengeId: challenge.id,
        href: getChallengeHref(challenge),
        opponentSlug: challenge.challengerSlug === playerSlug ? challenge.defenderSlug : challenge.challengerSlug,
        result: getBattleResultForPlayer(challenge, playerSlug),
        status: challenge.status,
      };
    }
  }

  return latestBattleMap;
}
