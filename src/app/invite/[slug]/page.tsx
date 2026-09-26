import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/templates/renderer";
import { InvitationData } from "@/lib/invitation-types";

async function getInvitation(slug: string) {
  const invitation = await prisma.invitation.findUnique({ where: { slug }, include: { template: true } });
  if (!invitation || !["ACTIVE", "PUBLISHED"].includes(invitation.status)) return null;
  return invitation;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) return { title: "Invitation not found" };

  const data: InvitationData = JSON.parse(invitation.invitationData);
  const title = `${data.groomName} & ${data.brideName} — Wedding Invitation`;
  const description = `You are invited to celebrate the wedding of ${data.groomName} and ${data.brideName}.`;

  return {
    title,
    description,
    openGraph: { title, description, images: data.coupleImage ? [data.coupleImage] : undefined },
  };
}

export default async function PublicInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Invitation Not Available</h1>
          <p className="text-neutral-500 mt-2">This invitation link is inactive or no longer exists.</p>
        </div>
      </div>
    );
  }

  await prisma.invitation.update({ where: { id: invitation.id }, data: { views: { increment: 1 } } });

  const data: InvitationData = JSON.parse(invitation.invitationData);

  return <TemplateRenderer componentKey={invitation.template.componentKey} data={data} />;
}
