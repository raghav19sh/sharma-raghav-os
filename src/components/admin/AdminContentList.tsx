import Link from "next/link";

interface Row {
  id: string;
  title: string;
  status?: string;
  visibility: string;
}

export function AdminContentList({
  items, basePath, deleteAction, newLabel,
}: {
  items: Row[];
  basePath: string;
  /** A genuine exported "use server" action of shape (id, ...) => Promise<void>,
   *  bound per-row below with .bind(). Do not pass an inline-wrapped closure
   *  here — Next's action registration wants a statically-exported function. */
  deleteAction: (id: string) => Promise<void>;
  newLabel: string;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-text-1 capitalize">{basePath.replace("/admin/", "").replace("-", " ")}</h1>
        <Link href={`${basePath}/new`} className="bg-lavender text-on-lavender text-[13.5px] font-medium px-4 py-2 rounded-btn">
          {newLabel}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[13.5px] text-text-2">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-surface border border-border rounded-[10px] px-4 py-3">
              <span className="flex-1 text-[13.5px] text-text-1">{item.title}</span>
              {item.status && <span className="text-[11px] text-text-2 capitalize">{item.status}</span>}
              <span className="text-[11px] text-text-2 capitalize">{item.visibility}</span>
              <Link href={`${basePath}/${item.id}/edit`} className="text-[12.5px] text-lavender">Edit</Link>
              <form action={deleteAction.bind(null, item.id)}>
                <button className="text-[12.5px] text-status-red-text">Delete</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
