import { AdminOnly } from "@/components/AdminOnly";
import { DesignForm } from "@/components/DesignForm";
import { UploadTabs } from "@/components/UploadTabs";

export default function TambahPage() {
  return <AdminOnly><UploadTabs /><DesignForm /></AdminOnly>;
}
