import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    console.log("User Sync - Syncing user:", user.email);

    // Optimized: Use upsert for single operation
    const userData = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0] || null,
      phone: user.user_metadata?.phone || null,
      room: user.user_metadata?.room || null,
      role: user.user_metadata?.role || "user",
      emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
    };

    const syncedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: userData,
      create: userData,
    });

    const isNewUser = !syncedUser.createdAt || syncedUser.createdAt.getTime() === Date.now();
    
    console.log("User Sync - User synced successfully:", syncedUser.email);
    return NextResponse.json({ 
      message: isNewUser ? "User created successfully" : "User updated successfully", 
      user: syncedUser,
      isNewUser 
    });

  } catch (error) {
    console.error("User Sync - Error:", error);
    return NextResponse.json({ 
      error: "Failed to sync user: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
