import { redirect } from "next/navigation";

export default function NewPlanRedirect() {
  redirect("/admin/plans");
}
