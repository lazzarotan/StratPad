import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login");
  }

  return(
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">

      <AccountForm
        name={session.user.name}
        username={session.user.username}
        email={session.user.email}
        image={session.user.image}
      />
    </div>
  );
} 
