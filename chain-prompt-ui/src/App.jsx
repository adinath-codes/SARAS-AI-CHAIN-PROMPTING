import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowOrchestrationContent from "./Tabs/WorkFlowOrcContent";

// 🚨 WRAPPER: Export the component wrapped in ReactFlowProvider
export default function WorkflowOrchestration() {
  return (
    <ReactFlowProvider>
      <WorkflowOrchestrationContent />
    </ReactFlowProvider>
  );
}
