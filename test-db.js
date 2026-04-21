process.env.DATABASE_URL = 'file:./notes.db';
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('./src/generated/prisma/client');

async function main() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    const users = await prisma.user.findMany();
    console.log('Success! Users:', users);
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}
main();
