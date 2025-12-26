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

  // Parse Query Params
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "date"; // date, year, rating
  const filter = searchParams.get("filter") || "all";  // all, session, solo

  try {
    // 1. Build DB Query
    const where: any = {
        jellyfinUserId: session.user.Id,
    };

    if (filter === "session") {
        where.sessionCode = { not: null }; // Only likes made inside a session
    } else if (filter === "solo") {
        where.sessionCode = null; // Only likes made alone
    }

    const likes = await prisma.like.findMany({
        where,
        orderBy: { createdAt: 'desc' } // Default DB sort
    });

    if (likes.length === 0) return NextResponse.json([]);

    // 2. Fetch Metadata from Jellyfin
    const ids = likes.map(l => l.jellyfinItemId).join(",");
    const jellyfinRes = await axios.get(getJellyfinUrl(`/Items`), {
        params: {
            Ids: ids,
            Fields: "ProductionYear,CommunityRating",
        },
        headers: { "X-Emby-Token": session.user.AccessToken },
    });

    const items = jellyfinRes.data.Items;

    // 3. Merge DB Data (Date) with Jellyfin Data (Year/Rating)
    let merged = items.map((item: any) => {
        const likeData = likes.find(l => l.jellyfinItemId === item.Id);
        return {
            ...item,
            swipedAt: likeData?.createdAt,
            sessionCode: likeData?.sessionCode,
            isMatch: likeData?.isMatch
        };
    });

    // 4. Handle Sorting (In-Memory)
    if (sortBy === "year") {
        merged.sort((a: any, b: any) => (b.ProductionYear || 0) - (a.ProductionYear || 0));
    } else if (sortBy === "rating") {
        merged.sort((a: any, b: any) => (b.CommunityRating || 0) - (a.CommunityRating || 0));
    } else {
        // Date (Default)
        merged.sort((a: any, b: any) => new Date(b.swipedAt).getTime() - new Date(a.swipedAt).getTime());
    }

    return NextResponse.json(merged);

  } catch (error) {
    console.error("Fetch User Likes Error", error);
    return NextResponse.json([], { status: 500 });
  }
}