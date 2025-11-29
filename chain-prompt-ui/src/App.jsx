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
} from "lucide-react";

// Initial data and constants remain the same
let nodeIdCounter = 8;

const ICON_COLORS = {
  parent: "bg-emerald-500/20 text-emerald-400",
  child: "bg-blue-500/20 text-blue-400",
  videoOP: "bg-purple-500/20 text-purple-400",
  merge: "bg-orange-500/20 text-orange-400",
};

// 🚨 Custom Edge Component with Delete Button (Unchanged)
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
            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center p-0.5 transition-colors shadow-lg"
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

// --- Initial Data (Unchanged) ---
const initialNodes = [
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
    position: { x: 600, y: 390 },
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
    position: { x: 600, y: 560 },
    data: {
      label: "Video Merge",
      description: "Combine all clips sequentially.",
      inputCount: 3,
    },
  },
  {
    id: "9",
    type: "videoOP",
    position: { x: 600, y: 700 },
    data: {
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      label: "Final Workflow Output",
    },
  },
];

nodeIdCounter = 10;

const initialEdges = [
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
    id: "e2-5",
    source: "2",
    target: "5",
    style: { stroke: "#a855f7", strokeWidth: 2 },
    type: "deleteButton",
  },
  {
    id: "e3-6",
    source: "3",
    target: "6",
    style: { stroke: "#3b82f6", strokeWidth: 2 },
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

// --- Node Components ---

const ParentNode = ({ data, id, data: { isRunning, onExecute } }) => (
  <div className="px-5 py-4 shadow-2xl rounded-xl max-w-sm bg-gray-800 border-2 border-emerald-500 min-w-[250px] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 relative">
    {/* Floating Run Button positioned above the node */}
    <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2">
      <button
        onClick={() => onExecute(id)}
        disabled={isRunning}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2 border-white/30 z-10 ${
          isRunning
            ? "bg-yellow-600/90 text-white cursor-not-allowed shadow-yellow-500/50"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/50"
        }`}
        title={isRunning ? "Executing..." : "Run Workflow Branch"}
      >
        {isRunning ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>
    </div>

    <Handle
      type="source"
      position={Position.Bottom}
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-lg shadow-emerald-500/50"
    />
    <div className="flex items-start justify-between mb-2 mt-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${ICON_COLORS.parent}`}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <p className="text-white font-bold text-lg truncate">{data.label}</p>
      </div>
      <div className="relative">
        <button
          className="p-1 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
          title="More Actions"
          onClick={() => alert(`Actions for Parent: ${data.label}`)}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
    <p className="text-gray-400 text-sm ml-8 overflow-hidden line-clamp-2">
      {data.description}
    </p>
  </div>
);

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
      className={`px-5 py-4 shadow-2xl rounded-xl max-w-xs bg-gray-800 border-2 ${borderColor} min-w-[250px] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-4 h-4 bg-blue-500 border-2 border-blue-300 shadow-lg shadow-blue-500/50"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-4 h-4 bg-blue-500 border-2 border-blue-300 shadow-lg shadow-blue-500/50"
      />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${ICON_COLORS.child}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-white font-bold text-lg truncate">
            {data.label}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${statusColor}`}
          >
            {statusIcon}
            <span>{data.status}</span>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className={`p-1 rounded-full transition-colors ${
              isRunning
                ? "bg-yellow-600/50 text-yellow-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/30"
            }`}
            title="Execute Node"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="text-gray-400 text-xs ml-8 overflow-hidden line-clamp-2">
        {data.description}
      </div>
    </div>
  );
};

const VideoOPNode = ({ data, isConnectable }) => (
  <div className="px-3 py-3 shadow-2xl rounded-xl bg-gray-800 border-2 border-purple-500 min-w-[300px] max-w-lg backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-purple-500 border-2 border-purple-300 shadow-lg shadow-purple-500/50"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="s" // Source handle ID for connecting to MergeNode
      isConnectable={isConnectable}
      className="w-4 h-4 bg-orange-500 border-2 border-orange-300 shadow-lg shadow-orange-500/50"
    />
    <div className="flex items-center gap-3 mb-3 p-1">
      <div className={`p-2 rounded-lg ${ICON_COLORS.videoOP}`}>
        <Video className="w-5 h-5" />
      </div>
      <p className="text-white font-bold text-lg truncate">
        {data.label || "Video Output"}
      </p>
      {/* Download Button */}
      <a
        href={data.video}
        download
        className="ml-auto px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors font-semibold flex items-center gap-1"
        title="Download Video"
      >
        <Save className="w-3 h-3" />
        Save
      </a>
    </div>
    <div className="flex justify-center rounded-lg overflow-hidden border border-gray-700/50">
      <video
        className="w-full h-auto object-cover"
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

const MergeNode = ({ data, isConnectable }) => (
  <div className="px-5 py-4 shadow-2xl rounded-xl max-w-sm bg-gray-800 border-2 border-orange-500 min-w-[250px] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30">
    {/* Target Handle for Video Inputs 1, 2, 3 */}
    <Handle
      type="target"
      position={Position.Top}
      id="a" // Input 1
      isConnectable={isConnectable}
      style={{ left: 50, background: "#f97316", borderColor: "#fdb462" }}
      className="w-4 h-4 shadow-lg shadow-orange-500/50"
    />
    <Handle
      type="target"
      position={Position.Top}
      id="b" // Input 2
      isConnectable={isConnectable}
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        background: "#f97316",
        borderColor: "#fdb462",
      }}
      className="w-4 h-4 shadow-lg shadow-orange-500/50"
    />
    <Handle
      type="target"
      position={Position.Top}
      id="c" // Input 3
      isConnectable={isConnectable}
      style={{
        left: "auto",
        right: 50,
        background: "#f97316",
        borderColor: "#fdb462",
      }}
      className="w-4 h-4 shadow-lg shadow-orange-500/50"
    />

    {/* Source Handle for Final Video Output */}
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-lg shadow-emerald-500/50"
    />

    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${ICON_COLORS.merge}`}>
        <Layers className="w-5 h-5" />
      </div>
      <p className="text-white font-bold text-lg truncate">{data.label}</p>
    </div>
    <p className="text-gray-400 text-sm ml-8 overflow-hidden line-clamp-2">
      {data.description}
    </p>
    <div className="flex justify-end pt-2 text-xs text-orange-400">
      Inputs: {data.inputCount}
    </div>
  </div>
);

const nodeTypes = {
  parent: ParentNode,
  child: ChildNode,
  videoOP: VideoOPNode,
  merge: MergeNode,
};

const edgeTypes = {
  deleteButton: DeleteButtonEdge,
};

// --- Main Component Logic ---
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

  // 🚨 Removed hasSelection state and its useEffect/handler hooks since the Delete Selected button is removed
  // The ReactFlow component will now manage node/edge selection internally.

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

  // Custom OnNodesChange handler to ensure React Flow internal state updates
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // Custom OnEdgesChange handler to ensure React Flow internal state updates
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
    <div className="w-full h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Header Bar */}
      <div className="bg-linear-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className=" flex flex-col px-2 rounded-lg ">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    SARAS AI
                    <br />
                  </h1>
                  <span className="text-xs text-gray-400">
                    Next-Gen Chain Prompting
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* FEATURE: Delete All Workflows Button (Cluster Delete) */}
            <button
              onClick={handleMassDeleteClusterGlobal}
              className="px-4 py-2 bg-red-800/70 hover:bg-red-900 disabled:bg-gray-700/50 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2"
              title="Delete ALL Parent Prompts and their entire branches"
            >
              <Trash className="w-4 h-4" />
              Delete All Workflows
            </button>

            {/* 🚨 REMOVED: Delete Selected Button (Now rely on keyboard delete for selection) */}

            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700/30">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{nodes.length} nodes</span>
                <span>•</span>
                <span>{edges.length} connections</span>
              </div>
            </div>
            {/* FEATURE: Execute All Button now uses handleMassRun */}
            <button
              onClick={handleExecuteWorkflowGlobal}
              disabled={isExecuting}
              className="px-5 py-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing All...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Node Tool Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-3 flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium mr-2">
          ADD NODE:
        </span>
        <button
          onClick={() => addNewNode("parent")}
          className="px-4 py-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-lg"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          Parent Prompt
        </button>
        <button
          onClick={() => addNewNode("child")}
          className="px-4 py-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-lg"
        >
          <Bot className="w-4 h-4 text-blue-400" />
          Child Prompt
        </button>
        <button
          onClick={() => addNewNode("videoOP")}
          className="px-4 py-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-lg"
        >
          <Video className="w-4 h-4 text-purple-400" />
          Video Output
        </button>
        <button
          onClick={() => addNewNode("merge")}
          className="px-4 py-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-lg"
        >
          <Layers className="w-4 h-4 text-orange-400" />
          Merge
        </button>

        <div className="ml-auto flex flex-col items-end text-xs text-gray-400">
          <div className="flex items-center justify-evenly gap-2">
            <span>Clip → Merge:</span>
            <div className="w-8 h-0.5 bg-orange-500"></div>
          </div>
          <div className="flex items-center justify-evenly gap-2">
            <span>Merge → Final:</span>
            <div className="w-8 h-0.5 bg-emerald-500"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex ">
        {/* Chat Panel - Reads from activeParentNode */}
        {showParentChat && activeParentNode && (
          <div className="w-96 bg-linear-to-br overflow-auto max-h-[calc(100vh-120px)] from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {activeParentNode.data.label} Chat
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure your workflow
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                        // Update activeParentNode immediately
                        setActiveParentNode((prev) => ({
                          ...prev,
                          data: { ...prev.data, label: newLabel },
                        }));
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50 p-2 rounded-lg transition-all"
                  title="Edit Parent Prompt Label"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (
                      activeParentNode &&
                      confirm(
                        "Are you sure you want to delete this parent prompt and all its children?"
                      )
                    ) {
                      const childrenIds = nodes
                        .filter((node) =>
                          edges.some(
                            (edge) =>
                              edge.source === activeParentNode.id &&
                              edge.target === node.id
                          )
                        )
                        .map((child) => child.id);

                      const videoOpIds = nodes
                        .filter((node) =>
                          edges.some(
                            (edge) =>
                              childrenIds.includes(edge.source) &&
                              edge.target === node.id
                          )
                        )
                        .map((gc) => gc.id);

                      const mergeId = nodes
                        .filter(
                          (n) =>
                            n.type === "merge" &&
                            edges.some(
                              (e) =>
                                videoOpIds.includes(e.source) &&
                                e.target === n.id
                            )
                        )
                        .map((n) => n.id);
                      const finalOutputId =
                        mergeId.length > 0
                          ? edges
                              .filter((e) => e.source === mergeId[0])
                              .map((e) => e.target)
                          : [];

                      const nodesToDelete = [
                        activeParentNode.id,
                        ...childrenIds,
                        ...videoOpIds,
                        ...mergeId,
                        ...finalOutputId,
                      ];

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
                  className="text-gray-400 hover:text-red-400 hover:bg-gray-700/50 p-2 rounded-lg transition-all"
                  title="Delete Parent Prompt"
                >
                  <Trash className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowParentChat(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-all"
                  title="Close Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full inline-block mb-4">
                      <MessageSquare className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
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
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-700/50 text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 text-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm font-medium">THINKING...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  disabled={isThinking}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isThinking || inputValue.trim() === ""}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
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
            onNodesChange={handleNodesChange} // 🚨 Use custom handler
            onEdgesChange={handleEdgesChange} // 🚨 Use custom handler
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={["Backspace", "Delete"]} // Allows keyboard delete for selected elements
            selectionKeyCode="Shift" // Use Shift for marquee selection
            // 🚨 FIX: Re-enable panOnDrag for hand movement (panning)
            panOnDrag={true}
            fitView
            className="bg-transparent"
          >
            <Background
              color="#4b5563"
              gap={25}
              size={5}
              variant="dots"
              className="opacity-20"
            />
            <Controls className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl" />
            <MiniMap
              zoomable
              pannable
              nodeBorderRadius={10}
              bgColor="rgba(31, 41, 55, 0.7)"
              maskColor="rgba(86, 86, 87, 0.7)"
              nodeColor={(node) => {
                switch (node.type) {
                  case "parent":
                    return "#10b981";
                  case "child":
                    return "#3b82f6";
                  case "videoOP":
                    return "#a855f7";
                  case "merge":
                    return "#f97316";
                  default:
                    return "#6b7280";
                }
              }}
            />
          </ReactFlow>

          {/* Configuration Panel (Side Bar) */}
          {currentSelectedNode && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-linear-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Node Configuration
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-5">
                  {(currentSelectedNode.type === "parent" ||
                    currentSelectedNode.type === "child" ||
                    currentSelectedNode.type === "merge" ||
                    currentSelectedNode.type === "videoOP") && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                          className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        />
                      </div>
                    </>
                  )}

                  {/* General Description for Parent/Child/Merge */}
                  {(currentSelectedNode.type === "parent" ||
                    currentSelectedNode.type === "child" ||
                    currentSelectedNode.type === "merge") && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                        className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                      />
                    </div>
                  )}

                  {/* Video URL for VideoOP */}
                  {currentSelectedNode.type === "videoOP" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                        className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      />
                    </div>
                  )}

                  {/* Input Count for Merge Node */}
                  {currentSelectedNode.type === "merge" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Input Count
                      </label>
                      <div className="px-4 py-3 bg-gray-800/30 text-gray-400 rounded-lg border border-gray-600/30 text-sm">
                        {currentSelectedNode.data.inputCount}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Node Type
                    </label>
                    <div className="px-4 py-3 bg-gray-800/30 text-gray-400 rounded-lg border border-gray-600/30 flex items-center justify-between">
                      <span>{currentSelectedNode.type}</span>
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                        Read only
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Node ID
                    </label>
                    <div className="px-4 py-3 bg-gray-800/30 text-gray-400 rounded-lg border border-gray-600/30 text-sm font-mono">
                      {currentSelectedNode.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Hierarchy Level
                    </label>
                    <div className="px-4 py-3 bg-gray-800/30 text-gray-400 rounded-lg border border-gray-600/30 text-sm">
                      {currentSelectedNode.type === "parent"
                        ? "Parent (Root)"
                        : currentSelectedNode.type === "child"
                        ? "Child (Level 1)"
                        : currentSelectedNode.type === "merge"
                        ? "Merge (Level 3)"
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
                      className="w-full px-4 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg shadow-red-500/20"
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
