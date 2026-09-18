import React from "react";
import { X } from "lucide-react";
import { SettingsView } from "./SettingsView";
import {
  UserProfile,
  ActiveModelConfig,
  AppThemeMode,
} from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  activeModelConfig: ActiveModelConfig;
  onUpdateActiveModelConfig: (config: ActiveModelConfig) => void;
  onOpenAuth: (mode?: "signin" | "signup") => void;
  themeMode?: AppThemeMode;
  onToggleTheme?: (mode?: AppThemeMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  activeModelConfig,
  onUpdateActiveModelConfig,
  onOpenAuth,
  themeMode,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0e17] rounded-2xl border border-[#1e293b] w-full max-w-5xl my-auto max-h-[92vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 z-20 flex justify-end p-3 bg-[#0a0e17]/90 backdrop-blur border-b border-[#1e293b]/60">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 sm:p-4">
          <SettingsView
            user={user}
            onUpdateUser={onUpdateUser}
            activeModelConfig={activeModelConfig}
            onUpdateActiveModelConfig={onUpdateActiveModelConfig}
            onOpenAuth={onOpenAuth}
            themeMode={themeMode}
            onToggleTheme={onToggleTheme}
          />
        </div>
      </div>
    </div>
  );
};
