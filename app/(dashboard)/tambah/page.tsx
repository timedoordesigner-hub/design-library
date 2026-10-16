import { AdminOnly } from "@/components/AdminOnly";
import { DesignForm } from "@/components/DesignForm";

export default function TambahPage() {
  return <AdminOnly><DesignForm /></AdminOnly>;
}
