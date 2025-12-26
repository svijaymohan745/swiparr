import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { authenticateJellyfin } from "@/lib/jellyfin/api";
import { cookies } from "next/headers";
import { SessionData } from "@/types/swiparr";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Log the attempt (Don't log the password!)
    console.log(`[Auth] Attempting login for user: ${username}`);

    const jellyfinUser = await authenticateJellyfin(username, password);
    console.log("[Auth] Jellyfin API accepted credentials. User ID:", jellyfinUser.User.Id);

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    session.user = {
      Id: jellyfinUser.User.Id,
      Name: jellyfinUser.User.Name,
      AccessToken: jellyfinUser.AccessToken,
    };
    session.isLoggedIn = true;
    
    await session.save();
    console.log("[Auth] Session cookie saved.");

    return NextResponse.json({ success: true, user: session.user });

  } catch (error: any) {
    console.error("[Auth] Login Failed:", error.message);
    
    // Check for specific Axios error response from Jellyfin
    if (error?.response) {
       console.error("[Auth] Jellyfin Status:", error.response.status);
       console.error("[Auth] Jellyfin Data:", JSON.stringify(error.response.data));
       
       if (error.response.status === 401) {
           return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
       }
    }

    return NextResponse.json(
      { message: "Server connection failed or invalid credentials" },
      { status: 500 }
    );
  }
}