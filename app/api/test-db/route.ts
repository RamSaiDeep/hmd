import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      {
        error: "Supabase environment variables are missing",
        missing: {
          NEXT_PUBLIC_SUPABASE_URL: !supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !anonKey,
          DATABASE_URL: !databaseUrl,
        },
      },
      { status: 500 }
    );
  }

  try {
    const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/`;
    const response = await fetch(restUrl, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    let prismaConnected = false;
    let prismaError: string | undefined;
    try {
      await prisma.$queryRaw`SELECT 1`;
      prismaConnected = true;
    } catch (error) {
      prismaError = error instanceof Error ? error.message : "Unknown Prisma error";
    }

    if (response.ok) {
      return NextResponse.json({
        status: "Supabase API reachable",
        restEndpoint: restUrl,
        prismaConnected,
        prismaError,
        env: {
          hasSupabaseUrl: !!supabaseUrl,
          hasAnonKey: !!anonKey,
          hasServiceRoleKey: !!serviceRoleKey,
          hasDatabaseUrl: !!databaseUrl,
          databaseUrlLength: databaseUrl?.length || 0,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Supabase API not reachable with provided key",
          restEndpoint: restUrl,
          status: response.status,
          prismaConnected,
          prismaError,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    let prismaConnected = false;
    let prismaError: string | undefined;
    try {
      await prisma.$queryRaw`SELECT 1`;
      prismaConnected = true;
    } catch (prismaConnectionError) {
      prismaError =
        prismaConnectionError instanceof Error
          ? prismaConnectionError.message
          : "Unknown Prisma error";
    }

    return NextResponse.json(
      {
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        prismaConnected,
        prismaError,
      },
      { status: 500 }
    );
  }
}
