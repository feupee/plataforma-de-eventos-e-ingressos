"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Etapa = "ingressos" | "pagamento" | "aprovado" | "recusado";

export function Reservation() {
  const [etapa, setEtapa] = useState<Etapa>("ingressos");

  const [inteira, setInteira] = useState(0);
  const [meia, setMeia] = useState(0);

  const precoInteira = 100;
  const precoMeia = 50;

  const quantidade = inteira + meia;

  const total = inteira * precoInteira + meia * precoMeia;

  function aumentarInteira() {
    if (quantidade < 10) {
      setInteira(inteira + 1);
    }
  }

  function aumentarMeia() {
    if (quantidade < 10) {
      setMeia(meia + 1);
    }
  }

  function diminuirInteira() {
    if (inteira > 0) {
      setInteira(inteira - 1);
    }
  }

  function diminuirMeia() {
    if (meia > 0) {
      setMeia(meia - 1);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 p-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Informações do evento */}
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src="/carousel/evento1.png"
            alt="Festival de Música 2026"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">Shows & Música</p>

          <h1 className="mt-1 text-3xl font-bold">Festival de Música 2026</h1>

          <div className="mt-4 flex flex-col gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />

              <span>12 de Setembro de 2026 às 20:00</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />

              <span>Uberlândia - MG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de ingressos */}
      {etapa === "ingressos" && (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Escolha seus ingressos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Inteira */}
            <div className="flex items-center justify-between border-b pb-5">
              <div>
                <p className="font-semibold">Inteira</p>

                <p className="text-sm text-muted-foreground">
                  R$ {precoInteira.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={diminuirInteira}
                  disabled={inteira === 0}
                >
                  <Minus />
                </Button>

                <span className="w-6 text-center font-semibold">{inteira}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={aumentarInteira}
                  disabled={quantidade >= 10}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            {/* Meia */}
            <div className="flex items-center justify-between border-b pb-5">
              <div>
                <p className="font-semibold">Meia-entrada</p>

                <p className="text-sm text-muted-foreground">
                  R$ {precoMeia.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={diminuirMeia}
                  disabled={meia === 0}
                >
                  <Minus />
                </Button>

                <span className="w-6 text-center font-semibold">{meia}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={aumentarMeia}
                  disabled={quantidade >= 10}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Limite de 10 ingressos por reserva.
            </p>

            {/* Resumo */}
            <div className="space-y-2">
              {inteira > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{inteira}x Inteira</span>

                  <span>R$ {(inteira * precoInteira).toFixed(2)}</span>
                </div>
              )}

              {meia > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{meia}x Meia-entrada</span>

                  <span>R$ {(meia * precoMeia).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="h-12 w-full text-base"
              disabled={quantidade === 0}
              onClick={() => setEtapa("pagamento")}
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagamento */}
      {etapa === "pagamento" && (
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="text-primary" />

              <CardTitle>Pagamento</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="card-name">Nome no cartão</Label>

              <Input id="card-name" placeholder="Nome completo" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="card-number">Número do cartão</Label>

              <Input
                id="card-number"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiration">Validade</Label>

                <Input id="expiration" placeholder="MM/AA" maxLength={5} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>

                <Input id="cvv" placeholder="123" maxLength={3} />
              </div>
            </div>

            {/* Resumo do pagamento */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Resumo da compra</p>

              <div className="mt-2 flex justify-between">
                <span>{quantidade} ingresso(s)</span>

                <strong>R$ {total.toFixed(2)}</strong>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Este pagamento é apenas uma simulação. Nenhuma cobrança real será
              realizada.
            </p>

            <div className="grid gap-3">
              <Button
                className="h-12 w-full"
                onClick={() => setEtapa("aprovado")}
              >
                Simular pagamento aprovado
              </Button>

              <Button
                variant="destructive"
                className="h-12 w-full"
                onClick={() => setEtapa("recusado")}
              >
                Simular pagamento recusado
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setEtapa("ingressos")}
              >
                <ArrowLeft />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagamento aprovado */}
      {etapa === "aprovado" && (
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 size={64} className="text-green-600" />

            <h2 className="mt-5 text-2xl font-bold">Pagamento aprovado</h2>

            <p className="mt-2 text-muted-foreground">
              Sua compra foi confirmada com sucesso.
            </p>

            <div className="mt-6 w-full rounded-lg bg-muted p-4">
              <div className="flex justify-between">
                <span>Ingressos</span>
                <span>{quantidade}</span>
              </div>

              <div className="mt-2 flex justify-between font-bold">
                <span>Total pago</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 grid w-full gap-3">
              <Link href="/cliente/ingressos">
                <Button className="h-12 w-full">Ver meus ingressos</Button>
              </Link>

              <Link href="/cliente">
                <Button variant="outline" className="w-full">
                  Voltar aos eventos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagamento recusado */}
      {etapa === "recusado" && (
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <XCircle size={64} className="text-destructive" />

            <h2 className="mt-5 text-2xl font-bold">Pagamento recusado</h2>

            <p className="mt-2 text-muted-foreground">
              Não foi possível concluir o pagamento.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Nenhuma cobrança foi realizada.
            </p>

            <div className="mt-6 grid w-full gap-3">
              <Button
                className="h-12 w-full"
                onClick={() => setEtapa("pagamento")}
              >
                Tentar novamente
              </Button>

              <Button variant="outline" onClick={() => setEtapa("ingressos")}>
                Alterar ingressos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
