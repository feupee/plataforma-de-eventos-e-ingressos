"use client";

import { useState } from "react";

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
import Link from "next/dist/client/link";

export function Login() {
  const [isCadastro, setIsCadastro] = useState(false);

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
          onClick={() => setIsCadastro(!isCadastro)}
        >
          {isCadastro ? "Login" : "Cadastro"}
        </Button>
      </CardHeader>

      <CardContent className="pb-2">
        <form>
          <div className="flex flex-col gap-6">
            {isCadastro && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            {isCadastro && (
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                />
              </div>
            )}

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
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-2">
        {/* Refazer com autenticação */}
        <Link href="/cliente" className="w-full">
          <Button type="submit" className="w-full">
            {isCadastro ? "Cadastrar" : "Login"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}