import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { initiateQuickConnect, checkQuickConnect } from "@/lib/jellyfin/api";
import { cookies } from "next/headers";
import { SessionData } from "@/types/swiparr";

export async function GET() {
  try {
    const data = await initiateQuickConnect();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Quick connect not available" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    const authData = await checkQuickConnect(secret);

    // If not yet authorized, authData will not contain AccessToken
    if (!authData.AccessToken || !authData.User?.Id) {
      return NextResponse.json({ success: false, message: "Pending" });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    session.user = {
      Id: authData.User.Id,
      Name: authData.User.Name,
      AccessToken: authData.AccessToken,
    };
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}