import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { fetchGuildRoles, assignableRoles } from "@/lib/discord";
import { getJoinRoles, addJoinRole, removeJoinRole } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function JoinRolePage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);

  const roles = assignableRoles(await fetchGuildRoles(guildId));
  const current = await getJoinRoles(guildId);
  const currentSet = new Set(current);
  const nameOf = new Map(roles.map((r) => [r.id, r.name] as const));
  const available = roles.filter((r) => !currentSet.has(r.id));

  async function add(formData: FormData) {
    "use server";
    const roleId = String(formData.get("roleId") ?? "");
    if (roleId) await addJoinRole(guildId, roleId);
    revalidatePath(`/dashboard/${guildId}/join-role`);
  }

  async function remove(formData: FormData) {
    "use server";
    const roleId = String(formData.get("roleId") ?? "");
    if (roleId) await removeJoinRole(guildId, roleId);
    revalidatePath(`/dashboard/${guildId}/join-role`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">
          ← {guild.name}
        </Link>
        <p className="kicker mt-6">Join roles</p>
        <h1 className="type-display mt-4 text-5xl font-semibold leading-[0.98] md:text-6xl">
          Give new members their roles.
        </h1>
        <p className="mt-6 text-lg text-chalk/68">
          Everyone who joins <strong>{guild.name}</strong> is automatically given
          every role below. Add as many as you like.
        </p>

        {/* Current join roles */}
        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">
            Current join roles
          </p>
          {current.length === 0 ? (
            <p className="mt-4 text-chalk/55">None yet — add one below.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {current.map((roleId) => (
                <li key={roleId}>
                  <form action={remove} className="inline-flex">
                    <input type="hidden" name="roleId" value={roleId} />
                    <button
                      type="submit"
                      className="group inline-flex items-center gap-2 border border-white/15 bg-ink px-3 py-2 text-sm transition-colors hover:border-acid"
                      title="Remove this join role"
                    >
                      <span>{nameOf.get(roleId) ?? `Role ${roleId}`}</span>
                      <span className="text-chalk/40 transition-colors group-hover:text-acid">
                        ✕
                      </span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add a join role */}
        <form action={add} className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Add a role
            </span>
            <select
              name="roleId"
              defaultValue=""
              disabled={available.length === 0}
              className="border border-white/15 bg-ink px-4 py-3 text-lg text-chalk focus:border-acid focus:outline-none disabled:opacity-50"
            >
              <option value="" disabled>
                {available.length ? "Choose a role…" : "All roles already added"}
              </option>
              {available.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="studio-button studio-button-primary"
            disabled={available.length === 0}
          >
            Add role
          </button>
        </form>

        <p className="mt-8 text-sm text-chalk/45">
          Same data as the <code>/join-role</code> command — change it here or in
          Discord, they stay in sync.
        </p>
      </div>
    </main>
  );
}
