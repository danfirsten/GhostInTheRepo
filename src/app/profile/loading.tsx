import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton/ProfileSkeleton";
import styles from "./profile.module.css";

export default function ProfileLoading() {
  return (
    <div className={styles.page}>
      <ProfileSkeleton />
    </div>
  );
}
