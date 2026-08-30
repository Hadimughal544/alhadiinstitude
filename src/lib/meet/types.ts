export type LectureAttendee = {
  email: string;
  name?: string | null;
};

export type CreateLectureEventInput = {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  attendees?: LectureAttendee[];
  description?: string;
};

export type UpdateLectureEventInput = CreateLectureEventInput & {
  googleEventId: string;
};

export type MeetEvent = {
  meetUrl: string;
  googleEventId: string;
};

export type MeetProvider = {
  createLectureEvent(input: CreateLectureEventInput): Promise<MeetEvent>;
  updateLectureEvent(input: UpdateLectureEventInput): Promise<MeetEvent>;
  deleteLectureEvent(googleEventId: string): Promise<void>;
};
