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
const MergeNode = ({ data, isConnectable }) => (
  // ... (MergeNode content)
  <div className="px-5 py-4 shadow-2xl rounded-2xl max-w-sm bg-gray-900/80 border-2 border-orange-500/50 min-w-[280px] backdrop-blur-md transition-all duration-300 hover:shadow-orange-500/50 hover:border-orange-500">
    {/* Target Handles for Video Inputs 1, 2, 3 - Spaced out and styled like the others */}
    <Handle
      type="target"
      position={Position.Top}
      id="a"
      isConnectable={isConnectable}
      style={{
        left: 50,
        background: "#f97316",
        borderColor: "#fdb462",
        height: "1em",
        width: "1em",
      }}
      className="w-4 h-4 shadow-xl shadow-orange-500/50 transform rotate-45 rounded-md"
    />
    <Handle
      type="target"
      position={Position.Top}
      id="b"
      isConnectable={isConnectable}
      style={{
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        background: "#f97316",
        borderColor: "#fdb462",
        height: "1em",
        width: "1em",
      }}
      className="w-4 h-4 shadow-xl shadow-orange-500/50 rounded-md"
    />
    <Handle
      type="target"
      position={Position.Top}
      id="c"
      isConnectable={isConnectable}
      style={{
        left: "auto",
        right: 50,
        background: "#f97316",
        borderColor: "#fdb462",
        height: "1em",
        width: "1em",
      }}
      className="w-4 h-4 shadow-xl shadow-orange-500/50 transform rotate-45 rounded-md"
    />

    {/* Source Handle for Final Video Output */}
    <Handle
      type="source"
      position={Position.Bottom}
      style={{
        height: "1em",
        width: "1em",
      }}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />

    <div className="flex items-start gap-3 mb-2 pt-4">
      <div className={`p-3 rounded-xl ${ICON_COLORS.merge} flex-shrink-0`}>
        <Layers className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
          {data.label}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Input Combination and Transformation
        </p>
      </div>
    </div>
    <p className="text-gray-400 text-sm ml-12 overflow-hidden line-clamp-2">
      {data.description}
    </p>
    <div className="flex justify-end pt-3 text-sm text-orange-400 font-semibold border-t border-gray-700/50 mt-3">
      Expected Inputs:{" "}
      <span className="text-white ml-1">{data.inputCount}</span>
    </div>
  </div>
);
export default MergeNode;
