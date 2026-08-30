export type OpenMeetSpace = {
  /** Google Meet join URL, e.g. https://meet.google.com/xxx-xxxx-xxx */
  meetUrl: string;
  /** Meet REST resource name, e.g. "spaces/jQCFfuBOdN5z" — store verbatim. */
  spaceId: string;
  /** Human-typeable code, e.g. "abc-mnop-xyz". Not stable long-term. */
  meetingCode: string | null;
};

export type InstituteMeetProvider = {
  /** Create a reusable meeting room that anyone with the link can join, no knocking. */
  createOpenSpace(): Promise<OpenMeetSpace>;
  /** Look up an existing space; returns null if it no longer exists. */
  getSpace(spaceId: string): Promise<OpenMeetSpace | null>;
  /** End any live call in the space. Best-effort; no-op if nothing is active. */
  endActiveConference(spaceId: string): Promise<void>;
};
