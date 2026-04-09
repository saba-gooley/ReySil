import { LoginForm } from "./login-form";

export const metadata = {
  title: "Ingresar — ReySil",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next ?? null;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Ingresar</h2>
      <LoginForm next={next} />
    </div>
  );
}
