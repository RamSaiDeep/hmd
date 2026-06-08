import "dotenv/config";
import pg from "pg";

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const publicTables = (
    await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
  ).rows.map((r) => r.tablename);

  const authTables = (
    await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename`
    )
  ).rows.map((r) => r.tablename);

  console.log("Public tables:", publicTables.join(", ") || "(none)");
  console.log("Auth tables:", authTables.join(", ") || "(none)");

  const countsBefore = {};
  for (const table of publicTables) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM public."${table}"`);
    countsBefore[table] = rows[0].count;
  }

  let authUsersBefore = 0;
  if (authTables.includes("users")) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM auth.users`);
    authUsersBefore = rows[0].count;
  }

  console.log("\nRow counts before wipe:");
  for (const [table, count] of Object.entries(countsBefore)) {
    console.log(`  public."${table}": ${count}`);
  }
  console.log(`  auth.users: ${authUsersBefore}`);

  await client.query("BEGIN");

  try {
    if (publicTables.length > 0) {
      const quoted = publicTables.map((t) => `public."${t}"`).join(", ");
      await client.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
    }

    if (authTables.includes("users")) {
      await client.query(`DELETE FROM auth.users`);
    }

    await client.query("COMMIT");
    console.log("\nWipe completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  const countsAfter = {};
  for (const table of publicTables) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM public."${table}"`);
    countsAfter[table] = rows[0].count;
  }

  let authUsersAfter = 0;
  if (authTables.includes("users")) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM auth.users`);
    authUsersAfter = rows[0].count;
  }

  console.log("\nRow counts after wipe:");
  for (const [table, count] of Object.entries(countsAfter)) {
    console.log(`  public."${table}": ${count}`);
  }
  console.log(`  auth.users: ${authUsersAfter}`);

  await client.end();
}

main().catch((error) => {
  console.error("Wipe failed:", error);
  process.exit(1);
});
