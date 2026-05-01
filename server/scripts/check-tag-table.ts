// import { createClient } from '@libsql/client';
// import * as dotenv from 'dotenv';

// dotenv.config();

// async function main() {
//   const url = process.env.TURSO_DATABASE_URL;
//   const authToken = process.env.TURSO_AUTH_TOKEN;

//   const client: any = createClient({ url, authToken });

//   console.log('Checking Tag table structure...');
//   const res: any = await client.execute('PRAGMA table_info("Tag");');
//   console.log(JSON.stringify(res.rows, null, 2));
// }

// main().catch(console.error);
