import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Login() {
  return (
    <Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle className="text-center">Faça Login</CardTitle>
  </CardHeader>

  <CardContent className="pb-2">
    <form>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            required
          />
        </div>
      </div>
    </form>

    <div className="mt-2 flex items-center">
      <Button variant="link" className="h-auto p-0">
        Cadastro
      </Button>

      <a
        href="#"
        className="ml-auto text-sm underline-offset-4 hover:underline"
      >
        Esqueceu sua senha?
      </a>
    </div>
  </CardContent>

  <CardFooter className="flex-col gap-2 pt-2">
    <Button type="submit" className="w-full">
      Login
    </Button>

    <Button variant="outline" className="w-full">
      Login with Google
    </Button>
  </CardFooter>
</Card>
  )
}
