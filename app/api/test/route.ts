import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Test API GET - Request received");
    
    return NextResponse.json({ 
      message: "Test GET successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test API GET - Error:", error);
    return NextResponse.json({ 
      error: "Test failed: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("Test API POST - Request received");
    
    const body = await req.json().catch(() => ({}));
    console.log("Test API POST - Body:", body);
    
    return NextResponse.json({ 
      message: "Test POST successful",
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test API POST - Error:", error);
    return NextResponse.json({ 
      error: "Test failed: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
