// import { createClient } from '@libsql/client';
// import * as dotenv from 'dotenv';

// dotenv.config();

// async function main() {
//   const url = process.env.TURSO_DATABASE_URL;
//   const authToken = process.env.TURSO_AUTH_TOKEN;

//   const client: any = createClient({ url, authToken });

//   console.log('Executing ALTER TABLE "Tag" ADD COLUMN "tag" TEXT; ...');
//   try {
//     const res = await client.execute('ALTER TABLE "Tag" ADD COLUMN "tag" TEXT;');
//     console.log('Success:', res);
//   } catch (err) {
//     console.error('Error:', err);
//   }
// }

// main().catch(console.error);
