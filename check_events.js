/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const events = await prisma.eventRequest.findMany();
  console.log("EVENTS:", JSON.stringify(events, null, 2));
  const music = await prisma.musicRequest.findMany();
  console.log("MUSIC:", JSON.stringify(music, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
