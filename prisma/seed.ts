import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // roles
const roles = ["owner", "admin", "moderator", "player", "guest"];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  //  achievements
  const achievements = [
    { name: "First Blood", description: "Kill your first enemy", icon: "🩸" },
    { name: "Wave Warrior", description: "Survive 10 waves", icon: "⚔️" },
    { name: "Tower Master", description: "Place 20 towers in one game", icon: "🏰" },
    { name: "Gold Hoarder", description: "Accumulate 1000 gold", icon: "💰" },
    { name: "Untouchable", description: "Finish a wave without losing a life", icon: "🛡️" },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
  }

  console.log("Seeded roles and achievements");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());