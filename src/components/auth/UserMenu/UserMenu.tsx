"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, SignOut, GearSix } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { GhostLogo } from "@/components/ui/GhostLogo";
import styles from "./UserMenu.module.css";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserMenuProps {
  user: SupabaseUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Ghost";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        className={styles.avatarBtn}
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        type="button"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className={styles.avatarImg}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
          />
        ) : (
          <GhostLogo size={22} />
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownName}>{displayName}</span>
            <span className={styles.dropdownEmail}>{user.email}</span>
          </div>
          <div className={styles.dropdownDivider} />
          <a
            href="/profile"
            className={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            <User size={16} weight="regular" />
            Profile
          </a>
          <a
            href="/profile/settings"
            className={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            <GearSix size={16} weight="regular" />
            Settings
          </a>
          <div className={styles.dropdownDivider} />
          <button
            className={styles.dropdownItem}
            onClick={handleSignOut}
            type="button"
          >
            <SignOut size={16} weight="regular" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
