import { RecoverForm } from "./recover-form";

export const metadata = {
  title: "Recuperar contrasena — ReySil",
};

export default function RecoverPasswordPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Recuperar contrasena
      </h2>
      <RecoverForm />
    </div>
  );
}
