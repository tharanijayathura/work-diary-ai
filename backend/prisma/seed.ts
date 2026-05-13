import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomBytes, pbkdf2Sync } from 'crypto';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log(`Start seeding ...`);
  
  const user1 = await prisma.user.create({
    data: {
      id: 'mock-user-id',
      email: 'john.doe@example.com',
      name: 'John Doe',
      passwordHash: hashPassword('Demo1234!'),
    },
  });
  console.log(`Created user with id: ${user1.id}`);

  const internship1 = await prisma.internship.create({
    data: {
      userId: user1.id,
      companyName: 'TechNova',
      role: 'Frontend Developer Intern',
      startDate: new Date('2026-06-01'),
      status: 'ACTIVE',
      skills: ['React', 'Next.js', 'Tailwind'],
    },
  });
  console.log(`Created internship with id: ${internship1.id}`);

  const diaryEntry1 = await prisma.diaryEntry.create({
    data: {
      internshipId: internship1.id,
      roughNotes: 'worked on the login page',
      content: 'Today, I successfully implemented the authentication flow for the login page, enhancing the overall security of the platform.',
      mood: 'productive',
      hoursWorked: 8,
      skills: ['Authentication', 'React'],
      entryDate: new Date(),
    },
  });
  console.log(`Created diary entry with id: ${diaryEntry1.id}`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
