"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { generatePassword, hashPassword } from "@/lib/passwords";
import { toActionError } from "@/lib/action-result";

export type UserActionResult =
  | { ok: true; id: string; message?: string; generatedPassword?: string }
  | { ok: false; error: string };

const teacherSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().optional().nullable(),
  specialization: z.string().trim().optional().nullable(),
  countryCode: z.string().trim().min(1, "Country is required."),
  password: z.string().optional().nullable(),
});

const studentSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().optional().nullable(),
  ageGroup: z.string().trim().optional().nullable(),
  countryCode: z.string().trim().min(1, "Country is required."),
  password: z.string().optional().nullable(),
});

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function resolvePassword(raw: string | null | undefined) {
  const provided = raw?.trim();
  if (provided && provided.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (provided) {
    return { password: provided, generated: false };
  }
  return { password: generatePassword(), generated: true };
}

function revalidatePeople() {
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/students");
  revalidatePath("/admin/timetable");
}

export async function createTeacherAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const parsed = teacherSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialization: formData.get("specialization"),
      countryCode: formData.get("countryCode"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Check the form fields." };
    }

    const countryCode = await assertCountryExists(parsed.data.countryCode);
    const { password, generated } = resolvePassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: emptyToNull(parsed.data.phone),
        password: await hashPassword(password),
        role: "TEACHER",
        active: true,
        teacher: {
          create: {
            specialization: emptyToNull(parsed.data.specialization),
            countryCode,
          },
        },
      },
    });

    revalidatePeople();
    return {
      ok: true,
      id: user.id,
      message: "Teacher created.",
      generatedPassword: generated ? password : undefined,
    };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not create the teacher.") };
  }
}

export async function updateTeacherAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const parsed = teacherSchema.omit({ password: true }).safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialization: formData.get("specialization"),
      countryCode: formData.get("countryCode"),
    });
    if (!id || !parsed.success) {
      return { ok: false, error: parsed.success ? "Missing teacher id." : parsed.error.issues[0]?.message || "Check the form fields." };
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: id },
    });
    if (!teacher) return { ok: false, error: "Teacher not found." };

    const countryCode = await assertCountryExists(parsed.data.countryCode);
    await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: emptyToNull(parsed.data.phone),
        teacher: {
          update: {
            specialization: emptyToNull(parsed.data.specialization),
            countryCode,
          },
        },
      },
    });

    revalidatePeople();
    return { ok: true, id, message: "Teacher updated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not update the teacher.") };
  }
}

async function assertCountryExists(countryCode: string) {
  const country = await prisma.country.findUnique({ where: { code: countryCode } });
  if (!country) throw new Error("Choose a valid country.");
  return country.code;
}

export async function createStudentAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const parsed = studentSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      ageGroup: formData.get("ageGroup"),
      countryCode: formData.get("countryCode"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Check the form fields." };
    }

    const countryCode = await assertCountryExists(parsed.data.countryCode);
    const { password, generated } = resolvePassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: emptyToNull(parsed.data.phone),
        password: await hashPassword(password),
        role: "STUDENT",
        active: true,
        student: {
          create: {
            ageGroup: emptyToNull(parsed.data.ageGroup),
            countryCode,
          },
        },
      },
    });

    revalidatePeople();
    return {
      ok: true,
      id: user.id,
      message: "Student created.",
      generatedPassword: generated ? password : undefined,
    };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not create the student.") };
  }
}

export async function updateStudentAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const parsed = studentSchema.omit({ password: true }).safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      ageGroup: formData.get("ageGroup"),
      countryCode: formData.get("countryCode"),
    });
    if (!id || !parsed.success) {
      return { ok: false, error: parsed.success ? "Missing student id." : parsed.error.issues[0]?.message || "Check the form fields." };
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId: id } });
    if (!student) return { ok: false, error: "Student not found." };

    const countryCode = await assertCountryExists(parsed.data.countryCode);
    await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: emptyToNull(parsed.data.phone),
        student: {
          update: {
            ageGroup: emptyToNull(parsed.data.ageGroup),
            countryCode,
          },
        },
      },
    });

    revalidatePeople();
    return { ok: true, id, message: "Student updated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not update the student.") };
  }
}

export async function setUserActiveAction(
  userId: string,
  active: boolean
): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== "TEACHER" && user.role !== "STUDENT")) {
      return { ok: false, error: "User not found." };
    }
    await prisma.user.update({ where: { id: userId }, data: { active } });
    revalidatePeople();
    return { ok: true, id: userId, message: active ? "Account reactivated." : "Account deactivated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not update the account.") };
  }
}

export async function resetUserPasswordAction(userId: string): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== "TEACHER" && user.role !== "STUDENT")) {
      return { ok: false, error: "User not found." };
    }
    const password = generatePassword();
    await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(password) },
    });
    revalidatePeople();
    return {
      ok: true,
      id: userId,
      message: "Password reset. Copy it now — it will not be shown again.",
      generatedPassword: password,
    };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not reset the password.") };
  }
}

export async function deleteTeacherAction(userId: string): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: { _count: { select: { lectures: true } } },
    });
    if (!teacher) return { ok: false, error: "Teacher not found." };
    if (teacher._count.lectures > 0) {
      return {
        ok: false,
        error: "Remove this teacher's lectures from the timetable before deleting the account.",
      };
    }
    await prisma.user.delete({ where: { id: userId } });
    revalidatePeople();
    return { ok: true, id: userId, message: "Teacher deleted." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the teacher.") };
  }
}

export async function deleteStudentAction(userId: string): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!student) return { ok: false, error: "Student not found." };
    if (student._count.enrollments > 0) {
      return {
        ok: false,
        error: "Unenroll this student from timetable lectures before deleting the account.",
      };
    }
    await prisma.user.delete({ where: { id: userId } });
    revalidatePeople();
    return { ok: true, id: userId, message: "Student deleted." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the student.") };
  }
}
