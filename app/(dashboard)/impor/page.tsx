import { AdminOnly } from "@/components/AdminOnly";
import { ImportForm } from "@/components/ImportForm";

export default function ImporPage() {
  return (
    <AdminOnly>
      <ImportForm />
    </AdminOnly>
  );
}
