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

const TextOPNode = ({ data, isConnectable }) => (
  // ... (TextOPNode content)
  <div className="px-4 py-4 shadow-2xl rounded-2xl bg-gray-900/80 border-2 border-cyan-500/50 min-w-[320px] max-w-lg backdrop-blur-md transition-all duration-300 hover:shadow-cyan-500/50 hover:border-cyan-500 relative">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      style={{
        height: "1em",
        width: "1em",
      }}
      className="w-4 h-4 bg-cyan-500 border-2 border-cyan-300 shadow-xl shadow-cyan-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      style={{
        height: "1em",
        width: "1em",
      }}
      className="w-4 h-4 bg-cyan-500 border-2 border-cyan-300 shadow-xl shadow-cyan-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <div className="flex items-start gap-4 mb-3">
      <div className={`p-3 rounded-xl ${ICON_COLORS.textOP} flex-shrink-0`}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
          {data.label || "Text Output"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Static Analysis or Report Output
        </p>
      </div>
    </div>
    <div className="bg-gray-800/70 p-4 rounded-xl overflow-hidden border border-gray-700/50 mt-3">
      <textarea
        readOnly
        rows="5"
        value={data.content || "No content generated."}
        className="w-full bg-transparent text-gray-300 text-sm font-mono resize-none focus:outline-none placeholder-gray-500"
        placeholder="Content Preview"
      />
    </div>
  </div>
);
export default TextOPNode;
