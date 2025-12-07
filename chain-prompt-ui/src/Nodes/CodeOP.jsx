import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Code, // New Icon for Code Block
  Loader,
  CheckCircle,
  Clock,
} from "lucide-react";

const ICON_COLORS = {
  // ... existing colors (parent, child, videoOP, textOP, merge)
  codeBlock: "bg-teal-500/20 text-teal-400 border border-teal-500/30", // New Color
};

const CodeBlockNode = ({ data, isConnectable }) => {
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
    : "border-teal-500";

  return (
    <div
      className={`px-5 py-4 shadow-2xl rounded-2xl max-w-lg bg-gray-900/80 border-2 ${borderColor}/50 min-w-[320px] backdrop-blur-md transition-all duration-300 hover:shadow-teal-500/50 hover:border-teal-500`}
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
        className="w-4 h-4 bg-emerald-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/50 transform "
      />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-xl ${ICON_COLORS.codeBlock} flex-shrink-0`}
          >
            <Code className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-snug truncate max-w-3xs">
              {data.label || "Code Block"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Code Execution / Custom Logic
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/70 p-4 rounded-xl overflow-hidden border border-gray-700/50 mt-3">
        <div className="text-xs text-teal-400 font-mono mb-2">
          Language: **{data.language || "Python"}**
        </div>
        <textarea
          readOnly
          rows="5"
          value={data.code || "# No code provided"}
          className="w-full bg-transparent text-gray-300 text-sm font-mono resize-none focus:outline-none placeholder-gray-500"
          placeholder="Code Preview"
        />
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
        </div>
        <div className="text-gray-400 text-xs">
          Executed: **{data.executedCount || 0}** times
        </div>
      </div>
    </div>
  );
};

export default CodeBlockNode;
