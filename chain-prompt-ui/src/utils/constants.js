import CodeBlockNode from "../Nodes/CodeOP";
import ParentNode from "../Nodes/Parent";
import ChildNode from "../Nodes/Child";
import VideoOPNode from "../Nodes/VideoOP";
import TextOPNode from "../Nodes/TextOP";
import MergeNode from "../Nodes/Merge";
import DeleteButtonEdge from "../components/DeleteButtonEdge";
import SummaryNode from "../Nodes/Summary";
const ICON_COLORS = {
  parent: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  child: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  videoOP: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  textOP: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  merge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  codeBlock: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
  summary: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
};
// Initial nodes (Updated to include codeBlock node '11')
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
    id: "10",
    type: "textOP",
    position: { x: 600, y: 390 },
    data: {
      label: "Tone Analysis Output",
      content:
        "Tone Analysis: The prompt has a playful and whimsical tone. Suggest cinematic, low-key lighting.",
    },
  },
  // 🚨 NEW NODE 11: Code Block
  {
    id: "11",
    type: "codeBlock",
    position: { x: 200, y: 390 },
    data: {
      label: "Pre-Process Python Script",
      code: "def enhance_image(image, style):\n    # Apply style modifications\n    return apply_filter(image, style)",
      language: "Python",
      status: "Ready",
      executedCount: 0,
    },
  },
  {
    id: "5",
    type: "videoOP",
    position: { x: 200, y: 560 }, // Shifted down
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
  // ... existing edges
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
    animated: false,
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
    id: "e2-11", // 🚨 NEW EDGE: Child 2 -> Code Block 11
    source: "2",
    target: "11",
    style: { stroke: "#14b8a6", strokeWidth: 2, strokeDasharray: "3,3" },
    type: "deleteButton",
  },
  {
    id: "e11-5", // 🚨 NEW EDGE: Code Block 11 -> VideoOP 5
    source: "11",
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
  // ... rest of edges (e5-8, e6-8, e7-8, e8-9) remain the same, connecting to the shifted node 5
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
// --- Register Node and Edge Types (Updated) ---

const nodeTypes = {
  parent: ParentNode,
  child: ChildNode,
  videoOP: VideoOPNode,
  textOP: TextOPNode,
  merge: MergeNode,
  codeBlock: CodeBlockNode,
  summary: SummaryNode,
};

const edgeTypes = {
  deleteButton: DeleteButtonEdge,
};
export { ICON_COLORS, initialNodes, initialEdges, nodeTypes, edgeTypes };
