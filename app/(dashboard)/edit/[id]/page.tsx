import { AdminOnly } from "@/components/AdminOnly";
import { DesignForm } from "@/components/DesignForm";

export default async function EditPage({ params }: PageProps<"/edit/[id]">) {
  const { id } = await params;
  return <AdminOnly><DesignForm id={Number(id)} /></AdminOnly>;
}
