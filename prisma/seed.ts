import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

type SeedOptions = {
  forumCount: number;
  postsPerForum: number;
  batchSize: number;
  resetBeforeSeed: boolean;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run seed script.');
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function getOptions(): SeedOptions {
  return {
    forumCount: toPositiveInt(process.env.SEED_FORUM_COUNT, 1000),
    postsPerForum: toPositiveInt(process.env.SEED_POSTS_PER_FORUM, 100),
    batchSize: toPositiveInt(process.env.SEED_BATCH_SIZE, 5000),
    resetBeforeSeed: toBoolean(process.env.SEED_RESET, false),
  };
}

async function resetData(): Promise<void> {
  console.log('SEED_RESET=true detected. Clearing existing forum and post data...');

  await prisma.$transaction([
    prisma.post.deleteMany({}),
    prisma.forum.deleteMany({}),
  ]);

  console.log('Existing data cleared.');
}

async function seedForums(forumCount: number): Promise<number[]> {
  const timestamp = Date.now();
  const forumData = Array.from({ length: forumCount }, (_, index) => ({
    userId: (index % 1000) + 1,
    title: `loadtest-forum-${timestamp}-${index + 1}`,
  }));

  await prisma.forum.createMany({
    data: forumData,
  });

  const forums = await prisma.forum.findMany({
    where: {
      title: {
        startsWith: `loadtest-forum-${timestamp}-`,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return forums.map((forum) => forum.id);
}

async function seedPosts(
  forumIds: number[],
  postsPerForum: number,
  batchSize: number,
): Promise<void> {
  const totalPosts = forumIds.length * postsPerForum;
  let createdPosts = 0;
  const timestamp = Date.now();

  while (createdPosts < totalPosts) {
    const batchData: Array<{
      userId: number;
      forumId: number;
      title: string;
      content: string;
      commentCount: number;
      voteCount: number;
      scrapCount: number;
    }> = [];

    for (
      let batchIndex = 0;
      batchIndex < batchSize && createdPosts < totalPosts;
      batchIndex += 1
    ) {
      const globalIndex = createdPosts;
      const forumIndex = Math.floor(globalIndex / postsPerForum);
      const postIndex = globalIndex % postsPerForum;
      const forumId = forumIds[forumIndex];

      batchData.push({
        userId: (globalIndex % 10000) + 1,
        forumId,
        title: `loadtest-post-${timestamp}-${forumId}-${postIndex + 1}`,
        content: `Load test content #${globalIndex + 1}.`.repeat(8),
        commentCount: globalIndex % 200,
        voteCount: globalIndex % 1000,
        scrapCount: globalIndex % 50,
      });

      createdPosts += 1;
    }

    await prisma.post.createMany({
      data: batchData,
    });

    if (createdPosts % Math.max(batchSize * 2, 10000) === 0 || createdPosts === totalPosts) {
      console.log(`Seed progress: ${createdPosts}/${totalPosts} posts inserted`);
    }
  }
}

async function main(): Promise<void> {
  const options = getOptions();

  console.log('Start seeding load test data with options:', options);

  if (options.resetBeforeSeed) {
    await resetData();
  }

  const forumIds = await seedForums(options.forumCount);
  await seedPosts(forumIds, options.postsPerForum, options.batchSize);

  console.log('Seeding completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
