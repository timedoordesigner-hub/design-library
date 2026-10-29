import { AdminOnly } from "@/components/AdminOnly";
import { ImportForm } from "@/components/ImportForm";
import { UploadTabs } from "@/components/UploadTabs";

export default function ImporPage() {
  return (
    <AdminOnly>
      <UploadTabs />
      <ImportForm />
    </AdminOnly>
  );
}
