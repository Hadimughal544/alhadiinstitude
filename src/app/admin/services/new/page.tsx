import { redirect } from "next/navigation";

export default function NewServiceRedirect() {
  redirect("/admin/services");
}
