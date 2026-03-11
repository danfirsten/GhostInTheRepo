import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/learning-path
 * Returns the user's saved learning path preference.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("user_learning_paths")
    .select("goal_id, time_id, depth_id")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data ?? null);
}

/**
 * POST /api/user/learning-path
 * Saves or updates the user's learning path preference.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goal_id, time_id, depth_id } = await request.json();

  if (!goal_id || !time_id || !depth_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("user_learning_paths").upsert(
    {
      user_id: user.id,
      goal_id,
      time_id,
      depth_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
