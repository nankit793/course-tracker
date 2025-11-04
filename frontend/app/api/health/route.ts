import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
