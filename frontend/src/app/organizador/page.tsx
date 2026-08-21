import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizadorPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Visão geral</h1>

      <p className="mt-1 text-muted-foreground">
        Acompanhe seus eventos e principais resultados.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Eventos ativos</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ingressos vendidos</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">1.248</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receita total</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">R$ 94.520</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Próximo evento</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="font-semibold">Festival de Música</p>

            <p className="text-sm text-muted-foreground">12 de setembro</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
