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

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!existingUser) {
      console.log("User Sync - Creating new user in database");
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || null,
          phone: user.user_metadata?.phone || null,
          room: user.user_metadata?.room || null,
          role: user.user_metadata?.role || "user",
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
      });
      
      console.log("User Sync - User created successfully:", newUser.email);
      return NextResponse.json({ 
        message: "User created successfully", 
        user: newUser,
        isNewUser: true 
      });
    } else {
      console.log("User Sync - User already exists, updating metadata");
      // Update existing user with latest metadata
      const updatedUser = await prisma.user.update({
        where: { email: user.email! },
        data: {
          name: user.user_metadata?.name || existingUser.name,
          phone: user.user_metadata?.phone || existingUser.phone,
          room: user.user_metadata?.room || existingUser.room,
          role: user.user_metadata?.role || existingUser.role,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : existingUser.emailVerified,
        },
      });
      
      console.log("User Sync - User updated successfully:", updatedUser.email);
      return NextResponse.json({ 
        message: "User updated successfully", 
        user: updatedUser,
        isNewUser: false 
      });
    }

  } catch (error) {
    console.error("User Sync - Error:", error);
    return NextResponse.json({ 
      error: "Failed to sync user: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
