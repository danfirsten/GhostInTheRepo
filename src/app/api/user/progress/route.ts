import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  let query = supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  if (domain) {
    query = query.eq("domain_slug", domain);
  }

  const { data, error } = await query;

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

  const body = await request.json();
  const { content_type, content_slug, domain_slug, progress_pct } = body;

  if (!content_type || !content_slug || progress_pct === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: content_type, content_slug, progress_pct" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const completed_at = progress_pct >= 100 ? now : null;

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        content_type,
        content_slug,
        domain_slug: domain_slug ?? null,
        progress_pct: Math.min(100, Math.max(0, progress_pct)),
        completed_at,
        updated_at: now,
      },
      { onConflict: "user_id,content_type,content_slug" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
