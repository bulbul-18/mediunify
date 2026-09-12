import { redirect } from "next/navigation";

export default function Home() {
  // Auth will gate this in a later step — for now, land straight on the
  // dashboard so the timeline is what's demoed first.
  redirect("/dashboard");
}
