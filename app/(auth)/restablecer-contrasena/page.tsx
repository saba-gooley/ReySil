import { ResetForm } from "./reset-form";

export const metadata = {
  title: "Restablecer contrasena — ReySil",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Restablecer contrasena
      </h2>
      <ResetForm />
    </div>
  );
}
