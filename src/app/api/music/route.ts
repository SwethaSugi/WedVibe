import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The song library couples choose from in the editor.
export async function GET() {
  const tracks = await prisma.musicTrack.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true, mood: true, url: true },
    orderBy: [{ mood: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ tracks });
}
