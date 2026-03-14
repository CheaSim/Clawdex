import { SiteShell } from "@/components/site-shell";
import { ProductShowcase } from "@/components/showcase/product-showcase";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  return (
    <SiteShell>
      <ProductShowcase players={players} challenges={challenges} />
    </SiteShell>
  );
}
