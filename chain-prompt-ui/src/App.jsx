import React, { useState, useCallback, useRef, useEffect } from "react";
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
  MousePointer2, // New modern icon for drag-and-drop
} from "lucide-react";

// --- Initial Data and Constants (Unchanged) ---
let nodeIdCounter = 11;
const ICON_COLORS = {
  parent: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  child: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  videoOP: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  textOP: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  merge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

// Initial nodes and edges remain the same for functionality, just code structure is removed for brevity
const initialNodes = [
  // ... initialNodes array content (omitted for brevity)
  {
    id: "1",
    type: "parent",
    position: { x: 600, y: 50 },
    data: {
      label: "Video Generation Prompt",
      description: "Create a 15-second video of a fox dancing in a forest.",
      status: "Ready",
      chatHistory: [
        {
          id: 0,
          text: "Initial setup: Create a dancing fox video.",
          sender: "user",
          timestamp: "10:00 AM",
        },
        {
          id: 0.1,
          text: "Processing... workflow created.",
          sender: "ai",
          timestamp: "10:01 AM",
        },
      ],
    },
  },
  {
    id: "2",
    type: "child",
    position: { x: 200, y: 220 },
    data: {
      label: "Generate Image 1",
      description: "A cute fox, high-res, forest background.",
      status: "Completed",
    },
  },
  {
    id: "3",
    type: "child",
    position: { x: 600, y: 220 },
    data: {
      label: "Generate Image 2",
      description: "Mid-jump, fox, cartoon style, vibrant colors.",
      status: "Executing",
    },
  },
  {
    id: "4",
    type: "child",
    position: { x: 1000, y: 220 },
    data: {
      label: "Generate Image 3",
      description: "Fox with a top hat, elegant dance move, low light.",
      status: "Ready",
    },
  },
  {
    id: "10",
    type: "textOP",
    position: { x: 600, y: 390 },
    data: {
      label: "Tone Analysis Output",
      content:
        "Tone Analysis: The prompt has a playful and whimsical tone. Suggest cinematic, low-key lighting.",
    },
  },
  {
    id: "5",
    type: "videoOP",
    position: { x: 200, y: 390 },
    data: {
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      label: "Image 1 Video Clip",
    },
  },
  {
    id: "6",
    type: "videoOP",
    position: { x: 600, y: 560 },
    data: {
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      label: "Image 2 Video Clip",
    },
  },
  {
    id: "7",
    type: "videoOP",
    position: { x: 1000, y: 390 },
    data: {
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      label: "Image 3 Video Clip",
    },
  },
  {
    id: "8",
    type: "merge",
    position: { x: 600, y: 730 },
    data: {
      label: "Video Merge",
      description: "Combine all clips sequentially.",
      inputCount: 3,
    },
  },
  {
    id: "9",
    type: "videoOP",
    position: { x: 600, y: 870 },
    data: {
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      label: "Final Workflow Output",
    },
  },
];

const initialEdges = [
  // ... initialEdges array content (omitted for brevity)
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: false,
    style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
    type: "deleteButton",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
    type: "deleteButton",
  },
  {
    id: "e1-4",
    source: "1",
    target: "4",
    animated: false,
    style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
    type: "deleteButton",
  },
  {
    id: "e3-10",
    source: "3",
    target: "10",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e10-6",
    source: "10",
    target: "6",
    style: { stroke: "#3b82f6", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e2-5",
    source: "2",
    target: "5",
    style: { stroke: "#a855f7", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e4-7",
    source: "4",
    target: "7",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e5-8",
    source: "5",
    target: "8",
    sourceHandle: "s",
    targetHandle: "a",
    style: { stroke: "#f97316", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e6-8",
    source: "6",
    target: "8",
    sourceHandle: "s",
    targetHandle: "b",
    style: { stroke: "#f97316", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e7-8",
    source: "7",
    target: "8",
    sourceHandle: "s",
    targetHandle: "c",
    style: { stroke: "#f97316", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e8-9",
    source: "8",
    target: "9",
    style: { stroke: "#10b981", strokeWidth: 3 },
    type: "deleteButton",
  },
];
nodeIdCounter = 11;

// --- Custom Edge Component (Unchanged, uses better delete button style) ---
const DeleteButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt, edgeId) => {
    evt.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            position: "absolute",
          }}
        >
          <button
            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center p-0.5 transition-colors shadow-lg ring-2 ring-white/20" // Added ring for definition
            onClick={(event) => onEdgeClick(event, id)}
            title="Delete Connection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// --- MODERN NODE COMPONENTS ---

// 1. Text Output Node (TextOPNode) - Improved border and background
const TextOPNode = ({ data, isConnectable }) => (
  <div className="px-4 py-4 shadow-2xl rounded-2xl bg-gray-900/80 border-2 border-cyan-500/50 min-w-[320px] max-w-lg backdrop-blur-md transition-all duration-300 hover:shadow-cyan-500/50 hover:border-cyan-500 relative">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-cyan-500 border-2 border-cyan-300 shadow-xl shadow-cyan-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2" // Modern handle shape
    />
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-cyan-500 border-2 border-cyan-300 shadow-xl shadow-cyan-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <div className="flex items-start gap-4 mb-3">
      <div className={`p-3 rounded-xl ${ICON_COLORS.textOP} flex-shrink-0`}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-white font-extrabold text-lg leading-snug">
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

// 2. Parent Node (ParentNode) - Floating Run button and refined border
const ParentNode = ({ data, id, data: { isRunning, onExecute } }) => (
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
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
    <div className="flex items-start justify-between mb-2 mt-5">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${ICON_COLORS.parent} flex-shrink-0`}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-extrabold text-lg leading-snug truncate">
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

// 3. Child Node (ChildNode) - Clearer status, gradient border
const ChildNode = ({ data, isConnectable }) => {
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
        className="w-4 h-4 bg-blue-500 border-2 border-blue-300 shadow-xl shadow-blue-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-4 h-4 bg-blue-500 border-2 border-blue-300 shadow-xl shadow-blue-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
      />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl ${ICON_COLORS.child} flex-shrink-0`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-snug truncate">
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

// 4. Video Output Node (VideoOPNode) - Enhanced media focus
const VideoOPNode = ({ data, isConnectable }) => (
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
          <p className="text-white font-extrabold text-lg leading-snug truncate">
            {data.label || "Video Output"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Generated Video Clip</p>
        </div>
      </div>
      {/* Download Button - Modernized look */}
      <a
        href={data.video}
        download
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

// 5. Merge Node (MergeNode) - Multi-handle aesthetic
const MergeNode = ({ data, isConnectable }) => (
  <div className="px-5 py-4 shadow-2xl rounded-2xl max-w-sm bg-gray-900/80 border-2 border-orange-500/50 min-w-[280px] backdrop-blur-md transition-all duration-300 hover:shadow-orange-500/50 hover:border-orange-500">
    {/* Target Handles for Video Inputs 1, 2, 3 - Spaced out and styled like the others */}
    <Handle
      type="target"
      position={Position.Top}
      id="a"
      isConnectable={isConnectable}
      style={{ left: 50, background: "#f97316", borderColor: "#fdb462" }}
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
      }}
      className="w-4 h-4 shadow-xl shadow-orange-500/50 transform rotate-45 rounded-md"
    />

    {/* Source Handle for Final Video Output */}
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />

    <div className="flex items-start gap-3 mb-2 pt-4">
      <div className={`p-3 rounded-xl ${ICON_COLORS.merge} flex-shrink-0`}>
        <Layers className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-extrabold text-lg leading-snug truncate">
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

// --- Register Node and Edge Types ---
const nodeTypes = {
  parent: ParentNode,
  child: ChildNode,
  videoOP: VideoOPNode,
  textOP: TextOPNode,
  merge: MergeNode,
};

const edgeTypes = {
  deleteButton: DeleteButtonEdge,
};

// --- Main Component Logic (Functionality remains the same) ---
function WorkflowOrchestrationContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showParentChat, setShowParentChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeParentNode, setActiveParentNode] = useState(null);
  const [executingParentIds, setExecutingParentIds] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const chatEndRef = useRef(null);

  const CHILD_NODE_HEIGHT = 170;
  const NODE_VERTICAL_SPACING = 50;
  const HORIZONTAL_BRANCH_SPACING = 1200;
  const CHILD_WIDTH_OFFSET = 400;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeParentNode, isThinking]);

  // Function implementations (onConnect, onNodeClick, createChildrenAndGrandchildren, etc.)
  // are omitted here as they are unchanged and solely implement the logic, not the UI.
  // ... (useCallback functions for handlers, data manipulation logic)

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            type: "deleteButton",
            style: {
              stroke: "#f97316",
              strokeWidth: 2,
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    if (node.type === "parent") {
      setShowParentChat(true);
      setSelectedNode(null);
      setActiveParentNode(node);
    } else {
      setSelectedNode(node);
      setShowParentChat(false);
    }
  }, []);

  const createChildrenAndGrandchildren = (parentNodeId, parentPrompt) => {
    const parentNode = nodes.find((n) => n.id === parentNodeId);
    if (!parentNode) return;

    // 1. Identify Existing Nodes in the branch
    const childrenIds = edges
      .filter((edge) => edge.source === parentNodeId)
      .map((edge) => edge.target);

    const videoOpIds = edges
      .filter((edge) => childrenIds.includes(edge.source))
      .map((edge) => edge.target);

    const mergeId = edges
      .filter(
        (edge) =>
          videoOpIds.includes(edge.source) || edge.source === parentNodeId
      )
      .map((edge) => edge.target)
      .find((id) => nodes.find((n) => n.id === id)?.type === "merge");

    const finalOutputId = mergeId
      ? edges.find((edge) => edge.source === mergeId)?.target
      : null;

    const nodesToDelete = [
      ...childrenIds,
      ...videoOpIds,
      ...(mergeId ? [mergeId] : []),
      ...(finalOutputId ? [finalOutputId] : []),
    ].filter(Boolean);

    // 2. Remove old edges connected to the workflow being replaced
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !nodesToDelete.includes(edge.source) &&
          !nodesToDelete.includes(edge.target) &&
          edge.source !== parentNodeId
      )
    );

    // 3. Update parent node's description and remove its children/grandchildren
    setNodes((nds) => {
      const remainingNodes = nds.filter(
        (node) => !nodesToDelete.includes(node.id)
      );

      const updatedNodes = remainingNodes.map((node) =>
        node.id === parentNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                description: parentPrompt,
                label: node.data.label,
              },
            }
          : node
      );
      return updatedNodes;
    });

    // 4. Create new nodes
    const childYPosition =
      parentNode.position.y + CHILD_NODE_HEIGHT + NODE_VERTICAL_SPACING;
    const videoOpYPosition = childYPosition + CHILD_NODE_HEIGHT;
    const mergeYPosition = videoOpYPosition + CHILD_NODE_HEIGHT;
    const finalOpYPosition = mergeYPosition + CHILD_NODE_HEIGHT;

    const childXPositions = [
      parentNode.position.x - CHILD_WIDTH_OFFSET,
      parentNode.position.x,
      parentNode.position.x + CHILD_WIDTH_OFFSET,
    ];

    const newNodes = [];
    const newEdges = [];

    const newMergeId = `${nodeIdCounter++}`;
    const newFinalVideoOpId = `${nodeIdCounter++}`;
    const newVideoOpIds = [];

    for (let i = 0; i < 3; i++) {
      const childId = `${nodeIdCounter++}`;
      // In a full implementation, you'd decide whether to create a videoOp or textOp here
      const videoOpId = `${nodeIdCounter++}`;
      newVideoOpIds.push(videoOpId);

      const childNode = {
        id: childId,
        type: "child",
        position: { x: childXPositions[i], y: childYPosition },
        data: {
          label: `Child ${i + 1}`,
          description: `Sub-task: ${parentPrompt.substring(0, 30)}...`,
          status: "Ready",
        },
      };

      const videoOpNode = {
        id: videoOpId,
        type: "videoOP",
        position: { x: childXPositions[i], y: videoOpYPosition },
        data: {
          video: "https://www.w3schools.com/html/mov_bbb.mp4",
          label: `Clip ${i + 1} Output`,
        },
      };

      newNodes.push(childNode, videoOpNode);

      const parentToChildEdge = {
        id: `e${parentNodeId}-${childId}`,
        source: parentNodeId,
        target: childId,
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
        type: "deleteButton",
      };

      const childToVideoOpEdge = {
        id: `e${childId}-${videoOpId}`,
        source: childId,
        target: videoOpId,
        style: {
          stroke: i === 0 ? "#a855f7" : i === 1 ? "#3b82f6" : "#06b6d4",
          strokeWidth: 2,
        },
        type: "deleteButton",
      };

      const videoOpToMergeEdge = {
        id: `e${videoOpId}-${newMergeId}`,
        source: videoOpId,
        target: newMergeId,
        sourceHandle: "s",
        targetHandle: ["a", "b", "c"][i],
        style: { stroke: "#f97316", strokeWidth: 2 },
        type: "deleteButton",
      };

      newEdges.push(parentToChildEdge, childToVideoOpEdge, videoOpToMergeEdge);
    }

    // Create Merge Node
    const mergeNode = {
      id: newMergeId,
      type: "merge",
      position: { x: parentNode.position.x, y: mergeYPosition },
      data: {
        label: "Video Merge",
        description: `Combine ${newVideoOpIds.length} generated clips.`,
        inputCount: newVideoOpIds.length,
      },
    };
    newNodes.push(mergeNode);

    // Create Final Video Output Node
    const finalVideoOpNode = {
      id: newFinalVideoOpId,
      type: "videoOP",
      position: { x: parentNode.position.x, y: finalOpYPosition },
      data: {
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        label: "Final Workflow Output",
      },
    };
    newNodes.push(finalVideoOpNode);

    // Edge from Merge Node to Final Output Node
    const mergeToFinalEdge = {
      id: `e${newMergeId}-${newFinalVideoOpId}`,
      source: newMergeId,
      target: newFinalVideoOpId,
      style: { stroke: "#10b981", strokeWidth: 3 },
      type: "deleteButton",
    };
    newEdges.push(mergeToFinalEdge);

    // Append new nodes and edges
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  const updateParentNodeChatHistory = (nodeId, newMessages) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                chatHistory: [...(node.data.chatHistory || []), ...newMessages],
              },
            }
          : node
      )
    );
    setActiveParentNode((prevNode) => {
      const updatedNode = nodes.find((n) => n.id === nodeId);
      if (!updatedNode) return null;

      return {
        ...updatedNode,
        data: {
          ...updatedNode.data,
          chatHistory: [
            ...(updatedNode.data.chatHistory || []),
            ...newMessages,
          ],
        },
      };
    });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !activeParentNode) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const userPrompt = inputValue;
    setInputValue("");
    setIsThinking(true);

    updateParentNodeChatHistory(activeParentNode.id, [newMessage]);

    setTimeout(() => {
      setIsThinking(false);
      const aiResponse = {
        id: Date.now() + 1,
        text: "Processing your request... Workflow structure updated to include video merging!",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      updateParentNodeChatHistory(activeParentNode.id, [aiResponse]);

      createChildrenAndGrandchildren(activeParentNode.id, userPrompt);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const findBranchNodesAndEdges = (startNodeId, allNodes, allEdges) => {
    let nodeIdsInBranch = [startNodeId];
    let queue = [startNodeId];
    let index = 0;

    while (index < queue.length) {
      const currentId = queue[index++];
      const downstreamIds = allEdges
        .filter((e) => e.source === currentId)
        .map((e) => e.target);

      downstreamIds.forEach((id) => {
        if (!nodeIdsInBranch.includes(id)) {
          nodeIdsInBranch.push(id);
          queue.push(id);
        }
      });
    }

    const edgesInBranch = allEdges
      .filter(
        (edge) =>
          nodeIdsInBranch.includes(edge.source) &&
          nodeIdsInBranch.includes(edge.target)
      )
      .map((e) => e.id);

    return { nodeIds: nodeIdsInBranch, edgeIds: edgesInBranch };
  };

  const handleExecuteParentWorkflow = useCallback(
    (parentNodeId) => {
      if (executingParentIds.includes(parentNodeId)) return;

      setExecutingParentIds((prev) => [...prev, parentNodeId]);

      const { edgeIds, nodeIds } = findBranchNodesAndEdges(
        parentNodeId,
        nodes,
        edges
      );

      setEdges((eds) =>
        eds.map((edge) => {
          if (edgeIds.includes(edge.id)) {
            return { ...edge, animated: true };
          }
          return edge;
        })
      );

      setTimeout(() => {
        setExecutingParentIds((prev) =>
          prev.filter((id) => id !== parentNodeId)
        );

        setEdges((eds) =>
          eds.map((edge) => {
            if (edgeIds.includes(edge.id)) {
              return { ...edge, animated: false };
            }
            return edge;
          })
        );

        setNodes((nds) =>
          nds.map((node) => {
            if (node.type === "child" && nodeIds.includes(node.id)) {
              return {
                ...node,
                data: { ...node.data, status: "Completed" },
              };
            }
            return node;
          })
        );
      }, 3000);
    },
    [edges, setEdges, setNodes, executingParentIds, nodes]
  );

  const handleMassRun = useCallback(() => {
    const parentIds = nodes.filter((n) => n.type === "parent").map((n) => n.id);
    parentIds.forEach((id) => handleExecuteParentWorkflow(id));
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 3000);
  }, [nodes, handleExecuteParentWorkflow]);

  const handleMassDeleteClusterGlobal = useCallback(() => {
    if (
      !confirm(
        "Are you sure you want to delete ALL Parent Prompts and their descendants? This action cannot be undone."
      )
    ) {
      return;
    }

    const parentNodes = nodes.filter((n) => n.type === "parent");

    let allNodesToDelete = [];
    let allEdgesToDelete = [];

    parentNodes.forEach((parentNode) => {
      allNodesToDelete.push(parentNode.id);
      const { nodeIds, edgeIds } = findBranchNodesAndEdges(
        parentNode.id,
        nodes,
        edges
      );
      allNodesToDelete.push(...nodeIds);
      allEdgesToDelete.push(...edgeIds);
    });

    const uniqueNodesToDelete = Array.from(new Set(allNodesToDelete));
    const uniqueEdgesToDelete = Array.from(new Set(allEdgesToDelete));

    setNodes((nds) => nds.filter((n) => !uniqueNodesToDelete.includes(n.id)));

    setEdges((eds) => eds.filter((e) => !uniqueEdgesToDelete.includes(e.id)));

    setSelectedNode(null);
    setShowParentChat(false);
  }, [nodes, edges, setNodes, setEdges]);

  const handleExecuteWorkflowGlobal = () => {
    handleMassRun();
  };

  const addNewNode = (type) => {
    const defaultData = {
      parent: {
        label: `New Parent ${nodeIdCounter}`,
        description: "Enter main goal in chat",
        status: "Ready",
        chatHistory: [],
      },
      child: {
        label: `New Child ${nodeIdCounter}`,
        description: "Configure child prompt",
        status: "Ready",
      },
      videoOP: {
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        label: `Output ${nodeIdCounter}`,
      },
      // 🚨 FEATURE: Default content for Text Output
      textOP: {
        label: `Text Output ${nodeIdCounter}`,
        content: `Analysis complete: Status report for Node ${nodeIdCounter} ready.`,
      },
      merge: {
        label: `Merge ${nodeIdCounter}`,
        description: "Custom merge operation.",
        inputCount: 2,
      },
    };

    let xPos = 50;
    let yPos = 50;

    if (type === "parent") {
      const parentNodes = nodes.filter((n) => n.type === "parent");

      if (parentNodes.length > 0) {
        const maxX = parentNodes.reduce(
          (max, node) => Math.max(max, node.position.x),
          0
        );

        xPos = maxX + HORIZONTAL_BRANCH_SPACING;
        yPos = 50;
      } else {
        xPos = 600;
        yPos = 50;
      }
    } else {
      xPos = Math.random() * 800 + 100;
      yPos = Math.random() * 400 + 500;
    }

    const newNode = {
      id: `${nodeIdCounter++}`,
      type: type,
      position: { x: xPos, y: yPos },
      data: defaultData[type] || {
        label: `New ${type}`,
        description: "Configure me",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getSelectedNodeData = () => {
    if (!selectedNode) return null;
    return nodes.find((node) => node.id === selectedNode.id);
  };

  const currentSelectedNode = getSelectedNodeData();

  const currentChatMessages = activeParentNode?.data?.chatHistory || [];

  return (
    // 1. Main Container - Enhanced Gradient Background
    <div className="w-full h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* 2. Header Bar - Enhanced Glassmorphism */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl shadow-gray-900/50 z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wider">
                  SARAS AI
                </h1>
                <span className="text-xs text-gray-400">
                  Next-Gen Chain Prompting
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Info */}
            <div className="flex items-center gap-4 text-xs text-gray-400 border-r border-gray-700/50 pr-4">
              <span>
                <span className="font-semibold text-white">{nodes.length}</span>{" "}
                Nodes
              </span>
              <span>
                <span className="font-semibold text-white">{edges.length}</span>{" "}
                Connections
              </span>
            </div>

            {/* Delete All Workflows Button */}
            <button
              onClick={handleMassDeleteClusterGlobal}
              className="px-4 py-2 bg-red-800/70 hover:bg-red-900 disabled:bg-gray-700/50 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2 border border-red-700/50"
              title="Delete ALL Parent Prompts and their entire branches"
              disabled={isExecuting}
            >
              <Trash className="w-4 h-4" />
              Delete All
            </button>

            {/* Execute All Button */}
            <button
              onClick={handleExecuteWorkflowGlobal}
              disabled={isExecuting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border border-emerald-400/50"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing All...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Execute All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Node Tool Bar - Enhanced Drag-and-Drop Hint */}
      <div className="bg-gray-800/70 backdrop-blur-md border-b border-gray-700/50 px-6 py-3 flex items-center gap-3 shadow-inner shadow-gray-900/50 z-10">
        <span className="text-sm text-gray-300 font-bold mr-2 flex items-center gap-1">
          <MousePointer2 className="w-4 h-4 text-gray-500" />
          DRAG & DROP:
        </span>
        {[
          {
            type: "parent",
            icon: MessageSquare,
            color: "text-emerald-400",
            label: "Parent Prompt",
          },
          {
            type: "child",
            icon: Bot,
            color: "text-blue-400",
            label: "Child Prompt",
          },
          {
            type: "videoOP",
            icon: Video,
            color: "text-purple-400",
            label: "Video Output",
          },
          {
            type: "textOP",
            icon: FileText,
            color: "text-cyan-400",
            label: "Text Output",
          },
          {
            type: "merge",
            icon: Layers,
            color: "text-orange-400",
            label: "Merge",
          },
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => addNewNode(item.type)}
            className="px-4 py-2 bg-gray-700/70 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-md hover:shadow-lg hover:border-gray-500/50"
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            {item.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Clip $\rightarrow$ Merge:</span>
            <div className="w-8 h-1 bg-orange-500 rounded-full shadow-md shadow-orange-500/50"></div>
          </div>
          <div className="flex items-center gap-2">
            <span>Parent $\rightarrow$ Child:</span>
            <div className="w-8 h-1 bg-emerald-500 rounded-full shadow-md shadow-emerald-500/50"></div>
          </div>
        </div>
      </div>

      {/* 4. Main Content Area */}
      <div className="flex-1 relative flex">
        {/* Chat Panel - Left Sidebar */}
        {showParentChat && activeParentNode && (
          <div className="w-96 bg-gray-900/90 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl shadow-gray-900/50 flex flex-col z-10">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/50">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-snug">
                    {activeParentNode.data.label}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure your workflow
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (activeParentNode) {
                      const newLabel = prompt(
                        "Edit Parent Prompt Label:",
                        activeParentNode.data.label
                      );
                      if (newLabel && newLabel.trim() !== "") {
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === activeParentNode.id
                              ? {
                                  ...node,
                                  data: { ...node.data, label: newLabel },
                                }
                              : node
                          )
                        );
                        setActiveParentNode((prev) => ({
                          ...prev,
                          data: { ...prev.data, label: newLabel },
                        }));
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-emerald-400 hover:bg-gray-800 p-2 rounded-full transition-all"
                  title="Edit Parent Prompt Label"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (
                      activeParentNode &&
                      confirm(
                        "Are you sure you want to delete this parent prompt and all its children?"
                      )
                    ) {
                      const { nodeIds } = findBranchNodesAndEdges(
                        activeParentNode.id,
                        nodes,
                        edges
                      );
                      const nodesToDelete = [activeParentNode.id, ...nodeIds];

                      setNodes((nds) =>
                        nds.filter((node) => !nodesToDelete.includes(node.id))
                      );
                      setEdges((eds) =>
                        eds.filter(
                          (edge) =>
                            !nodesToDelete.includes(edge.source) &&
                            !nodesToDelete.includes(edge.target)
                        )
                      );

                      setShowParentChat(false);
                      setActiveParentNode(null);
                    }
                  }}
                  className="text-gray-400 hover:text-red-400 hover:bg-gray-800 p-2 rounded-full transition-all"
                  title="Delete Parent Prompt"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowParentChat(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full transition-all"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {currentChatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 bg-gray-800/70 rounded-xl border border-gray-700/50 shadow-inner">
                    <div className="p-4 bg-emerald-500/10 rounded-full inline-block mb-4 border border-emerald-500/30">
                      <MessageSquare className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">
                      Start chatting to configure your parent prompt
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Your message will automatically create a merged video
                      workflow
                    </p>
                  </div>
                </div>
              )}

              {currentChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-lg ${
                      message.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-gray-700/70 text-gray-100 rounded-tl-none border border-gray-600/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-emerald-200"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/70 text-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[80%] shadow-lg border border-gray-600/50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        SARAS AI IS THINKING...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700/50 bg-gray-900/80">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your prompt..."
                  className="flex-1 px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-500"
                  disabled={isThinking}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isThinking || inputValue.trim() === ""}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center shadow-lg shadow-emerald-500/30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes.map((node) => ({
              // Pass execution status and handler to ParentNode
              ...node,
              data: {
                ...node.data,
                onExecute:
                  node.type === "parent"
                    ? handleExecuteParentWorkflow
                    : node.data.onExecute,
                isRunning: executingParentIds.includes(node.id),
              },
            }))}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
            selectionKeyCode="Shift"
            panOnDrag={true}
            fitView
            className="bg-transparent"
          >
            <Background
              color="#4b5563"
              gap={25}
              size={5}
              variant="dots"
              className="opacity-10" // Reduced opacity for a cleaner look
            />
            {/* Controls - Modernized floating glass effect */}
            <Controls className="!bg-gray-900/80 !backdrop-blur-md !border !border-gray-700 !rounded-xl !shadow-2xl !shadow-gray-900/50 !text-gray-400 absolute bottom-6 right-6" />
            <MiniMap
              zoomable
              pannable
              nodeBorderRadius={10}
              // Darker, less distracting minimap colors
              bgColor="rgba(31, 41, 55, 0.9)"
              maskColor="rgba(100, 100, 100, 0.4)"
              nodeColor={(node) => {
                switch (node.type) {
                  case "parent":
                    return "#10b981";
                  case "child":
                    return "#3b82f6";
                  case "videoOP":
                    return "#a855f7";
                  case "textOP":
                    return "#06b6d4";
                  case "merge":
                    return "#f97316";
                  default:
                    return "#6b7280";
                }
              }}
              className="!border !border-gray-700/50 !rounded-xl !shadow-2xl !shadow-gray-900/50"
            />
          </ReactFlow>

          {/* Configuration Panel (Right Sidebar) - Enhanced Glassmorphism */}
          {currentSelectedNode && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/90 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl shadow-gray-900/50 overflow-y-auto z-10 custom-scrollbar">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Node Configuration
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {(currentSelectedNode.type === "parent" ||
                    currentSelectedNode.type === "child" ||
                    currentSelectedNode.type === "merge" ||
                    currentSelectedNode.type === "videoOP" ||
                    currentSelectedNode.type === "textOP") && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                          Node Label
                        </label>
                        <input
                          type="text"
                          value={currentSelectedNode.data.label}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        label: e.target.value,
                                      },
                                    }
                                  : node
                              )
                            );
                          }}
                          className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        />
                      </div>
                    </>
                  )}

                  {/* General Description for Parent/Child/Merge */}
                  {(currentSelectedNode.type === "parent" ||
                    currentSelectedNode.type === "child" ||
                    currentSelectedNode.type === "merge") && (
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows="3"
                        value={currentSelectedNode.data.description}
                        onChange={(e) => {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      description: e.target.value,
                                    },
                                  }
                                : node
                            )
                          );
                        }}
                        className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                      />
                    </div>
                  )}

                  {/* Video URL for VideoOP */}
                  {currentSelectedNode.type === "videoOP" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Video URL
                      </label>
                      <input
                        type="text"
                        value={currentSelectedNode.data.video}
                        onChange={(e) => {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      video: e.target.value,
                                    },
                                  }
                                : node
                            )
                          );
                        }}
                        className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      />
                    </div>
                  )}

                  {/* Text Content for TextOP */}
                  {currentSelectedNode.type === "textOP" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Text Content (Read Only)
                      </label>
                      <textarea
                        readOnly
                        rows="5"
                        value={currentSelectedNode.data.content}
                        className="w-full px-4 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700/50 resize-none focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Input Count for Merge Node */}
                  {currentSelectedNode.type === "merge" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Input Count
                      </label>
                      <div className="px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700/50 text-sm font-mono">
                        {currentSelectedNode.data.inputCount}
                      </div>
                    </div>
                  )}

                  {/* Node Type and ID Section - Grouped with better styling */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">
                        NODE TYPE
                      </label>
                      <div className="px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50 text-sm font-semibold">
                        {currentSelectedNode.type}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">
                        NODE ID
                      </label>
                      <div className="px-4 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700/50 text-sm font-mono">
                        {currentSelectedNode.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Hierarchy Level
                    </label>
                    <div className="px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700/50 text-sm">
                      {currentSelectedNode.type === "parent"
                        ? "Parent (Root)"
                        : currentSelectedNode.type === "child"
                        ? "Child (Level 1)"
                        : currentSelectedNode.type === "merge"
                        ? "Merge (Level 3)"
                        : currentSelectedNode.type === "textOP"
                        ? "Text Output (Level 2/4)"
                        : "Output (Level 2/4)"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => {
                        setNodes((nds) =>
                          nds.filter((node) => node.id !== selectedNode.id)
                        );
                        setEdges((eds) =>
                          eds.filter(
                            (edge) =>
                              edge.source !== selectedNode.id &&
                              edge.target !== selectedNode.id
                          )
                        );
                        setSelectedNode(null);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-bold shadow-xl shadow-red-500/30 border border-red-700/50"
                    >
                      Delete Node
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🚨 WRAPPER: Export the component wrapped in ReactFlowProvider
export default function WorkflowOrchestration() {
  return (
    <ReactFlowProvider>
      <WorkflowOrchestrationContent />
    </ReactFlowProvider>
  );
}
