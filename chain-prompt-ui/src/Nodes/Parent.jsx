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
  Code,
  Plus,
  Cross, // 🚨 IMPORTED: Code icon for CodeBlockNode
} from "lucide-react";
import { ICON_COLORS } from "../utils/constants";

const ParentNode = ({ data, id, data: { isRunning, onExecute } }) => (
  // ... (ParentNode content)
  <div className="px-5 py-4 shadow-2xl rounded-2xl max-w-sm bg-gray-900/80 border-2 border-emerald-500/50 min-w-[280px] backdrop-blur-md transition-all duration-300 hover:shadow-emerald-500/50 hover:border-emerald-500 relative">
    {/* Floating Run Button positioned above the node - Modernized shadow and design */}
    <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2">
      <button
        onClick={() => onExecute(id)}
        disabled={isRunning}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-4 border-gray-800 z-10 ${
          isRunning
            ? "bg-yellow-600/90 text-white cursor-not-allowed shadow-yellow-500/50 ring-4 ring-yellow-500/30"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/50 ring-4 ring-emerald-500/30"
        }`}
        title={isRunning ? "Executing..." : "Run Workflow Branch"}
      >
        {isRunning ? (
          <Loader className="w-6 h-6 animate-spin" />
        ) : (
          <Play className="w-6 h-6 fill-current" />
        )}
      </button>
    </div>

    <Handle
      type="source"
      position={Position.Bottom}
      style={{
        width: "1em",
        height: "1em",
      }}
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform "
    />

    <div className="flex items-start justify-between mb-2 mt-5">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${ICON_COLORS.parent} flex-shrink-0`}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
            {data.label}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Root Prompt / Entry Point
          </p>
        </div>
      </div>
      <div className="relative">
        <button
          className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          title="More Actions"
          onClick={() => alert(`Actions for Parent: ${data.label}`)}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
    <p className="text-gray-400 text-sm ml-12 overflow-hidden line-clamp-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
      {data.description}
    </p>
  </div>
);
export default ParentNode;
