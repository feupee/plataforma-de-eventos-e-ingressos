import { RoleGuard } from "@/components/auth/role-guard";

export default function GateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGuard allowedRoles={["GATE"]}>{children}</RoleGuard>;
}
