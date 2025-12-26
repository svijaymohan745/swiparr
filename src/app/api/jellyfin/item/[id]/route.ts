import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { getJellyfinUrl } from "@/lib/jellyfin/api";
import { cookies } from "next/headers";
import axios from "axios";
import { SessionData } from "@/types/swiparr";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    const jellyfinRes = await axios.get(getJellyfinUrl(`/Users/${session.user.Id}/Items/${id}`), {
      headers: { "X-Emby-Token": session.user.AccessToken },
    });

    return NextResponse.json(jellyfinRes.data);
  } catch (error) {
    console.error("Fetch Details Error", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}