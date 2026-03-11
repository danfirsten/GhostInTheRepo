import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: fetch note for a specific content item
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("content_type");
  const contentSlug = searchParams.get("content_slug");

  if (!contentType || !contentSlug) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { data } = await supabase
    .from("user_notes")
    .select("note_text, updated_at")
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .eq("content_slug", contentSlug)
    .single();

  return NextResponse.json(data ?? { note_text: "", updated_at: null });
}

// PUT: create or update note
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content_type, content_slug, domain_slug, note_text } =
    await request.json();

  if (!content_type || !content_slug) {
    return NextResponse.json(
      { error: "Missing required fields: content_type, content_slug" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("user_notes").upsert(
    {
      user_id: user.id,
      content_type,
      content_slug,
      domain_slug: domain_slug ?? null,
      note_text: note_text ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,content_type,content_slug" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
