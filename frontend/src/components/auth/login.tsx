"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { loginUser, registerUser } from "@/lib/api/auth";
import { useAuth } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  const router = useRouter();

  const { setSession } = useAuth();

  const [isCadastro, setIsCadastro] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (isCadastro) {
        const result = await registerUser(name, email, password);

        setSession(result.access_token, result.user);

        router.push("/cliente");
        return;
      }

      const result = await loginUser(email, password);

      setSession(result.access_token, result.user);

      if (result.user.role === "ORGANIZER") {
        router.push("/organizador");
        return;
      }

      if (result.user.role === "GATE") {
        router.push("/portaria");
        return;
      }

      router.push("/cliente");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isCadastro
            ? "Não foi possível realizar o cadastro."
            : "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleModeChange() {
    setIsCadastro((current) => !current);
    setError(null);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative">
        <CardTitle className="text-center">
          {isCadastro ? "Faça Cadastro" : "Faça Login"}
        </CardTitle>

        <Button
          type="button"
          variant="link"
          className="absolute right-6 h-auto p-0"
          disabled={loading}
          onClick={handleModeChange}
        >
          {isCadastro ? "Login" : "Cadastro"}
        </Button>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-6">
            {isCadastro && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>

                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  disabled={loading}
                  required
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>

              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                disabled={loading}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {isCadastro && (
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>

                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  disabled={loading}
                  required
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>

              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                disabled={loading}
                autoComplete={isCadastro ? "new-password" : "current-password"}
                minLength={6}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? isCadastro
                ? "Cadastrando..."
                : "Entrando..."
              : isCadastro
                ? "Cadastrar"
                : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
