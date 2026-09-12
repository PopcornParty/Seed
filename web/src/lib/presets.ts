import type { ConditionGroup } from "../engineCopy";

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  ranking: boolean;
  seedCount: number;
  radius: number;
  groups: ConditionGroup[];
}

const c = (
  name: string,
  maxDistance: number,
  weight = 20,
  minCount = 1
): ConditionGroup["conditions"][number] => ({
  name,
  minCount,
  maxCount: 99,
  maxDistance,
  minDistance: 0,
  weight
});

export const PRESETS: Preset[] = [
  {
    id: "speedrun",
    name: "Speedrun",
    blurb: "Village and ruined portal close to origin. Stronghold is approximate.",
    ranking: true,
    seedCount: 50000,
    radius: 2000,
    groups: [{ op: "AND", conditions: [c("village", 500, 30), c("ruined_portal", 800, 25), c("stronghold", 2500, 20)] }]
  },
  {
    id: "survival",
    name: "Survival",
    blurb: "Village plus extra overworld candidates near origin.",
    ranking: true,
    seedCount: 40000,
    radius: 2500,
    groups: [{ op: "AND", conditions: [c("village", 700, 25), c("ruined_portal", 1200, 15), c("pillager_outpost", 2000, 15)] }]
  },
  {
    id: "village-hunter",
    name: "Village Hunter",
    blurb: "At least three village candidates inside 2000 blocks.",
    ranking: true,
    seedCount: 80000,
    radius: 2000,
    groups: [{ op: "AND", conditions: [c("village", 2000, 40, 3)] }]
  },
  {
    id: "structure-collector",
    name: "Structure Collector",
    blurb: "Village or monument close, plus a mansion candidate further out.",
    ranking: true,
    seedCount: 100000,
    radius: 5000,
    groups: [
      { op: "OR", conditions: [c("village", 400, 20), c("ocean_monument", 1500, 20)] },
      { op: "AND", conditions: [c("woodland_mansion", 4000, 25)] }
    ]
  },
  {
    id: "nether",
    name: "Nether Complex",
    blurb: "Nether fortress/bastion candidate grid plus nether ruined portal.",
    ranking: true,
    seedCount: 30000,
    radius: 800,
    groups: [{ op: "AND", conditions: [c("nether_complex", 400, 30), c("ruined_portal_nether", 500, 15)] }]
  },
  {
    id: "custom",
    name: "Custom",
    blurb: "Start from a single village condition and edit it.",
    ranking: true,
    seedCount: 20000,
    radius: 1500,
    groups: [{ op: "AND", conditions: [c("village", 500, 20)] }]
  }
];
