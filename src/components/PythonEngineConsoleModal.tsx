import React, { useState } from "react";
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  FileCode,
  X,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

interface PythonEngineConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COMMANDS = [
  {
    label: "Check Python Engine Status",
    cmd: "python3 python/bolt_cli.py status",
    description: "Inspect active Python version and microservice modules",
  },
  {
    label: "Query 19th Century PYQs (1855-1899)",
    cmd: "python3 python/bolt_cli.py pyqs --era 19th_century",
    description: "Fetch colonial ICS competitive examination questions",
  },
  {
    label: "Filter Peripheral Area PYQs",
    cmd: "python3 python/bolt_cli.py pyqs --peripheral",
    description: "Query tribal customary laws, deep ecology, and fringe S&T",
  },
  {
    label: "Process Demo Study Material (PDF/DOCX)",
    cmd: "python3 python/bolt_cli.py materials --demo",
    description: "Extract 2nd ARC summary and generate 5 practice questions",
  },
  {
    label: "NCERT Class 6-12 Module Summary",
    cmd: "python3 python/bolt_cli.py ncert --summary",
    description: "List foundational curriculum counts across 5 core subjects",
  },
  {
    label: "Run Student Diagnostic Analytics",
    cmd: "python3 python/bolt_cli.py analytics",
    description: "Execute Ebbinghaus retention and knowledge scoring algorithm",
  },
];

export const PythonEngineConsoleModal: React.FC<PythonEngineConsoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCmd, setSelectedCmd] = useState<string>(PRESET_COMMANDS[0].cmd);
  const [customCmd, setCustomCmd] = useState<string>(PRESET_COMMANDS[0].cmd);
  const [output, setOutput] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunCommand = async (commandToRun: string) => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/python/cli/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandToRun }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }

      setOutput(data.output);
      setExecutionTime(data.executionTimeMs);
    } catch (err: any) {
      setError(err.message || "Failed to execute command.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f141f] border border-[#232f45] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#232f45] flex items-center justify-between bg-[#151b28]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base font-['Outfit']">
                  Python 3.10 Engine Terminal & Console
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Runtime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct execution of BOLT's Python microservices & CLI tools
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Engine Architecture Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#151b28] border border-[#232f45]">
              <div className="text-[11px] text-slate-400">Environment</div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Python 3.10.12 (Linux)</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#151b28] border border-[#232f45]">
              <div className="text-[11px] text-slate-400">Python Modules</div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center space-x-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>bolt_materials, pyqs, ncert</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#151b28] border border-[#232f45]">
              <div className="text-[11px] text-slate-400">Execution Bridge</div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Native Subprocess RPC</span>
              </div>
            </div>
          </div>

          {/* Preset Commands Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Preset Python CLI Tasks
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRESET_COMMANDS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCmd(item.cmd);
                    setCustomCmd(item.cmd);
                    handleRunCommand(item.cmd);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCmd === item.cmd
                      ? "bg-blue-600/15 border-blue-500 text-white"
                      : "bg-[#151b28] border-[#232f45] text-slate-300 hover:border-slate-700 hover:bg-[#182133]"
                  }`}
                >
                  <div className="text-xs font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  <code className="text-[10px] text-blue-300 mt-1.5 block font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    {item.cmd}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Command Input Box & Run Button */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Execute Command
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customCmd}
                  onChange={(e) => setCustomCmd(e.target.value)}
                  placeholder="python3 python/bolt_cli.py ..."
                  className="w-full bg-[#151b28] border border-[#232f45] text-white text-xs font-mono rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleRunCommand(customCmd)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>{isLoading ? "Running..." : "Run"}</span>
              </button>
            </div>
          </div>

          {/* Terminal Output Screen */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Output</span>
              </span>
              <div className="flex items-center space-x-2">
                {executionTime !== null && (
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{executionTime} ms</span>
                  </span>
                )}
                {output && (
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-[#232f45] min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed custom-scrollbar">
              {isLoading && (
                <div className="text-slate-400 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Executing Python process...</span>
                </div>
              )}
              {error && (
                <div className="text-rose-400 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {!isLoading && !error && output && output}
              {!isLoading && !error && !output && (
                <span className="text-slate-600">
                  Select a preset command above or click Run to invoke the Python 3.10 engine.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#232f45] bg-[#151b28] flex items-center justify-between text-xs text-slate-400">
          <span>Python Microservices: /python/bolt_*.py</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
