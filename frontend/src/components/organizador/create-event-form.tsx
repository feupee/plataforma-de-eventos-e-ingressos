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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar evento</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="grid gap-6">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="title">Nome do evento</Label>

            <Input id="title" placeholder="Festival de Música 2026" />
          </div>

          {/* Imagem */}
          <div className="grid gap-2">
            <Label htmlFor="image">Imagem do evento</Label>

            <Input id="image" type="file" accept="image/*" />
          </div>

          {/* Data */}
          <div className="grid gap-2">
            <Label htmlFor="date">Data e horário</Label>

            <Input id="date" type="datetime-local" />
          </div>

          {/* Local */}
          <div className="grid gap-2">
            <Label htmlFor="location">Local</Label>

            <Input id="location" placeholder="Uberlândia - MG" />
          </div>

          {/* Preços */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fullPrice">Ingresso inteira</Label>

              <Input
                id="fullPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="100,00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="halfPrice">Ingresso meia</Label>

              <Input
                id="halfPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="50,00"
              />
            </div>
          </div>

          {/* Idade */}
          <div className="grid gap-2">
            <Label>Classificação indicativa</Label>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="livre">Livre</SelectItem>

                <SelectItem value="10">10 anos</SelectItem>

                <SelectItem value="12">12 anos</SelectItem>

                <SelectItem value="14">14 anos</SelectItem>

                <SelectItem value="16">16 anos</SelectItem>

                <SelectItem value="18">18 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-fit">Criar evento</Button>
        </form>
      </CardContent>
    </Card>
  );
}
