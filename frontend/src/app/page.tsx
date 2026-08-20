import { Login } from "@/components/login";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
  <Login />

  <div className="fixed bottom-6 right-6">
    <ThemeToggle />
  </div>
</main>
  );
}
