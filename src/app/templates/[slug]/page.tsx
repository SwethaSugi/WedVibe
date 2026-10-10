import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/templates/renderer";
import { sampleInvitationData } from "@/lib/sample-invitation";
import { UseTemplateButton } from "@/components/UseTemplateButton";
import { PriceTag } from "@/components/PriceTag";
import { OrderOnWhatsAppButton } from "@/components/OrderOnWhatsAppButton";
import { ORDER_MODE } from "@/lib/site-config";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await prisma.template.findUnique({ where: { slug } });

  if (!template || template.status === "INACTIVE") {
    notFound();
  }

  const sampleData = sampleInvitationData(template.componentKey);

  return (
    <div className="w-full">
      <div className="border-b border-neutral-200 bg-white sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-[8rem] flex-1">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{template.category}</p>
            <h1 className="text-lg sm:text-xl font-semibold truncate">{template.name}</h1>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
            <PriceTag template={template} size="md" priceClassName="text-neutral-900" className="min-w-0 sm:justify-end sm:text-right" />
            {ORDER_MODE === "whatsapp" ? (
              <OrderOnWhatsAppButton template={template} className="px-5 py-3 text-sm" />
            ) : (
              <UseTemplateButton templateId={template.id} templateSlug={template.slug} />
            )}
          </div>
        </div>
      </div>

      <div className="bg-neutral-100 py-8 sm:py-10 px-4">
        <div className="max-w-md mx-auto mb-5 text-center">
          {template.description && <p className="text-sm text-neutral-600">{template.description}</p>}
          <p className="text-xs text-neutral-400 mt-1.5">Shown with sample names and photos — your own details replace them.</p>
        </div>
        {/* `isolate` keeps the template's own z-indexed layers (opening doors/seals, petals)
            inside this card, so they never paint over the sticky site header while scrolling. */}
        <div className="relative isolate max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
          <TemplateRenderer componentKey={template.componentKey} data={sampleData} />
        </div>
      </div>
    </div>
  );
}
