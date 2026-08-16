import { redirect } from "next/navigation";

export default function EditServiceRedirect() {
  redirect("/admin/services");
}
