import { redirect } from "next/navigation";

export default function EditBlogRedirect() {
  redirect("/admin/blogs");
}
