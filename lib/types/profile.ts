export interface UserProfile {
  /** Slugified, unique per browser — used as the key attempts are tagged with. */
  username: string;
  name: string;
  createdAt: string;
}
