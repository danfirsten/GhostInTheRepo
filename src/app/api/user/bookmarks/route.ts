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
    .from("user_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  const { content_type, content_slug, domain_slug } = await request.json();

  if (!content_type || !content_slug) {
    return NextResponse.json(
      { error: "Missing required fields: content_type, content_slug" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("user_bookmarks")
    .upsert(
      {
        user_id: user.id,
        content_type,
        content_slug,
        domain_slug: domain_slug ?? null,
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

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content_type, content_slug } = await request.json();

  const { error } = await supabase
    .from("user_bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("content_type", content_type)
    .eq("content_slug", content_slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
