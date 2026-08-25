import { Login } from "@/components/auth/login";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Login />

      <div className="fixed bottom-6 right-6">
        <ThemeToggle />
      </div>
    </main>
  );
}
