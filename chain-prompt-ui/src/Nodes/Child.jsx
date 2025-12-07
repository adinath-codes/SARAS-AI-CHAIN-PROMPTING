import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  MessageSquare,
  Bot,
  Zap,
  Settings,
  Play,
  Save,
  Clock,
  MoreVertical,
  Video,
  Send,
  X,
  Loader,
  CheckCircle,
  Trash,
  Pencil,
  Layers,
  FileText,
  MousePointer2,
  Code, // 🚨 IMPORTED: Code icon for CodeBlockNode
} from "lucide-react";
import { ICON_COLORS } from "../utils/constants";

const ChildNode = ({ data, isConnectable }) => {
  // ... (ChildNode content)
  const isCompleted = data.status === "Completed";
  const isRunning = data.status === "Executing";
  const statusColor = isRunning
    ? "text-yellow-400"
    : isCompleted
    ? "text-green-400"
    : "text-gray-400";
  const statusIcon = isRunning ? (
    <Loader className="w-4 h-4 animate-spin" />
  ) : isCompleted ? (
    <CheckCircle className="w-4 h-4" />
  ) : (
    <Clock className="w-4 h-4" />
  );
  const borderColor = isRunning
    ? "border-yellow-500"
    : isCompleted
    ? "border-green-500"
    : "border-blue-500";

  const handleExecute = () => {
    alert(`Executing child node: ${data.label}`);
  };

  return (
    <div
      className={`px-5 py-4 shadow-2xl rounded-2xl max-w-xs bg-gray-900/80 border-2 ${borderColor}/50 min-w-[280px] backdrop-blur-md transition-all duration-300 hover:shadow-blue-500/50 hover:border-blue-500`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: "1em",
          height: "1em",
        }}
        className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform "
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          width: "1em",
          height: "1em",
        }}
        className="w-4 h-4 bg-blue-500 border-2 border-blue-300 shadow-xl shadow-blue-500/50 transform "
      />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl ${ICON_COLORS.child} flex-shrink-0`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
              {data.label}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              AI Sub-Task / Generator
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${statusColor} bg-gray-800/70 px-2 py-1 rounded-full border border-gray-700`}
          >
            {statusIcon}
            <span>{data.status}</span>
          </div>

          <div className="text-gray-400 text-xs overflow-hidden line-clamp-2 ml-2">
            {data.description.substring(0, 35)}...
          </div>
        </div>
        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={isRunning}
          className={`p-2 rounded-full transition-colors shadow-lg ${
            isRunning
              ? "bg-yellow-600/50 text-yellow-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/30"
          }`}
          title="Execute Node"
        >
          <Play className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default ChildNode;
