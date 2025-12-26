import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getJellyfinUrl } from "@/lib/jellyfin/api";
import axios from "axios";
import { SessionData } from "@/types/swiparr";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) return new NextResponse("Unauthorized", { status: 401 });

  // If no session, show personal likes? Or just empty. Let's return empty for now.
  if (!session.sessionCode) return NextResponse.json([]);

  try {
    // 1. Get all matches involved in this session
    const matches = await prisma.like.findMany({
      where: {
        sessionCode: session.sessionCode,
        isMatch: true,
      },
      // Distinct to avoid showing the same movie twice (once for user A, once for user B)
      distinct: ['jellyfinItemId'],
      orderBy: { createdAt: 'desc' }
    });

    if (matches.length === 0) return NextResponse.json([]);

    // 2. We need movie details (Name, Year). Database only has IDs.
    // We will fetch details from Jellyfin for these matched IDs.
    const ids = matches.map(m => m.jellyfinItemId).join(",");
    
    const jellyfinRes = await axios.get(getJellyfinUrl(`/Items`), {
      params: {
        Ids: ids,
        Fields: "ProductionYear,CommunityRating",
      },
      headers: { "X-Emby-Token": session.user.AccessToken },
    });

    return NextResponse.json(jellyfinRes.data.Items);

  } catch (error) {
    console.error("Error fetching matches", error);
    return NextResponse.json([], { status: 500 });
  }
}