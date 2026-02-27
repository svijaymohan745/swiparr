import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const wizarrUrl = process.env.WIZARR_URL;
    const wizarrApiKey = process.env.WIZARR_API_KEY;

    if (!wizarrUrl || !wizarrApiKey) {
      return NextResponse.json(
        { error: "Wizarr configuration is missing on the server" },
        { status: 500 }
      );
    }

    // Step 1: Fetch servers to get server_ids
    const serversRes = await fetch(`${wizarrUrl.replace(/\/$/, '')}/api/servers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': wizarrApiKey
      },
    });

    if (!serversRes.ok) {
      const errText = await serversRes.text();
      console.error("Wizarr Servers Error:", errText);
      return NextResponse.json({ error: `Failed to fetch Wizarr servers: ${serversRes.statusText}` }, { status: serversRes.status });
    }

    const serversData = await serversRes.json();
    const serverIds = (serversData.servers || []).map((s: any) => s.id);

    // Step 2: Create a 2-day invitation via Wizarr API
    // Wizarr V3 uses X-API-Key and explicitly requires server_ids
    const invRes = await fetch(`${wizarrUrl.replace(/\/$/, '')}/api/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': wizarrApiKey
      },
      body: JSON.stringify({
        duration: "2",
        server_ids: serverIds,
        unlimited: false
      })
    });

    if (!invRes.ok) {
      const errText = await invRes.text();
      console.error("Wizarr Invitation Error:", errText);
      return NextResponse.json({ error: `Wizarr API Error: ${invRes.statusText}`, details: errText }, { status: invRes.status });
    }

    const invData = await invRes.json();
    const invCode = invData.invitation?.code || invData.code;

    // Return the invite code so the frontend can dispatch the user to the portal
    return NextResponse.json({ success: true, link: `${wizarrUrl.replace(/\/$/, '')}/j/${invCode}` });
  } catch (error: any) {
    console.error("Error communicating with Wizarr:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
