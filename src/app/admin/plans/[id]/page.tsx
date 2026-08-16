import { redirect } from "next/navigation";

export default function EditPlanRedirect() {
  redirect("/admin/plans");
}
