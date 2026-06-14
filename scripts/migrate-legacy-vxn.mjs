import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function option(name) {
  const prefix = `${name}=`;
  const exactIndex = process.argv.indexOf(name);

  if (exactIndex >= 0) {
    return process.argv[exactIndex + 1];
  }

  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const apply = process.argv.includes("--apply");
const guildId =
  option("--guild-id") ||
  process.env.ATHEUS_VXN_DISCORD_GUILD_ID ||
  (apply ? "" : "dry-run-guild");
const ownerId =
  option("--owner-id") ||
  process.env.ATHEUS_VXN_OWNER_DISCORD_USER_ID ||
  (apply ? "" : "dry-run-owner");
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (
  !supabaseUrl ||
  !/^https?:\/\//i.test(supabaseUrl) ||
  !serviceRoleKey ||
  serviceRoleKey.startsWith("<") ||
  serviceRoleKey.startsWith("replace-")
) {
  throw new Error(
    "Real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values are required in the server environment.",
  );
}

if (!guildId || !ownerId) {
  throw new Error(
    "Apply mode requires --guild-id and --owner-id, or the matching ATHEUS_VXN_* environment variables.",
  );
}

if (apply && !process.argv.includes("--confirm-production-import")) {
  throw new Error(
    "Apply mode also requires --confirm-production-import to prevent an accidental live write.",
  );
}

const database = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await database.rpc("import_legacy_vxn_canonical", {
  p_owner_discord_user_id: ownerId,
  p_discord_guild_id: guildId,
  p_apply: apply,
});

if (error) {
  throw new Error(`VXN canonical import failed: ${error.message}`);
}

console.log(JSON.stringify(data, null, 2));

if (!apply) {
  console.log(
    "\nDry-run only. No rows were changed. Use --apply --confirm-production-import with the real guild and owner IDs to import.",
  );
}
