import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireManagedGuild } from "@/lib/dashboard-access";
import { getBackupsWeb, deleteBackupWeb } from "@/lib/guild-config";

type Params = { params: Promise<{ guildId: string }> };

export default async function BackupsPage({ params }: Params) {
  const { guildId } = await params;
  const guild = await requireManagedGuild(guildId);
  const backups = await getBackupsWeb(guildId);

  async function remove(formData: FormData) {
    "use server";
    await deleteBackupWeb(guildId, String(formData.get("id")));
    revalidatePath(`/dashboard/${guildId}/backups`);
  }

  return (
    <main className="section-pad">
      <div className="container-studio max-w-2xl">
        <Link href={`/dashboard/${guildId}`} className="studio-link text-sm">← {guild.name}</Link>
        <p className="kicker mt-6">Backups</p>
        <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">Server snapshots.</h1>
        <p className="mt-5 text-chalk/64">
          Create and restore with <code>/backup create</code> and <code>/backup restore</code> in Discord. Manage them here.
        </p>

        {backups.length === 0 ? (
          <p className="mt-8 text-chalk/55">No backups yet. Make one with <code>/backup create</code>.</p>
        ) : (
          <ul className="mt-8 grid gap-3">
            {backups.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-graphite p-4">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{b.name}</span>
                  <span className="block text-sm text-chalk/45">{new Date(b.createdAt).toLocaleString("en-GB")}</span>
                </span>
                <form action={remove}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="studio-button studio-button-secondary shrink-0">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
