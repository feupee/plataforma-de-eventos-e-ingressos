"use client";

import { useEffect, useState } from "react";

import {
  Camera,
  CheckCircle2,
  Keyboard,
  RotateCcw,
  Search,
  ShieldCheck,
  TicketCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

import { validateTicket } from "@/lib/api/tickets";

import type { TicketValidation } from "@/types/ticket";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

export function TicketValidator() {
  // Temporário até autenticação.
  const gateUserId = 3;

  const [eventId, setEventId] = useState("");

  const [manualCode, setManualCode] = useState("");

  const [result, setResult] = useState<TicketValidation | null>(null);

  const [loading, setLoading] = useState(false);

  const [scannerKey, setScannerKey] = useState(0);

  const [error, setError] = useState<string | null>(null);

  async function processCode(code: string) {
    const selectedEventId = Number(eventId);

    if (!Number.isInteger(selectedEventId) || selectedEventId <= 0) {
      setError("Informe o ID do evento antes de validar ingressos.");

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const validation = await validateTicket(code, selectedEventId);

      setResult(validation);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível validar o ingresso.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",

      {
        fps: 10,

        qrbox: {
          width: 250,
          height: 250,
        },

        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },

      false,
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear();

        await processCode(decodedText);
      },

      () => {
        // Erros durante a procura do QR
        // são normais.
      },
    );

    return () => {
      scanner.clear().catch(() => {
        // Scanner pode já estar fechado.
      });
    };
  }, [scannerKey, eventId]);

  function resetValidation() {
    setResult(null);
    setManualCode("");
    setError(null);

    setScannerKey((value) => value + 1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <ShieldCheck className="text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Validação de ingressos</h1>

            <p className="mt-1 text-muted-foreground">
              Leia o QR Code apresentado pelo cliente para autorizar sua
              entrada.
            </p>
          </div>
        </div>
      </div>

      {/* Seleção do evento */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="max-w-sm space-y-2">
            <Label htmlFor="event-id">Evento da portaria</Label>

            <Input
              id="event-id"
              type="number"
              min="1"
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value);

                setResult(null);
              }}
              placeholder="Ex.: 1"
            />

            <p className="text-xs text-muted-foreground">
              Temporariamente selecionamos o evento pelo ID. Depois da
              autenticação, essa seleção poderá ser vinculada à operação da
              portaria.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        {/* Scanner */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} />
              Leitor de QR Code
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {eventId ? (
              <div
                key={scannerKey}
                className="overflow-hidden rounded-xl border"
              >
                <div id="qr-reader" />
              </div>
            ) : (
              <div className="rounded-xl border p-10 text-center text-muted-foreground">
                Selecione o evento para habilitar o leitor.
              </div>
            )}

            <div className="border-t pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Keyboard size={18} />

                <h2 className="font-semibold">Validação manual</h2>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ticket-code">Código do ingresso</Label>

                <div className="flex gap-2">
                  <Input
                    id="ticket-code"
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    placeholder="Digite ou cole o código"
                  />

                  <Button
                    disabled={loading || !manualCode.trim() || !eventId}
                    onClick={() => processCode(manualCode)}
                  >
                    <Search />
                    Validar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Resultado da validação</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <ValidationError message={error} onReset={resetValidation} />
            )}

            {!error && !result && (
              <div className="flex flex-col items-center py-12 text-center">
                <TicketCheck size={56} className="text-muted-foreground" />

                <h2 className="mt-5 text-xl font-semibold">
                  Aguardando ingresso
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Escaneie um QR Code ou informe o código manualmente.
                </p>
              </div>
            )}

            {!error && result && (
              <ValidationResult result={result} onReset={resetValidation} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type ValidationResultProps = {
  result: TicketValidation;
  onReset: () => void;
};

function ValidationResult({ result, onReset }: ValidationResultProps) {
  const configuration = {
    VALID: {
      title: "Entrada autorizada",

      description: "Ingresso validado com sucesso.",

      icon: <CheckCircle2 size={64} className="text-green-600" />,
    },

    USED: {
      title: "Ingresso já utilizado",

      description: "A entrada deve ser recusada.",

      icon: <XCircle size={64} className="text-destructive" />,
    },

    INVALID: {
      title: "Ingresso inválido",

      description: result.message,

      icon: <XCircle size={64} className="text-destructive" />,
    },

    WRONG_EVENT: {
      title: "Evento incorreto",

      description: "O ingresso pertence a outro evento.",

      icon: <TriangleAlert size={64} className="text-destructive" />,
    },

    CANCELLED: {
      title: "Ingresso cancelado",

      description: "Este ingresso não pode ser utilizado.",

      icon: <XCircle size={64} className="text-destructive" />,
    },
  };

  const config = configuration[result.result];

  return (
    <div className="flex flex-col items-center py-8 text-center">
      {config.icon}

      <h2 className="mt-5 text-2xl font-bold">{config.title}</h2>

      <p className="mt-2 text-muted-foreground">{config.description}</p>

      {result.ticket_id && (
        <div className="mt-6 w-full rounded-xl bg-muted p-4 text-left text-sm">
          <div className="flex justify-between">
            <span>Ingresso</span>

            <strong>#{result.ticket_id}</strong>
          </div>

          {result.ticket_type && (
            <div className="mt-2 flex justify-between">
              <span>Tipo</span>

              <strong>
                {result.ticket_type === "FULL" ? "Inteira" : "Meia-entrada"}
              </strong>
            </div>
          )}
        </div>
      )}

      <Button
        className="mt-6 w-full"
        variant={result.result === "VALID" ? "default" : "outline"}
        onClick={onReset}
      >
        <RotateCcw />
        Validar próximo ingresso
      </Button>
    </div>
  );
}

function ValidationError({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <XCircle size={64} className="text-destructive" />

      <h2 className="mt-5 text-xl font-bold">Erro na validação</h2>

      <p className="mt-2 text-muted-foreground">{message}</p>

      <Button variant="outline" className="mt-6 w-full" onClick={onReset}>
        <RotateCcw />
        Tentar novamente
      </Button>
    </div>
  );
}
