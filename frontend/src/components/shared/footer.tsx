export function Footer() {
  return (
    <footer className="flex h-20 w-full items-center border-t bg-background px-6 mt-auto">
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} IngressoLivre. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
