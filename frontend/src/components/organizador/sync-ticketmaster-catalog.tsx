"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";

import Link from "next/link";

import { CheckCircle2, RefreshCw } from "lucide-react";

import { syncAllTicketmasterCategories } from "@/lib/api/external-events";

import type { SyncAllResult } from "@/lib/api/external-events";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SyncTicketmasterCatalog() {
  const [countryCode, setCountryCode] = useState("US");

  const [sizePerCategory, setSizePerCategory] = useState("5");

  const [fullPrice, setFullPrice] = useState("100");

  const [halfPrice, setHalfPrice] = useState("50");

  const [capacity, setCapacity] = useState("500");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<SyncAllResult | null>(null);

  function handleCountryChange(event: ChangeEvent<HTMLInputElement>) {
    setCountryCode(event.target.value.toUpperCase().slice(0, 2));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setResult(null);

    const parsedSize = Number(sizePerCategory);

    const parsedFullPrice = Number(fullPrice);

    const parsedHalfPrice = Number(halfPrice);

    const parsedCapacity = Number(capacity);

    if (parsedSize < 1 || parsedSize > 10) {
      setError("Use entre 1 e 10 eventos por categoria.");

      return;
    }

    if (parsedFullPrice < 0 || parsedHalfPrice < 0) {
      setError("Os preços não podem ser negativos.");

      return;
    }

    if (parsedCapacity <= 0) {
      setError("Informe uma capacidade válida.");

      return;
    }

    try {
      setLoading(true);

      const data = await syncAllTicketmasterCategories({
        countryCode,

        sizePerCategory: parsedSize,

        defaultFullPrice: parsedFullPrice,

        defaultHalfPrice: parsedHalfPrice,

        defaultCapacity: parsedCapacity,
      });

      setResult(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível " + "sincronizar os eventos.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronizar catálogo</CardTitle>

        <p className="text-sm text-muted-foreground">
          Busque eventos da Ticketmaster para todas as categorias do
          IngressoLivre.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>

              <Input
                id="country"
                value={countryCode}
                maxLength={2}
                onChange={handleCountryChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Por categoria</Label>

              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={sizePerCategory}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSizePerCategory(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full">Inteira padrão</Label>

              <Input
                id="full"
                type="number"
                min="0"
                step="0.01"
                value={fullPrice}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFullPrice(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="half">Meia padrão</Label>

              <Input
                id="half"
                type="number"
                min="0"
                step="0.01"
                value={halfPrice}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setHalfPrice(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>

              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setCapacity(event.target.value)
                }
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            A sincronização pesquisa todas as 16 categorias da plataforma.
            Algumas categorias utilizam classificações oficiais da Ticketmaster
            e outras usam palavras-chave equivalentes.
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />

            {loading
              ? "Sincronizando todas as categorias..."
              : "Sincronizar todas as categorias"}
          </Button>
        </form>

        {result && (
          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" />

              <h3 className="font-semibold">Sincronização concluída</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Encontrados</p>

                <p className="text-2xl font-bold">{result.total_found}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Importados</p>

                <p className="text-2xl font-bold">{result.total_created}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Ignorados</p>

                <p className="text-2xl font-bold">{result.total_skipped}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              {result.categories.map((category) => (
                <div
                  key={category.category}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-5 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <strong>{category.category}</strong>

                  <span>encontrados {category.found}</span>

                  <span>importados {category.created}</span>

                  <span>ignorados {category.skipped}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link href="/cliente">
                <Button type="button">Ver página inicial</Button>
              </Link>

              <Link href="/cliente/eventos">
                <Button type="button" variant="outline">
                  Ver catálogo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
