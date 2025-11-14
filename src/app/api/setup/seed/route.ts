import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function randomSix() {
  let s = "";
  for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export async function GET() {
  const supabase = getSupabaseServer();

  const { count, error: countErr } = await supabase
    .from("affiliates")
    .select("id", { count: "exact", head: true });

  if (countErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if ((count || 0) > 0) {
    const { data: existing, error: exErr } = await supabase
      .from("affiliates")
      .select("code, status")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (exErr) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ seeded: false, code: existing?.code || null }, { status: 200 });
  }

  let code = randomSix();
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from("affiliates")
      .select("id")
      .eq("code", code)
      .limit(1)
      .maybeSingle();
    if (!data) break;
    code = randomSix();
  }

  const { error: insErr } = await supabase
    .from("affiliates")
    .insert({ code, status: "active" });
  if (insErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ seeded: true, code }, { status: 200 });
}