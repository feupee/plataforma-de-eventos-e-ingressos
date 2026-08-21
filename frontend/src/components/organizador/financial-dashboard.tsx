"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const events = {
  festival: {
    name: "Festival de Música 2026",
    sold: 742,
    revenue: 81290,
    averageTicket: 109.55,
    capacity: 1000,

    sales: [
      { day: "12 Ago", tickets: 22 },
      { day: "13 Ago", tickets: 38 },
      { day: "14 Ago", tickets: 55 },
      { day: "15 Ago", tickets: 47 },
      { day: "16 Ago", tickets: 83 },
      { day: "17 Ago", tickets: 104 },
      { day: "18 Ago", tickets: 91 },
    ],
  },

  tecnologia: {
    name: "Tech Conference",
    sold: 380,
    revenue: 45600,
    averageTicket: 120,
    capacity: 600,

    sales: [
      { day: "12 Ago", tickets: 18 },
      { day: "13 Ago", tickets: 25 },
      { day: "14 Ago", tickets: 41 },
      { day: "15 Ago", tickets: 39 },
      { day: "16 Ago", tickets: 67 },
      { day: "17 Ago", tickets: 55 },
      { day: "18 Ago", tickets: 72 },
    ],
  },
};

const chartConfig = {
  tickets: {
    label: "Ingressos vendidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function FinancialDashboard() {
  const [selectedEvent, setSelectedEvent] =
    useState<keyof typeof events>("festival");

  const event = events[selectedEvent];

  const occupancy = Math.round((event.sold / event.capacity) * 100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard financeiro</h1>

          <p className="text-muted-foreground">
            Acompanhe as vendas dos seus eventos.
          </p>
        </div>

        <Select
          value={selectedEvent}
          onValueChange={(value) =>
            setSelectedEvent(value as keyof typeof events)
          }
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="festival">Festival de Música 2026</SelectItem>

            <SelectItem value="tecnologia">Tech Conference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Indicadores */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ingressos vendidos</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{event.sold}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receita</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              R$ {event.revenue.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ticket médio</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              R$ {event.averageTicket.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ocupação</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{occupancy}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ingressos vendidos por dia</CardTitle>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <LineChart data={event.sales}>
              <CartesianGrid vertical={false} />

              <XAxis dataKey="day" tickLine={false} axisLine={false} />

              <YAxis tickLine={false} axisLine={false} />

              <ChartTooltip content={<ChartTooltipContent />} />

              <Line
                type="monotone"
                dataKey="tickets"
                stroke="var(--color-tickets)"
                strokeWidth={3}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
