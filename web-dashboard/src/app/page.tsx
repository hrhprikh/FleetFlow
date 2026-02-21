import { redirect } from "next/navigation";

export default function Home() {
  // Directly point to the login page.
  // The middleware.ts will automatically catch authenticated users here and redirect them to /dashboard
  redirect("/login");
}
