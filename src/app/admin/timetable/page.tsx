import { TimetableAdminPanel } from "@/components/admin/timetable-admin-panel";
import { prisma } from "@/lib/prisma";
import { getAllLectures, listActiveStudents, listActiveTeachers } from "@/lib/timetable/queries";

export const dynamic = "force-dynamic";

export default async function AdminTimetablePage() {
  const [lectures, teachers, students, services] = await Promise.all([
    getAllLectures(),
    listActiveTeachers(),
    listActiveStudents(),
    prisma.service.findMany({
      where: { active: true },
      select: { id: true, title: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <TimetableAdminPanel
      lectures={lectures}
      teachers={teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.user.name || teacher.user.email,
        googleConnected: teacher.googleConnected,
      }))}
      students={students.map((student) => ({
        id: student.id,
        name: student.user.name || student.user.email,
      }))}
      services={services}
    />
  );
}
