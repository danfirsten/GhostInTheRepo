import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { badge_ids } = await request.json();

  if (!Array.isArray(badge_ids) || badge_ids.length === 0) {
    return NextResponse.json(
      { error: "badge_ids must be a non-empty array" },
      { status: 400 }
    );
  }

  const rows = badge_ids.map((badge_id: string) => ({
    user_id: user.id,
    badge_id,
    earned_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("user_badges")
    .upsert(rows, { onConflict: "user_id,badge_id" })
    .select("badge_id, earned_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
