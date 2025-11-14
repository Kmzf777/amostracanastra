import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function isValidCodeFormat(code: string) {
  // Remove spaces and check if it's 6 digits, or check if it's exactly 9 chars (6 digits + 3 spaces)
  const trimmedCode = code.trim();
  return /^\d{6}$/.test(trimmedCode) || (code.length === 9 && /^\d{6}\s{3}$/.test(code));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code as string | undefined;

  if (!code || !isValidCodeFormat(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  
  // Handle both 6-digit and 9-character formats
  let searchCode = code;
  if (code.length === 6 && /^\d{6}$/.test(code)) {
    // If user entered 6 digits, pad with spaces to match database format
    searchCode = code + '   ';
  }
  
  const { data, error } = await supabase
    .from("affiliates")
    .select("id, code, status")
    .eq("code", searchCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!data || data.status !== "active") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ affiliate: data }, { status: 200 });
}
