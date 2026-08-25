"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { CalendarDays, ImageIcon, MapPin } from "lucide-react";

import { createEvent } from "@/lib/api/events";
import type { EventStatus } from "@/types/event";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateEventForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");

  const [fullPrice, setFullPrice] = useState("");
  const [halfPrice, setHalfPrice] = useState("");

  const [capacity, setCapacity] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [ageRating, setAgeRating] = useState("Livre");

  const [status, setStatus] = useState<EventStatus>("DRAFT");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await createEvent({
        // Temporário até implementarmos autenticação.
        organizer_id: 1,

        title,
        description,
        category,

        event_date: new Date(eventDate).toISOString(),

        location,

        full_price: Number(fullPrice),
        half_price: Number(halfPrice),

        capacity: Number(capacity),

        image_url: imageUrl.trim() || null,

        age_rating: ageRating,

        status,
      });

      router.push("/organizador/events");

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o evento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Criar evento</CardTitle>

        <p className="text-sm text-muted-foreground">
          Cadastre as informações principais do seu evento.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="title">Nome do evento</Label>

            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Festival de Música 2026"
              required
              minLength={3}
            />
          </div>

          {/* Descrição */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva o evento..."
              required
              minLength={3}
              rows={5}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {/* Categoria */}
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>

            <Input
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Shows & Música"
              required
            />
          </div>

          {/* Data + capacidade */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Data e horário</Label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <Input
                  id="date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacidade</Label>

              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="1000"
                required
              />
            </div>
          </div>

          {/* Local */}
          <div className="grid gap-2">
            <Label htmlFor="location">Local</Label>

            <div className="relative">
              <MapPin
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Uberlândia - MG"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Preços */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="full-price">Valor da inteira</Label>

              <Input
                id="full-price"
                type="number"
                min="0"
                step="0.01"
                value={fullPrice}
                onChange={(event) => setFullPrice(event.target.value)}
                placeholder="100.00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="half-price">Valor da meia-entrada</Label>

              <Input
                id="half-price"
                type="number"
                min="0"
                step="0.01"
                value={halfPrice}
                onChange={(event) => setHalfPrice(event.target.value)}
                placeholder="50.00"
                required
              />
            </div>
          </div>

          {/* Imagem */}
          <div className="grid gap-2">
            <Label htmlFor="image">Imagem</Label>

            <div className="relative">
              <ImageIcon
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                id="image"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="/carousel/evento1.png"
                className="pl-10"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Nesta etapa usamos o caminho ou URL da imagem. Upload de arquivos
              será implementado posteriormente.
            </p>
          </div>

          {/* Classificação + status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Classificação indicativa</Label>

              <Select
                value={ageRating}
                onValueChange={(value) => {
                  if (value !== null) {
                    setAgeRating(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Livre">Livre</SelectItem>

                  <SelectItem value="10">10 anos</SelectItem>

                  <SelectItem value="12">12 anos</SelectItem>

                  <SelectItem value="14">14 anos</SelectItem>

                  <SelectItem value="16">16 anos</SelectItem>

                  <SelectItem value="18">18 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Publicação</Label>

              <Select
                value={status}
                onValueChange={(value) => setStatus(value as EventStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="DRAFT">Salvar como rascunho</SelectItem>

                  <SelectItem value="PUBLISHED">Publicar evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading
              ? "Criando evento..."
              : status === "PUBLISHED"
                ? "Criar e publicar evento"
                : "Salvar rascunho"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
