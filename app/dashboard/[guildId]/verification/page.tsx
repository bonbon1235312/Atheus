import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildRoles, assignableRoles } from "@/lib/discord";
import { getFeatureConfigRow, setFeatureConfigRow, disableFeatureConfigRow } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function VerificationPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const roles = assignableRoles(await fetchGuildRoles(guildId));
  const cfg = await getFeatureConfigRow(guildId, "verification");
  const roleId = (cfg.config.roleId as string) ?? "";

  async function save(formData: FormData) {
    "use server";
    const r = String(formData.get("roleId") ?? "");
    if (!r) await disableFeatureConfigRow(guildId, "verification");
    else await setFeatureConfigRow(guildId, "verification", { roleId: r }, true);
    revalidatePath(`/dashboard/${guildId}/verification`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Verification</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Gate your server.</h1>
        <p className="mt-5 text-chalk/64">
          Choose the role members get when they verify. Then run <code>/verify setup</code> in Discord to post the button.
        </p>

        <form action={save} className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blurpleHi">Verified role</span>
            <select name="roleId" defaultValue={roleId} className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-blurpleHi focus:outline-none">
              <option value="">— Off —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="studio-button studio-button-primary justify-self-start">Save</button>
        </form>
      </div>
    </main>
  );
}
