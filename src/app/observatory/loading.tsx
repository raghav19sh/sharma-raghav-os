export default function Loading() {
  return <div className="flex flex-col gap-5 animate-pulse">
    <div className="h-8 w-48 rounded-lg bg-surface border border-border" />
    <div className="h-4 w-80 rounded bg-surface border border-border" />
    <div className="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
      {[1,2,3,4].map((i) => <div key={i} className="h-28 rounded-card bg-surface border border-border" />)}
    </div>
  </div>;
}
