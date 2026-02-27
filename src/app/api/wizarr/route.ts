import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    const wizarrUrl = process.env.WIZARR_URL;
    const wizarrApiKey = process.env.WIZARR_API_KEY;

    if (!wizarrUrl || !wizarrApiKey) {
      return NextResponse.json(
        { error: "Wizarr configuration is missing on the server" },
        { status: 500 }
      );
    }

    // Attempt to register the user directly via Wizarr API
    // We pass the required fields for registration. 
    // The admin API key allows us to perform this action.
    const response = await fetch(`${wizarrUrl.replace(/\/$/, '')}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wizarrApiKey}`
      },
      body: JSON.stringify({
        name: username, // Using username as name
        username,
        email,
        password,
        // Assuming default roles set in Wizarr for invites apply, 
        // or passing specific fields if known (like duration/permissions)
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Wizarr Error:", errText);
        return NextResponse.json({ error: `Wizarr API Error: ${response.statusText}`, details: errText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error communicating with Wizarr:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
