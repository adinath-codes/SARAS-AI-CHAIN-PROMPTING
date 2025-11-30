// File: SummaryNode.jsx

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { ListChecks, FileText } from "lucide-react"; // ListChecks for summarization/collation
import { ICON_COLORS } from "../utils/constants";
/**
 * SummaryNode component: Takes multiple inputs and generates a single text summary.
 * It features dynamic input handles (A, B, C) and a single output handle.
 */
const SummaryNode = ({ data, isConnectable }) => (
  <div className="px-5 py-4 shadow-2xl rounded-2xl max-w-sm bg-gray-900/80 border-2 border-pink-500/50 min-w-[280px] backdrop-blur-md transition-all duration-300 hover:shadow-pink-500/50 hover:border-pink-500">
    {/* --- Target Handles (Multiple Inputs) --- */}

    {/* Input A (Left) */}
    <Handle
      type="target"
      position={Position.Top}
      id="a"
      isConnectable={isConnectable}
      style={{ left: 50, background: "#ec4899", borderColor: "#f9a8d4" }}
      className="w-4 h-4 shadow-xl shadow-pink-500/50 transform rotate-45 rounded-md"
    />

    {/* Input B (Center) */}
    <Handle
      type="target"
      position={Position.Top}
      id="b"
      isConnectable={isConnectable}
      style={{
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        background: "#ec4899",
        borderColor: "#f9a8d4",
      }}
      className="w-4 h-4 shadow-xl shadow-pink-500/50 rounded-md"
    />

    {/* Input C (Right) */}
    <Handle
      type="target"
      position={Position.Top}
      id="c"
      isConnectable={isConnectable}
      style={{
        left: "auto",
        right: 50,
        background: "#ec4899",
        borderColor: "#f9a8d4",
      }}
      className="w-4 h-4 shadow-xl shadow-pink-500/50 transform rotate-45 rounded-md"
    />

    {/* --- Header Content --- */}
    <div className="flex items-start gap-3 mb-2 pt-4">
      <div className={`p-3 rounded-xl ${ICON_COLORS.summary} flex-shrink-0`}>
        <ListChecks className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
          {data.label || "Summary Node"}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Collation & Final Report Generation
        </p>
      </div>
    </div>

    {/* --- Content Area (Summary Preview) --- */}
    <div className="bg-gray-800/70 p-3 rounded-xl overflow-hidden border border-gray-700/50 mt-3">
      <textarea
        readOnly
        rows="3"
        value={data.content || "Awaiting inputs for final synthesis..."}
        className="w-full bg-transparent text-gray-300 text-sm resize-none focus:outline-none placeholder-gray-500"
        placeholder="Generated Summary Preview"
      />
    </div>

    <div className="flex justify-between items-center pt-3 text-sm text-pink-400 font-semibold border-t border-gray-700/50 mt-3">
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <FileText className="w-3 h-3" />
        Output: Text Report
      </div>
      Expected Inputs:{" "}
      <span className="text-white ml-1">{data.inputCount || 3}</span>
    </div>

    {/* --- Source Handle (Single Output) --- */}
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-pink-500 border-2 border-pink-300 shadow-xl shadow-pink-500/50 transform rotate-45 rounded-md !left-1/2 !-translate-x-1/2"
    />
  </div>
);

export default SummaryNode;
