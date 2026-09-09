import {
  createTeacherAction,
  deleteTeacherAction,
  resetUserPasswordAction,
  setUserActiveAction,
  updateTeacherAction,
} from "@/actions/admin/users";
import { PeopleAdminPanel } from "@/components/admin/people-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage() {
  const [teachers, countries] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: true,
        country: { select: { name: true } },
        _count: { select: { lectures: true } },
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
      kind="teacher"
      countries={countries}
      people={teachers.map((teacher) => ({
        id: teacher.userId,
        name: teacher.user.name || teacher.user.email,
        email: teacher.user.email,
        phone: teacher.user.phone,
        extra: teacher.specialization,
        countryCode: teacher.countryCode,
        countryName: teacher.country?.name ?? null,
        active: teacher.user.active,
        count: teacher._count.lectures,
      }))}
      createAction={createTeacherAction}
      updateAction={updateTeacherAction}
      setActiveAction={setUserActiveAction}
      deleteAction={deleteTeacherAction}
      resetPasswordAction={resetUserPasswordAction}
    />
  );
}
