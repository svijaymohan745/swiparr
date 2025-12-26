import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import axios from "axios";
import { sessionOptions } from "@/lib/session";
import { getJellyfinUrl } from "@/lib/jellyfin/api";
import { SessionData } from "@/types/swiparr";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Get existing interactions from DB (Likes and Hiddens)
        // We fetch just the IDs to filter memory efficiently
        const [liked, hidden] = await Promise.all([
            prisma.like.findMany({
                where: { jellyfinUserId: session.user.Id },
                select: { jellyfinItemId: true }
            }),
            prisma.hidden.findMany({
                where: { jellyfinUserId: session.user.Id },
                select: { jellyfinItemId: true }
            })
        ]);

        const excludeIds = new Set([
            ...liked.map(l => l.jellyfinItemId),
            ...hidden.map(h => h.jellyfinItemId)
        ]);

        // 2. Query Jellyfin (Grab 50 random unwatched, movies only for now)
        const jellyfinRes = await axios.get(getJellyfinUrl(`/Users/${session.user.Id}/Items`), {
            params: {
                IncludeItemTypes: "Movie",
                Recursive: true,
                SortBy: "Name",
                Limit: 50,
                Fields: "Overview,RunTimeTicks,ProductionYear,CommunityRating",
                Filters: "IsUnplayed", // or remove this if you want to re-watch stuff
            },
            headers: { "X-Emby-Token": session.user.AccessToken },
        });

        const items = jellyfinRes.data.Items || [];

        // 3. Filter out items we already swiped on
        const deck = items.filter((item: any) => !excludeIds.has(item.Id));

        return NextResponse.json(deck);
    } catch (error) {
        console.error("Fetch Items Error", error);
        return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
    }
}