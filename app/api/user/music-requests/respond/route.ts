import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const status = action === 'accept' ? 'Alternative Accepted' : 'Alternative Rejected';

    const updatedRequest = await prisma.musicRequest.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        status
      }
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("POST /api/user/music-requests/respond error:", error);
    return NextResponse.json({ error: "Failed to respond to alternative" }, { status: 500 });
  }
}
