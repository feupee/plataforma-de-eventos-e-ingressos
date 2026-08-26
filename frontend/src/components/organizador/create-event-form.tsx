"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useRouter } from "next/navigation";

import { createEvent } from "@/lib/api/events";
import { consumeImportedEvent } from "@/lib/imported-event";

import type { EventStatus } from "@/types/event";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "Shows & músicas",
  "Teatro",
  "Comédia",
  "Esportes",
  "Infantil & Família",
  "Gastronomia",
  "Cursos",
  "Evento Online",
  "Cinema",
  "Outros",
];

const AGE_RATINGS = ["Livre", "10", "12", "14", "16", "18"];

export function CreateEventForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Shows & músicas");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");

  const [fullPrice, setFullPrice] = useState("");
  const [halfPrice, setHalfPrice] = useState("");
  const [capacity, setCapacity] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [ageRating, setAgeRating] = useState("Livre");

  const [eventStatus, setEventStatus] = useState<EventStatus>("DRAFT");

  const [imported, setImported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const importedEvent = consumeImportedEvent();

    if (!importedEvent) {
      return;
    }

    setImported(true);

    setTitle(importedEvent.title);
    setDescription(importedEvent.description);
    setCategory(importedEvent.category);
    setEventDate(importedEvent.event_date);
    setLocation(importedEvent.location);
    setImageUrl(importedEvent.image_url);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!title.trim()) {
      setError("Informe o título do evento.");
      return;
    }

    if (!description.trim()) {
      setError("Informe a descrição do evento.");
      return;
    }

    if (!eventDate) {
      setError("Informe a data do evento.");
      return;
    }

    if (!location.trim()) {
      setError("Informe o local do evento.");
      return;
    }

    if (fullPrice.trim() === "") {
      setError("Informe o preço da entrada inteira.");
      return;
    }

    if (halfPrice.trim() === "") {
      setError("Informe o preço da meia-entrada.");
      return;
    }

    if (capacity.trim() === "") {
      setError("Informe a capacidade do evento.");
      return;
    }

    const parsedFullPrice = Number(fullPrice);
    const parsedHalfPrice = Number(halfPrice);
    const parsedCapacity = Number(capacity);

    if (Number.isNaN(parsedFullPrice) || Number.isNaN(parsedHalfPrice)) {
      setError("Informe preços válidos.");
      return;
    }

    if (parsedFullPrice < 0 || parsedHalfPrice < 0) {
      setError("Os preços não podem ser negativos.");
      return;
    }

    if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setError("A capacidade precisa ser maior que zero.");
      return;
    }

    try {
      setSubmitting(true);

      await createEvent({
        title: title.trim(),

        description: description.trim(),

        category,

        event_date: eventDate,

        location: location.trim(),

        full_price: parsedFullPrice,

        half_price: parsedHalfPrice,

        capacity: parsedCapacity,

        image_url: imageUrl.trim() ? imageUrl.trim() : null,

        age_rating: ageRating,

        status: eventStatus,
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
      setSubmitting(false);
    }
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setCategory(event.target.value);
  }

  function handleEventDateChange(event: ChangeEvent<HTMLInputElement>) {
    setEventDate(event.target.value);
  }

  function handleLocationChange(event: ChangeEvent<HTMLInputElement>) {
    setLocation(event.target.value);
  }

  function handleFullPriceChange(event: ChangeEvent<HTMLInputElement>) {
    setFullPrice(event.target.value);
  }

  function handleHalfPriceChange(event: ChangeEvent<HTMLInputElement>) {
    setHalfPrice(event.target.value);
  }

  function handleCapacityChange(event: ChangeEvent<HTMLInputElement>) {
    setCapacity(event.target.value);
  }

  function handleImageUrlChange(event: ChangeEvent<HTMLInputElement>) {
    setImageUrl(event.target.value);
  }

  function handleAgeRatingChange(event: ChangeEvent<HTMLSelectElement>) {
    setAgeRating(event.target.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;

    if (value === "PUBLISHED") {
      setEventStatus("PUBLISHED");
      return;
    }

    setEventStatus("DRAFT");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do evento</CardTitle>

        {imported && (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            As informações abaixo foram pré-preenchidas a partir da
            Ticketmaster. Revise os dados e complete preço, capacidade e
            classificação antes de criar o evento.
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>

            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>

            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              rows={5}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>

              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((categoryOption) => (
                  <option key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Data e horário</Label>

              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={handleEventDateChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>

            <Input
              id="location"
              value={location}
              onChange={handleLocationChange}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fullPrice">Preço inteira</Label>

              <Input
                id="fullPrice"
                type="number"
                min="0"
                step="0.01"
                value={fullPrice}
                onChange={handleFullPriceChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="halfPrice">Preço meia</Label>

              <Input
                id="halfPrice"
                type="number"
                min="0"
                step="0.01"
                value={halfPrice}
                onChange={handleHalfPriceChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>

              <Input
                id="capacity"
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={handleCapacityChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da imagem</Label>

            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ageRating">Classificação indicativa</Label>

              <select
                id="ageRating"
                value={ageRating}
                onChange={handleAgeRatingChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {AGE_RATINGS.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>

              <select
                id="status"
                value={eventStatus}
                onChange={handleStatusChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DRAFT">Rascunho</option>

                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
