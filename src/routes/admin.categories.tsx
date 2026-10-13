import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { deleteCategory, saveCategory } from "@/services/pos";
import { EmptyState, PageHeader } from "@/components/pos/ui";
import { FormDialog, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => meta("Categories", "Organise menu categories and their display order."),
  component: Page,
});

function Page() {
  const s = useAppState();
  const [edit, setEdit] = useState<Category | null>(null);
  const cats = [...s.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div>
      <PageHeader title="Categories" subtitle="Shown as tabs on the ordering screen" actions={<Button className="h-11" onClick={() => setEdit({ id: "", name: "", icon: "tag", sortOrder: cats.length + 1 })}><Plus /> Add</Button>} />
      {cats.length === 0 ? <EmptyState icon={Tags} title="No categories" /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => {
            const n = s.products.filter((p) => p.categoryId === c.id).length;
            return (
              <button key={c.id} onClick={() => setEdit(c)} className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left active:bg-accent">
                <span className="tabular grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/12 font-semibold text-primary">{c.sortOrder}</span>
                <div className="min-w-0 flex-1"><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{n} products</div></div>
              </button>
            );
          })}
        </div>
      )}
      <FormDialog
        open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? "Edit category" : "New category"}
        onSubmit={() => { if (!edit?.name.trim()) return toast.error("Name is required"); saveCategory(edit); toast.success("Category saved"); setEdit(null); }}
        onDelete={edit?.id ? () => { try { deleteCategory(edit.id); toast.success("Category deleted"); setEdit(null); } catch (e) { toast.error((e as Error).message); } } : undefined}
      >
        {edit && (
          <>
            <TextField label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
            <TextField label="Display order" type="number" value={edit.sortOrder} onChange={(v) => setEdit({ ...edit, sortOrder: Number(v) })} />
          </>
        )}
      </FormDialog>
    </div>
  );
}
