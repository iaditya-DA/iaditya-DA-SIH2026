import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Github, ExternalLink, AlertCircle } from "lucide-react";

export default function ContactDialog({ individual, isOpen, onClose }) {
  if (!individual) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">Contact {individual.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{individual.name}</h3>
            <p className="text-gray-300">{individual.year} • {individual.branch}</p>
          </div>
          
          {individual.skills && individual.skills.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {individual.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs bg-blue-600/20 text-blue-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-300">Contact Information:</h4>
            
            {individual.discord_link ? (
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Discord</p>
                    <p className="font-medium">{individual.discord_link}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(individual.discord_link)}
                    className="bg-white/10 border-white/20 hover:bg-white/20"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 rounded-xl border-red-500/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-red-300 font-medium">No Discord provided</p>
                    <p className="text-xs text-gray-400">This person hasn't shared their Discord contact</p>
                  </div>
                </div>
              </div>
            )}
            
            {individual.github_link && (
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">GitHub</p>
                    <p className="font-medium truncate">{individual.github_link}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(individual.github_link, '_blank')}
                    className="bg-white/10 border-white/20 hover:bg-white/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}