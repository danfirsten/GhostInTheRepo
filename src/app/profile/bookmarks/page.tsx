import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookmarksClient } from "./BookmarksClient";
import styles from "../profile.module.css";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className={styles.page}>
      <h1 className="sr-only">Bookmarks</h1>
      <BookmarksClient />
    </div>
  );
}
