import { redirect } from "next/navigation";

export default function NewCountryRedirect() {
  redirect("/admin/countries");
}
