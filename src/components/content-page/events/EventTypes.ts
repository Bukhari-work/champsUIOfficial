import type { CollectionEntry } from "astro:content";

export type EventInvitationData = Pick<
  CollectionEntry<"eventDocuments">["data"],
  | "audience"
  | "objectives"
  | "speakers"
  | "originalRegistration"
  | "audienceNotes"
  | "fees"
  | "contact"
  | "practicalDetails"
>;
