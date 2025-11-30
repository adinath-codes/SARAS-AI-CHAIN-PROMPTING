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

const VideoOPNode = ({ data, isConnectable }) => (
  // ... (VideoOPNode content)
  <div className="px-4 py-4 shadow-2xl rounded-2xl bg-gray-900/80 border-2 border-purple-500/50 min-w-[320px] max-w-lg backdrop-blur-md transition-all duration-300 hover:shadow-purple-500/50 hover:border-purple-500">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-purple-500 border-2 border-purple-300 shadow-xl shadow-purple-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="s"
      isConnectable={isConnectable}
      className="w-4 h-4 bg-orange-500 border-2 border-orange-300 shadow-xl shadow-orange-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${ICON_COLORS.videoOP} flex-shrink-0`}>
          <Video className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
            {data.label || "Video Output"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Generated Video Clip</p>
        </div>
      </div>
      {/* Download Button - Modernized look */}
      <a
        href={data.video}
        rel="noopener noreferrer"
        target="_blank"
        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl transition-colors font-semibold flex items-center gap-1 shadow-md shadow-purple-500/30 self-start"
        title="Download Video"
      >
        <Save className="w-3 h-3" />
        Save
      </a>
    </div>
    <div className="flex justify-center rounded-xl overflow-hidden border-4 border-gray-700/50">
      <video
        className="w-full h-auto object-cover bg-black"
        controls
        muted
        preload="auto"
        src={data.video}
        style={{ minHeight: "150px" }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
);
export default VideoOPNode;
