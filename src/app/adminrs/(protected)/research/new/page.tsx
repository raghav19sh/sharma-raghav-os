import { ResearchForm } from "../ResearchForm";
import { createResearchAction } from "../../actions/research";

export default function NewResearchPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">New research item</h1>
      <ResearchForm action={createResearchAction} />
    </div>
  );
}
