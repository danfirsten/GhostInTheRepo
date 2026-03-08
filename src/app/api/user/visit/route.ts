import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Record a daily visit for streak tracking */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert today's visit — ignore conflict if already visited today
  const { error } = await supabase
    .from("user_daily_visits")
    .upsert(
      {
        user_id: user.id,
        visit_date: new Date().toISOString().split("T")[0],
      },
      { onConflict: "user_id,visit_date" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
