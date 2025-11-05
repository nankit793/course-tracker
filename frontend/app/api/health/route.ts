import { NextResponse } from "next/server";

// Use AWS backend for both development and production
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://test.eba-r7bifc93.us-east-1.elasticbeanstalk.com/api";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "ERROR", message: "Backend not available" },
      { status: 503 }
    );
  }
}
