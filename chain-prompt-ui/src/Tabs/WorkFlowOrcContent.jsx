import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow, // 🚨 NEW IMPORT: Used to get selected nodes and edges
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  MessageSquare,
  Bot,
  Zap,
  Settings,
  Play,
  Video,
  Send,
  X,
  Trash,
  Pencil,
  Layers,
  FileText,
  MousePointer2,
  Code,
  ListChecks,
  ChevronDown,
  Plus,
  Menu,
  Grid,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Sparkles,
  Workflow,
  Copy,
} from "lucide-react";
import {
  initialEdges,
  initialNodes,
  nodeTypes,
  edgeTypes,
  ICON_COLORS,
} from "../utils/constants";

let nodeIdCounter = 12;

// --- UTILITY HOOKS & FUNCTIONS (Simplified for brevity, assuming standard implementation) ---

const useFlowStates = (initialNodes, initialEdges) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};

const useExecutionState = () => {
  const [executingParentIds, setExecutingParentIds] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  return {
    executingParentIds,
    setExecutingParentIds,
    isExecuting,
    setIsExecuting,
  };
};

// --- START OF MAIN COMPONENT ---

// We must wrap the main logic in a provider to use useReactFlow,
// so the logic is split slightly: a wrapper and the inner component.
const WorkflowOrchestrationInner = () => {
  // Note: useReactFlow must be called inside the ReactFlow wrapper.
  const instance = useReactFlow();

  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useFlowStates(initialNodes, initialEdges);
  const {
    executingParentIds,
    setExecutingParentIds,
    isExecuting,
    setIsExecuting,
  } = useExecutionState();

  const [selectedNode, setSelectedNode] = useState(null);
  const [showParentChat, setShowParentChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeParentNode, setActiveParentNode] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatEndRef = useRef(null);

  // Constants (unchanged)
  const CHILD_NODE_HEIGHT = 170;
  const NODE_VERTICAL_SPACING = 50;
  const HORIZONTAL_BRANCH_SPACING = 1200;
  const CHILD_WIDTH_OFFSET = 400;

  // --- Action Handlers (Unchanged) ---
  const handleSimulateMerge = () => {
    alert("Simulating Merge Operation...");
  };

  const handleCopyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert("Content copied to clipboard!");
  };

  const handleDownloadVideo = (url) => {
    alert(`Simulating download of video from: ${url}`);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeParentNode, isThinking]);

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

  // ... (createChildrenAndGrandchildren, updateParentNodeChatHistory, handleSendMessage, handleKeyPress, findBranchNodesAndEdges, handleExecuteParentWorkflow functions remain the same as the final version in the previous response)

  const createChildrenAndGrandchildren = (parentNodeId, parentPrompt) => {
    const parentNode = nodes.find((n) => n.id === parentNodeId);
    if (!parentNode) return;

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

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !nodesToDelete.includes(edge.source) &&
          !nodesToDelete.includes(edge.target) &&
          edge.source !== parentNodeId
      )
    );

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

    const childYPosition =
      parentNode.position.y + CHILD_NODE_HEIGHT + NODE_VERTICAL_SPACING;
    const codeBlockYPosition = childYPosition + CHILD_NODE_HEIGHT; // Level 2
    const videoOpYPosition = codeBlockYPosition + CHILD_NODE_HEIGHT; // Level 3
    const newMergeYPosition = videoOpYPosition + NODE_VERTICAL_SPACING;
    const newSummaryYPosition =
      newMergeYPosition + CHILD_NODE_HEIGHT + NODE_VERTICAL_SPACING;
    const newFinalOpYPosition = newSummaryYPosition + CHILD_NODE_HEIGHT;

    const childXPositions = [
      parentNode.position.x - CHILD_WIDTH_OFFSET,
      parentNode.position.x,
      parentNode.position.x + CHILD_WIDTH_OFFSET,
    ];

    const newNodes = [];
    const newEdges = [];

    const newMergeId = `${nodeIdCounter++}`;
    const newSummaryId = `${nodeIdCounter++}`;
    const newFinalVideoOpId = `${nodeIdCounter++}`;
    const newVideoOpIds = [];
    const newCodeBlockIds = [];

    for (let i = 0; i < 3; i++) {
      const childId = `${nodeIdCounter++}`;
      const codeBlockId = `${nodeIdCounter++}`;
      const videoOpId = `${nodeIdCounter++}`;

      newVideoOpIds.push(videoOpId);
      newCodeBlockIds.push(codeBlockId);

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

      const codeBlockNode = {
        id: codeBlockId,
        type: "codeBlock",
        position: {
          x: childXPositions[i] + (i === 1 ? 0 : i === 0 ? -100 : 100),
          y: codeBlockYPosition,
        },
        data: {
          label: `Code Transform ${i + 1}`,
          code: `// Apply filter ${i + 1}`,
          language: "JS",
          status: "Ready",
          executedCount: 0,
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

      newNodes.push(childNode, codeBlockNode, videoOpNode);

      const parentToChildEdge = {
        id: `e${parentNodeId}-${childId}`,
        source: parentNodeId,
        target: childId,
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
        type: "deleteButton",
      };

      const childToCodeBlockEdge = {
        id: `e${childId}-${codeBlockId}`,
        source: childId,
        target: codeBlockId,
        style: {
          stroke: "#14b8a6",
          strokeWidth: 2,
          strokeDasharray: "3,3",
        },
        type: "deleteButton",
      };

      const codeBlockToVideoOpEdge = {
        id: `e${codeBlockId}-${videoOpId}`,
        source: codeBlockId,
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

      newEdges.push(
        parentToChildEdge,
        childToCodeBlockEdge,
        codeBlockToVideoOpEdge,
        videoOpToMergeEdge
      );
    }

    const mergeNode = {
      id: newMergeId,
      type: "merge",
      position: { x: parentNode.position.x, y: newMergeYPosition },
      data: {
        label: "Video Merge",
        description: `Combine ${newVideoOpIds.length} generated clips.`,
        inputCount: newVideoOpIds.length,
      },
    };
    newNodes.push(mergeNode);

    const summaryNode = {
      id: newSummaryId,
      type: "summary",
      position: { x: parentNode.position.x - 200, y: newSummaryYPosition },
      data: {
        label: "Final Synthesis Report",
        content: `Report generated from 3 clips and tone analysis...`,
        inputCount: 4,
      },
    };
    newNodes.push(summaryNode);

    // Edge from Tone Analysis (node 10) to Summary Node
    const toneToSummaryEdge = {
      id: `e10-${newSummaryId}`,
      source: "10",
      target: newSummaryId,
      sourceHandle: "s",
      targetHandle: "d",
      style: { stroke: "#ec4899", strokeWidth: 2 },
      type: "deleteButton",
    };
    newEdges.push(toneToSummaryEdge);

    // Edge from Merge Node to Final Output Node
    const mergeToFinalEdge = {
      id: `e${newMergeId}-${newFinalVideoOpId}`,
      source: newMergeId,
      target: newFinalVideoOpId,
      style: { stroke: "#10b981", strokeWidth: 3 },
      type: "deleteButton",
    };
    newEdges.push(mergeToFinalEdge);

    // Create Final Video Output Node
    const finalVideoOpNode = {
      id: newFinalVideoOpId,
      type: "videoOP",
      position: { x: parentNode.position.x, y: newFinalOpYPosition },
      data: {
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        label: "Final Workflow Video Output",
      },
    };
    newNodes.push(finalVideoOpNode);

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
        text: "Processing your request... Workflow structure updated to include video merging, code transformation, and final synthesis report!",
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
            if (
              (node.type === "child" ||
                node.type === "codeBlock" ||
                node.type === "summary") &&
              nodeIds.includes(node.id)
            ) {
              return {
                ...node,
                data: {
                  ...node.data,
                  status: "Completed",
                  executedCount:
                    node.data.executedCount !== undefined
                      ? node.data.executedCount + 1
                      : undefined,
                },
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

  // 🚨 NEW FEATURE: Function to delete all currently selected nodes/edges
  const handleDeleteSelectedNodesAndEdges = () => {
    const selectedElements = instance.get
      ? instance.get().getElements() // Older ReactFlow versions might need this
      : [...instance.getNodes(), ...instance.getEdges()];

    const selectedNodeIds = selectedElements
      .filter((e) => e.selected && e.id)
      .map((n) => n.id);

    // ReactFlow automatically deletes connected edges when a node is deleted,
    // but it's cleaner to handle both: remove selected nodes and all edges connected
    // to *any* selected node (which includes manually selected edges too).

    if (selectedNodeIds.length === 0) {
      alert("No nodes or edges selected.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the ${selectedNodeIds.length} selected node(s) and their connected edges?`
      )
    ) {
      return;
    }

    // 1. Remove selected nodes
    setNodes((nds) => nds.filter((n) => !selectedNodeIds.includes(n.id)));

    // 2. Remove any edge where the source OR target ID matches a selected node ID
    //    OR the edge itself was selected.
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !e.selected &&
          !selectedNodeIds.includes(e.source) &&
          !selectedNodeIds.includes(e.target)
      )
    );

    setSelectedNode(null);
    setShowParentChat(false);
  };

  // Add New Node logic remains the same
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
      textOP: {
        label: `Text Output ${nodeIdCounter}`,
        content: `Analysis complete: Status report for Node ${nodeIdCounter} ready.`,
      },
      merge: {
        label: `Merge ${nodeIdCounter}`,
        description: "Custom merge operation.",
        inputCount: 2,
      },
      codeBlock: {
        label: `Custom Code ${nodeIdCounter}`,
        code: `// Custom function for node ${nodeIdCounter}\nfunction process(input) {\n  return input * 2;\n}`,
        language: "JavaScript",
        status: "Ready",
        executedCount: 0,
      },
      summary: {
        label: `Final Report ${nodeIdCounter}`,
        content: "Awaiting inputs for final synthesis...",
        description: "Consolidates text/data inputs into a final report.",
        inputCount: 3,
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

  // Helper to get selected node data
  const getSelectedNodeData = () => {
    if (!selectedNode) return null;
    return nodes.find((node) => node.id === selectedNode.id);
  };

  const currentSelectedNode = getSelectedNodeData();

  const currentChatMessages = activeParentNode?.data?.chatHistory || [];

  // Definition of node options (unchanged)
  const nodeOptions = [
    {
      type: "parent",
      icon: MessageSquare,
      color: "emerald",
      label: "Parent Prompt",
      description: "Main workflow orchestrator",
    },
    {
      type: "child",
      icon: Bot,
      color: "blue",
      label: "Child Prompt",
      description: "Sub-task processor",
    },
    {
      type: "codeBlock",
      icon: Code,
      color: "teal",
      label: "Code Block",
      description: "Custom code execution",
    },
    {
      type: "videoOP",
      icon: Video,
      color: "purple",
      label: "Video Output",
      description: "Video processing node",
    },
    {
      type: "textOP",
      icon: FileText,
      color: "cyan",
      label: "Text Output",
      description: "Text analysis output",
    },
    {
      type: "merge",
      icon: Layers,
      color: "orange",
      label: "Merge",
      description: "Combine multiple inputs",
    },
    {
      type: "summary",
      icon: ListChecks,
      color: "pink",
      label: "Summary Report",
      description: "Final synthesis node",
    },
  ];

  // Helper Component for the dynamic Configuration Pane
  const NodeConfigPanel = ({
    node,
    setNodes,
    setSelectedNode,
    handleSimulateMerge,
    handleCopyToClipboard,
    handleDownloadVideo,
  }) => {
    const nodeType = node.type;
    const data = node.data;

    // Function to update any node data field
    const updateNodeData = (field, value) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  [field]: value,
                },
              }
            : n
        )
      );
    };

    const handleDeleteNode = () => {
      if (
        confirm(
          `Are you sure you want to delete the ${nodeType} node: ${data.label}?`
        )
      ) {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        setEdges((eds) =>
          eds.filter(
            (edge) => edge.source !== node.id && edge.target !== node.id
          )
        );
        setSelectedNode(null);
      }
    };

    // Determine color for the header icon
    const headerColor =
      nodeOptions.find((opt) => opt.type === nodeType)?.color || "gray";
    const HeaderIcon =
      nodeOptions.find((opt) => opt.type === nodeType)?.icon || Settings;

    return (
      <div className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/90 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl shadow-gray-900/50 overflow-y-auto z-10 custom-scrollbar">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 bg-${headerColor}-500/20 rounded-xl border border-${headerColor}-500/50`}
              >
                <HeaderIcon className={`w-5 h-5 text-${headerColor}-400`} />
              </div>
              <h3 className="text-xl font-bold text-white">
                {data.label || "Node Configuration"}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full transition-all duration-200"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* General Fields: Label & Description (most nodes) */}
            {(nodeType === "parent" ||
              nodeType === "child" ||
              nodeType === "merge" ||
              nodeType === "summary") && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Node Label
                  </label>
                  <input
                    type="text"
                    value={data.label}
                    onChange={(e) => updateNodeData("label", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={data.description}
                    onChange={(e) =>
                      updateNodeData("description", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                  />
                </div>
              </>
            )}

            {/* Specific Configs */}

            {/* Video Output Node */}
            {nodeType === "videoOP" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={data.video}
                    onChange={(e) => updateNodeData("video", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
                {/* Unique Action Button for VideoOP */}
                <button
                  onClick={() => handleDownloadVideo(data.video)}
                  className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-xl shadow-purple-500/30 border border-purple-700/50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Final Video
                </button>
              </>
            )}

            {/* Text Output / Summary Node */}
            {(nodeType === "textOP" || nodeType === "summary") && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    {nodeType === "textOP"
                      ? "Text Content"
                      : "Final Synthesis Content"}
                  </label>
                  <textarea
                    rows="5"
                    readOnly={nodeType === "textOP"} // TextOP is read-only
                    value={data.content}
                    onChange={(e) => updateNodeData("content", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border resize-none focus:outline-none ${
                      nodeType === "textOP"
                        ? "bg-gray-800/50 text-gray-400 border-gray-700/50"
                        : "bg-gray-800/70 text-white border-gray-600/50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    }`}
                  />
                </div>
                {/* Unique Action Button for TextOP/Summary */}
                <button
                  onClick={() => handleCopyToClipboard(data.content)}
                  className="w-full px-4 py-3 bg-linear-to-r from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white rounded-xl font-bold shadow-xl shadow-pink-500/30 border border-pink-700/50 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Text Output
                </button>
              </>
            )}

            {/* Code Block Node */}
            {nodeType === "codeBlock" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Code Language
                  </label>
                  <input
                    type="text"
                    value={data.language}
                    onChange={(e) => updateNodeData("language", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Code Content
                  </label>
                  <textarea
                    rows="10"
                    value={data.code}
                    onChange={(e) => updateNodeData("code", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 text-white font-mono rounded-xl border border-gray-600/50 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 resize-none"
                  />
                </div>
                {/* Unique Action Button for CodeBlock (Optional: Run Test) */}
                <button
                  onClick={() =>
                    alert(`Simulating execution of ${data.language} code...`)
                  }
                  className="w-full px-4 py-3 bg-linear-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-xl font-bold shadow-xl shadow-teal-500/30 border border-teal-700/50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Run Test Code
                </button>
              </>
            )}

            {/* Merge Node */}
            {nodeType === "merge" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Input Count
                  </label>
                  <div className="px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl border border-gray-700/50 text-sm font-mono">
                    {data.inputCount}
                  </div>
                </div>
                {/* Unique Action Button for Merge */}
                <button
                  onClick={handleSimulateMerge}
                  className="w-full px-4 py-3 bg-linear-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white rounded-xl font-bold shadow-xl shadow-orange-500/30 border border-orange-700/50 transition-all flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5" />
                  Perform Merge Operation
                </button>
              </>
            )}

            {/* Common Info & Delete */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">
                  NODE TYPE
                </label>
                <div className="px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50 text-sm font-semibold">
                  {node.type}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">
                  NODE ID
                </label>
                <div className="px-4 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700/50 text-sm font-mono">
                  {node.id}
                </div>
              </div>
            </div>

            {/* Delete Button (Always last) */}
            <div className="pt-4 border-t border-gray-700/50">
              <button
                onClick={handleDeleteNode}
                className="w-full px-4 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-bold shadow-xl shadow-red-500/30 border border-red-700/50 flex items-center justify-center gap-2"
              >
                <Trash className="w-5 h-5" />
                Delete Node
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    // 1. Main Container - Enhanced linear Background
    <div className="w-full h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col overflow-hidden">
      {/* Enhanced Header with linear and Animations */}
      <div className="relative bg-linear-to-r from-gray-900/95 via-emerald-900/10 to-gray-900/95 backdrop-blur-xl shadow-2xl z-20">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>

        <div className="relative px-6 py-4 flex items-center justify-between">
          <div className="relative bg-linear-to-r from-gray-900/95 via-emerald-900/10 to-gray-900/95 backdrop-blur-xl border-emerald-500/20 shadow-2xl z-20">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>

            <div className="relative px-6 flex items-center justify-between">
              {/* Logo with hover animation */}
              <div className="flex items-center gap-3 group">
                <div className="relative p-3 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/50 transition-all duration-300 group-hover:shadow-emerald-500/70 group-hover:scale-105">
                  <Zap className="w-6 h-6 text-white animate-pulse" />
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-green-500">
                    SARAS AI
                  </h1>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Next-Gen Chain Prompting with OUMI
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Enhanced stats display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all hover:border-emerald-500/50 hover:scale-105 duration-200">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{nodes.length}</span>
                <span className="text-gray-400">Nodes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all hover:border-emerald-500/50 hover:scale-105 duration-200">
                <Grid className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{edges.length}</span>
                <span className="text-gray-400">Edges</span>
              </div>
            </div>

            {/* 🚨 NEW: Delete Selected Button */}
            {instance && (
              <button
                onClick={handleDeleteSelectedNodesAndEdges}
                className="group px-4 py-2 bg-linear-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 disabled:from-gray-700/50 disabled:to-gray-700/50 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/50"
                disabled={
                  !instance ||
                  instance.getNodes().filter((n) => n.selected).length === 0
                }
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </button>
            )}

            {/* Existing Delete All Button */}
            <button
              onClick={handleMassDeleteClusterGlobal}
              className="group px-4 py-2 bg-linear-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 disabled:from-gray-700/50 disabled:to-gray-700/50 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/50"
              disabled={isExecuting}
            >
              <Trash className="w-4 h-4 group-hover:animate-bounce" />
              Clear All
            </button>

            <button
              onClick={handleMassRun}
              disabled={isExecuting}
              className="group px-5 py-2 bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border border-emerald-400/50 hover:border-emerald-400 hover:shadow-emerald-500/70"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  Execute All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Toolbar with Dropdown Menu */}
      <div className="relative from-gray-800/70 via-gray-800/80 to-gray-800/70 backdrop-blur-md border-b border-gray-700/50 px-6 py-3 flex items-center gap-3 shadow-inner z-10">
        <div className="flex items-center gap-3">
          {/* Modern Add Node Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="group px-4 py-2 bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/50"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Node
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showAddMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Animated Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  {nodeOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => {
                        addNewNode(option.type);
                        setShowAddMenu(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-${option.color}-500/10 hover:border-${option.color}-500/30 border border-transparent group`}
                    >
                      <div
                        className={`p-2 bg-${option.color}-500/20 rounded-lg border border-${option.color}-500/30 group-hover:scale-110 transition-transform`}
                      >
                        <option.icon
                          className={`w-5 h-5 text-${option.color}-400`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-semibold text-sm">
                          {option.label}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="px-4 py-2 bg-gray-700/70 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-md"
            >
              <Eye className="w-4 h-4" />
              View
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showViewMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showViewMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowMiniMap(!showMiniMap);
                      setShowViewMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300"
                  >
                    <span className="flex items-center gap-2">
                      {showMiniMap ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                      Mini Map
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        showMiniMap ? "bg-emerald-500" : "bg-gray-600"
                      } relative`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          showMiniMap ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsFullscreen(!isFullscreen);
                      setShowViewMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              className="opacity-10"
            />
            {/* Controls - Modernized floating glass effect */}
            <Controls className="absolute max-w-0 bottom-6 right-6" />
            {showMiniMap && (
              <MiniMap
                zoomable
                pannable
                nodeBorderRadius={10}
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
                    case "codeBlock":
                      return "#14b8a6";
                    case "summary":
                      return "#ec4899";
                    default:
                      return "#6b7280";
                  }
                }}
                className="cursor-pointer shadow-lg rounded-xl border border-gray-700/50"
              />
            )}
          </ReactFlow>

          {/* Configuration Panel (Right Sidebar) - Now using the dedicated component */}
          {currentSelectedNode && (
            <NodeConfigPanel
              node={currentSelectedNode}
              setNodes={setNodes}
              setSelectedNode={setSelectedNode}
              handleSimulateMerge={handleSimulateMerge}
              handleCopyToClipboard={handleCopyToClipboard}
              handleDownloadVideo={handleDownloadVideo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 🚨 Must export a wrapper function with ReactFlowProvider to use useReactFlow
export default function WorkflowOrchestrationContent() {
  return <WorkflowOrchestrationInner />;
}
