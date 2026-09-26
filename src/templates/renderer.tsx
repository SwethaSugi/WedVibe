import type { ComponentType } from "react";
import { InvitationData } from "@/lib/invitation-types";
import { RoyalGold } from "./components/RoyalGold";
import { FloralLove } from "./components/FloralLove";
import { ModernElegant } from "./components/ModernElegant";
import { RoyalRajputana } from "./components/RoyalRajputana";
import { CelestialCinema } from "./components/CelestialCinema";
import { BohoBotanica } from "./components/BohoBotanica";
import { AuraMinimal } from "./components/AuraMinimal";
import { HaldiSunshine } from "./components/HaldiSunshine";
import { JashnEMehendi } from "./components/JashnEMehendi";
import { ModernAura } from "./components/ModernAura";
import { EmeraldNikah } from "./components/EmeraldNikah";
import { RingOfEternity } from "./components/RingOfEternity";
import { SereneChapel } from "./components/SereneChapel";
import { TempleBells } from "./components/TempleBells";
import { VelvetRoyale } from "./components/VelvetRoyale";
import { ChampagneNoir } from "./components/ChampagneNoir";
import { CosmicVows } from "./components/CosmicVows";
import { RiversideHeritage } from "./components/RiversideHeritage";
import { RoyalPunjabi } from "./components/RoyalPunjabi";
import { WeddingChronicle } from "./components/WeddingChronicle";
import { GoldenDoors } from "./components/GoldenDoors";
import { BlushSeal } from "./components/BlushSeal";
import { MidnightPromise } from "./components/MidnightPromise";

// Template rendering engine: given a componentKey + standardized invitation data,
// pick the right registered template component. Adding a new template means
// registering it here — no changes required to editor, preview or public pages.
const TEMPLATE_COMPONENTS: Record<string, ComponentType<{ data: InvitationData }>> = {
  "royal-gold": RoyalGold,
  "floral-love": FloralLove,
  "modern-elegant": ModernElegant,
  "royal-rajputana": RoyalRajputana,
  "celestial-cinema": CelestialCinema,
  "boho-botanica": BohoBotanica,
  "aura-minimal": AuraMinimal,
  "haldi-sunshine": HaldiSunshine,
  "mehendi-nights": JashnEMehendi,
  "modern-aura": ModernAura,
  "emerald-nikah": EmeraldNikah,
  "ring-of-eternity": RingOfEternity,
  "serene-chapel": SereneChapel,
  "temple-bells": TempleBells,
  "velvet-royale": VelvetRoyale,
  "champagne-noir": ChampagneNoir,
  "cosmic-vows": CosmicVows,
  "riverside-heritage": RiversideHeritage,
  "royal-punjabi": RoyalPunjabi,
  "wedding-chronicle": WeddingChronicle,
  "golden-doors": GoldenDoors,
  "blush-seal": BlushSeal,
  "midnight-promise": MidnightPromise,
};

export function TemplateRenderer({ componentKey, data }: { componentKey: string; data: InvitationData }) {
  const Component = TEMPLATE_COMPONENTS[componentKey];
  if (!Component) {
    return <div className="p-8 text-center text-red-500">Template not found: {componentKey}</div>;
  }
  return <Component data={data} />;
}
