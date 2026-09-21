import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Clock,
  ChevronLeft,
  Calendar,
  Layers,
  AlertCircle,
} from "lucide-react";
import { ChatThread } from "../types";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onRenameThread,
  onDeleteThread,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingThreadId, setRenamingThreadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingThreadId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingThreadId]);

  const handleStartRename = (thread: ChatThread, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingThreadId(thread.id);
    setRenameValue(thread.title);
    setDeletingThreadId(null);
  };

  const handleConfirmRename = (threadId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed) {
      onRenameThread(threadId, trimmed);
    }
    setRenamingThreadId(null);
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRenamingThreadId(null);
  };

  const handleStartDelete = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingThreadId(threadId);
    setRenamingThreadId(null);
  };

  const handleConfirmDelete = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteThread(threadId);
    setDeletingThreadId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingThreadId(null);
  };

  // Filter threads by search query
  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.messages.some((m) => m.text.toLowerCase().includes(query))
    );
  });

  // Group threads into Today, Yesterday, Previous 7 Days, Older
  const groupThreads = (list: ChatThread[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: { label: string; items: ChatThread[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Previous 7 Days", items: [] },
      { label: "Older Discussions", items: [] },
    ];

    list.forEach((t) => {
      const d = new Date(t.updatedAt || t.createdAt);
      if (isNaN(d.getTime())) {
        groups[0].items.push(t);
        return;
      }
      d.setHours(0, 0, 0, 0);
      if (d.getTime() >= today.getTime()) {
        groups[0].items.push(t);
      } else if (d.getTime() === yesterday.getTime()) {
        groups[1].items.push(t);
      } else if (d.getTime() >= sevenDaysAgo.getTime()) {
        groups[2].items.push(t);
      } else {
        groups[3].items.push(t);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const groupedThreads = groupThreads(filteredThreads);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
        aria-label="Close Chat History"
      />

      {/* Sidebar Drawer Container */}
      <aside
        id="bolt-chat-history-sidebar"
        className="fixed top-0 bottom-0 left-0 z-40 w-80 sm:w-88 bg-[#0d121c] border-r border-[#1e293b] flex flex-col shadow-2xl transition-all duration-300 ease-in-out lg:static lg:h-full lg:z-10 lg:shadow-none rounded-2xl lg:mr-3 overflow-hidden flex-shrink-0"
      >
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-[#101726] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Chat History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium">
                  {threads.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Previous mentorship threads</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close history sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Primary Action Button */}
        <div className="p-3 border-b border-slate-800/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onNewThread();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Threads Filter */}
        <div className="px-3 pt-2.5 pb-1 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversation threads..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#141b2a] rounded-lg border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Thread List Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4 scrollbar-thin">
          {groupedThreads.length === 0 ? (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
              <p className="text-xs font-medium text-slate-300">
                {searchQuery ? "No matching conversations found" : "No conversation history yet"}
              </p>
              <p className="text-[11px] text-slate-500">
                {searchQuery
                  ? "Try a different search term or thinker name"
                  : "Start asking Bolt about your UPSC preparation to build threads"}
              </p>
            </div>
          ) : (
            groupedThreads.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{group.label}</span>
                </div>

                <div className="space-y-1">
                  {group.items.map((thread) => {
                    const isActive = thread.id === activeThreadId;
                    const isRenaming = renamingThreadId === thread.id;
                    const isDeleting = deletingThreadId === thread.id;

                    const lastMsg = thread.messages[thread.messages.length - 1];
                    const lastSnippet = lastMsg?.text
                      ? lastMsg.text.replace(/^[#\s*>-]+/, "").slice(0, 65) + "..."
                      : "No messages yet";

                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          if (!isRenaming && !isDeleting) {
                            onSelectThread(thread.id);
                            if (window.innerWidth < 1024) onClose();
                          }
                        }}
                        className={`group relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#182338] border-blue-500/50 shadow-sm"
                            : "bg-[#111726]/70 hover:bg-[#151d30] border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {/* Renaming Mode */}
                        {isRenaming ? (
                          <form
                            onSubmit={(e) => handleConfirmRename(thread.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="space-y-2"
                          >
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") handleCancelRename();
                              }}
                              className="w-full px-2 py-1 bg-[#0b0f17] border border-blue-500 text-xs text-white rounded-lg focus:outline-none"
                              placeholder="Enter thread name..."
                            />
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={handleCancelRename}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                            </div>
                          </form>
                        ) : isDeleting ? (
                          /* Delete Confirmation Inline */
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 space-y-1.5 animate-fadeIn"
                          >
                            <div className="flex items-center space-x-1.5 text-red-400 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Delete this conversation?</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              This will remove all {thread.messages.length} messages in this thread.
                            </p>
                            <div className="flex items-center justify-end space-x-1.5 pt-1">
                              <button
                                type="button"
                                onClick={handleCancelDelete}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleConfirmDelete(thread.id, e)}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold flex items-center space-x-1 shadow-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Thread Item */
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    isActive ? "bg-blue-400 animate-pulse" : "bg-slate-600"
                                  }`}
                                />
                                <h4
                                  className={`text-xs font-semibold truncate ${
                                    isActive ? "text-blue-200" : "text-slate-200 group-hover:text-white"
                                  }`}
                                  title={thread.title}
                                >
                                  {thread.title}
                                </h4>
                              </div>

                              {/* Action Buttons (Rename & Delete) */}
                              <div className="flex items-center space-x-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(thread, e)}
                                  className="p-1 rounded text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                                  title="Rename thread"
                                  aria-label="Rename thread"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleStartDelete(thread.id, e)}
                                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                  title="Delete thread"
                                  aria-label="Delete thread"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Snippet & Message Count */}
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-snug">
                              {lastSnippet}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-800/40">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>
                                  {formatRelativeThreadTime(thread.updatedAt || thread.createdAt)}
                                </span>
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 font-mono">
                                {thread.messages.length} msgs
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer Stats */}
        <div className="p-3 border-t border-slate-800/80 bg-[#101726]/60 text-[10px] text-slate-400 flex items-center justify-between flex-shrink-0">
          <span className="flex items-center space-x-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Threads saved locally & synced</span>
          </span>
          <span className="font-mono text-slate-500">BOLT AI v3</span>
        </div>
      </aside>
    </>
  );
};

function formatRelativeThreadTime(isoOrDateString: string): string {
  if (!isoOrDateString) return "Recently";
  const date = new Date(isoOrDateString);
  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
