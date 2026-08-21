export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>
        {children}
      </main>
    </>
  );
}