/* eslint-disable no-console */
import { PrismaClient, Role, IntakeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 11);
}

async function main() {
  console.log("Seeding Game Plan Action…");

  const advisor = await prisma.user.upsert({
    where: { email: "advisor@cerity.example" },
    update: {},
    create: {
      email: "advisor@cerity.example",
      passwordHash: await hash("gameplan!"),
      role: Role.ADVISOR,
      displayName: "Demo Advisor",
    },
  });

  const roster = [
    { first: "Marcus", last: "Ellison",   sport: "Men's Football",     school: "Auburn University",             homeState: "GA", classYear: "Junior",    isMinor: false, status: IntakeStatus.PLAN_GENERATED,   flags: ["entity", "insurance"],                       nil: 412000, states: ["AL","TN","MS","TX","GA","FL"] },
    { first: "Jordan", last: "Reyes",     sport: "Women's Basketball", school: "University of Connecticut",     homeState: "NY", classYear: "Sophomore", isMinor: false, status: IntakeStatus.IN_PROGRESS,      flags: ["state-compliance"],                          nil: 148500, states: ["CT","MA","TN","IN","TX"] },
    { first: "Devin",  last: "Okafor",    sport: "Men's Basketball",   school: "Duke University",               homeState: "IL", classYear: "Freshman",  isMinor: true,  status: IntakeStatus.IN_PROGRESS,      flags: ["state-compliance"],                          nil: 86200,  states: ["NC","VA","KY","MA"] },
    { first: "Sam",    last: "Whitaker",  sport: "Baseball",           school: "Vanderbilt University",         homeState: "TN", classYear: "Junior",    isMinor: false, status: IntakeStatus.NOT_STARTED,      flags: [],                                            nil: 32000,  states: ["TN"] },
    { first: "Leah",   last: "Nakamura",  sport: "Women's Basketball", school: "Stanford University",           homeState: "HI", classYear: "Senior",    isMinor: false, status: IntakeStatus.SYNCED_TO_EMONEY, flags: [],                                            nil: 227400, states: ["CA","AZ","OR","WA","UT"] },
    { first: "Tyrese", last: "Booker",    sport: "Men's Football",     school: "Ohio State University",         homeState: "OH", classYear: "Sophomore", isMinor: false, status: IntakeStatus.IN_PROGRESS,      flags: ["entity"],                                    nil: 318900, states: ["OH","MI","PA","IN","WI"] },
    { first: "Ana",    last: "Delgado",   sport: "Soccer",             school: "UCLA",                          homeState: "CA", classYear: "Junior",    isMinor: false, status: IntakeStatus.NOT_STARTED,      flags: [],                                            nil: 44100,  states: ["CA","OR","WA"] },
    { first: "Cole",   last: "Whitfield", sport: "Men's Football",     school: "University of Texas",           homeState: "TX", classYear: "Junior",    isMinor: false, status: IntakeStatus.PLAN_GENERATED,   flags: ["entity", "insurance", "state-compliance"],   nil: 610500, states: ["TX","OK","GA","LA","AL"] },
  ];

  for (const r of roster) {
    const email = `${r.first.toLowerCase()}.${r.last.toLowerCase()}@example.com`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    await prisma.user.create({
      data: {
        email,
        passwordHash: await hash("gameplan!"),
        role: Role.CLIENT,
        displayName: `${r.first} ${r.last}`,
        athlete: {
          create: {
            firstName: r.first,
            lastName: r.last,
            classYear: r.classYear,
            homeState: r.homeState,
            isMinor: r.isMinor,
            sport: r.sport,
            teamSchool: r.school,
            status: r.status,
            flags: r.flags,
            nilIncomeYtd: r.nil,
            competingStates: r.states,
          },
        },
      },
    });
  }

  console.log(`Seeded advisor + ${roster.length} client athletes.`);
  console.log(`Advisor login: advisor@cerity.example / gameplan!`);
  console.log(`Client login example: marcus.ellison@example.com / gameplan!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
