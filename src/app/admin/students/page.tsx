import {
  createStudentAction,
  deleteStudentAction,
  resetUserPasswordAction,
  setUserActiveAction,
  updateStudentAction,
} from "@/actions/admin/users";
import { PeopleAdminPanel } from "@/components/admin/people-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const [students, countries] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: true,
        country: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.country.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { code: true, name: true },
    }),
  ]);

  return (
    <PeopleAdminPanel
      kind="student"
      countries={countries}
      people={students.map((student) => ({
        id: student.userId,
        name: student.user.name || student.user.email,
        email: student.user.email,
        phone: student.user.phone,
        extra: student.ageGroup,
        countryCode: student.countryCode,
        countryName: student.country?.name ?? null,
        active: student.user.active,
        count: student._count.enrollments,
      }))}
      createAction={createStudentAction}
      updateAction={updateStudentAction}
      setActiveAction={setUserActiveAction}
      deleteAction={deleteStudentAction}
      resetPasswordAction={resetUserPasswordAction}
    />
  );
}
