import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current logged in user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("Sync error: No user logged in");
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    console.log("Syncing user:", user.email);

    const { name, phone, room, role } = user.user_metadata;

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email: user.email! },
        data: {
          name: name ?? existingUser.name,
          phone: phone ?? existingUser.phone,
          room: room ?? existingUser.room,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : null,
        },
      });
      console.log("User updated in database:", user.email);
    } else {
      // Create new user in our database
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: name ?? null,
          phone: phone ?? null,
          room: room ?? null,
          role: role ?? "user",
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : null,
        },
      });
      console.log("User created in database:", user.email);
    }

    return NextResponse.json({ message: "User synced successfully" });

  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}