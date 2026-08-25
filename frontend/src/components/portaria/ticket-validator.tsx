"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Keyboard,
  RotateCcw,
  Search,
  ShieldCheck,
  TicketCheck,
  XCircle,
} from "lucide-react";

import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

import { meusIngressos, Ticket } from "@/lib/mock-tickets";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ValidationStatus = "IDLE" | "VALID" | "INVALID" | "USED";

type ValidationResult = {
  status: ValidationStatus;
  ticket?: Ticket;
  message?: string;
};

export function TicketValidator() {
  const [manualCode, setManualCode] = useState("");
  const [scannerKey, setScannerKey] = useState(0);

  const [result, setResult] = useState<ValidationResult>({
    status: "IDLE",
  });

  const usedCodes = useRef<Set<string>>(new Set());

  function extractTicketCode(value: string) {
    const trimmedValue = value.trim();

    const prefix = "ingressolivre:ticket:";

    if (trimmedValue.startsWith(prefix)) {
      return trimmedValue.substring(prefix.length);
    }

    return trimmedValue;
  }

  function validateTicket(value: string) {
    const code = extractTicketCode(value);

    if (!code) {
      setResult({
        status: "INVALID",
        message: "Código de ingresso inválido.",
      });

      return;
    }

    const ticket = meusIngressos.find((ticket) => ticket.code === code);

    if (!ticket) {
      setResult({
        status: "INVALID",
        message: "Este ingresso não foi encontrado.",
      });

      return;
    }

    if (ticket.status === "USED" || usedCodes.current.has(ticket.code)) {
      setResult({
        status: "USED",
        ticket,
        message: "Este ingresso já foi utilizado.",
      });

      return;
    }

    usedCodes.current.add(ticket.code);

    setResult({
      status: "VALID",
      ticket,
      message: "Entrada autorizada.",
    });
  }

  useEffect(() => {
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
      (decodedText) => {
        validateTicket(decodedText);

        scanner.clear().catch(() => {
          // Ignora erro ao encerrar câmera após leitura.
        });
      },
      () => {
        // Os erros enquanto a câmera procura um QR Code
        // são esperados e não precisam ser exibidos.
      },
    );

    return () => {
      scanner.clear().catch(() => {
        // O scanner pode já estar encerrado.
      });
    };
  }, [scannerKey]);

  function handleManualValidation() {
    validateTicket(manualCode);
  }

  function resetScanner() {
    setResult({
      status: "IDLE",
    });

    setManualCode("");

    setScannerKey((current) => current + 1);
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
            <div key={scannerKey} className="overflow-hidden rounded-xl border">
              <div id="qr-reader" />
            </div>

            <p className="text-sm text-muted-foreground">
              Autorize o acesso à câmera quando solicitado pelo navegador.
            </p>

            {/* Validação manual */}
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
                    type="button"
                    onClick={handleManualValidation}
                    disabled={!manualCode.trim()}
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
            {result.status === "IDLE" && (
              <div className="flex flex-col items-center py-12 text-center">
                <TicketCheck size={56} className="text-muted-foreground" />

                <h2 className="mt-5 text-xl font-semibold">
                  Aguardando ingresso
                </h2>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Escaneie um QR Code ou informe manualmente o código do
                  ingresso.
                </p>
              </div>
            )}

            {result.status === "VALID" && result.ticket && (
              <div>
                <div className="flex flex-col items-center text-center">
                  <CheckCircle2 size={64} className="text-green-600" />

                  <h2 className="mt-4 text-2xl font-bold">
                    Entrada autorizada
                  </h2>

                  <p className="mt-1 text-muted-foreground">
                    Ingresso validado com sucesso.
                  </p>
                </div>

                <TicketInformation ticket={result.ticket} status="Válido" />

                <Button className="mt-6 w-full" onClick={resetScanner}>
                  <RotateCcw />
                  Validar próximo ingresso
                </Button>
              </div>
            )}

            {result.status === "USED" && result.ticket && (
              <div>
                <div className="flex flex-col items-center text-center">
                  <XCircle size={64} className="text-destructive" />

                  <h2 className="mt-4 text-2xl font-bold">
                    Ingresso já utilizado
                  </h2>

                  <p className="mt-1 text-muted-foreground">
                    A entrada deve ser recusada.
                  </p>
                </div>

                <TicketInformation ticket={result.ticket} status="Utilizado" />

                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={resetScanner}
                >
                  <RotateCcw />
                  Validar próximo ingresso
                </Button>
              </div>
            )}

            {result.status === "INVALID" && (
              <div className="flex flex-col items-center py-10 text-center">
                <XCircle size={64} className="text-destructive" />

                <h2 className="mt-4 text-2xl font-bold">Ingresso inválido</h2>

                <p className="mt-2 text-muted-foreground">{result.message}</p>

                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={resetScanner}
                >
                  <RotateCcw />
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type TicketInformationProps = {
  ticket: Ticket;
  status: "Válido" | "Utilizado";
};

function TicketInformation({ ticket, status }: TicketInformationProps) {
  return (
    <div className="mt-6 space-y-4 rounded-xl bg-muted p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Evento</p>

          <p className="font-semibold">{ticket.eventName}</p>
        </div>

        <Badge variant={status === "Válido" ? "secondary" : "destructive"}>
          {status}
        </Badge>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Tipo</p>

        <p className="font-medium">{ticket.ticketType}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Data</p>

        <p className="font-medium">
          {ticket.date} às {ticket.time}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Local</p>

        <p className="font-medium">{ticket.location}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Código</p>

        <p className="break-all font-mono text-xs">{ticket.code}</p>
      </div>
    </div>
  );
}
