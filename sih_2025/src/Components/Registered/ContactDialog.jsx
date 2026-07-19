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
      <DialogContent className="bg-white border border-gray-200 text-slate-800 max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-900 font-bold">Contact {individual.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{individual.name}</h3>
            <p className="text-slate-500">{individual.year} • {individual.branch}</p>
          </div>

          {individual.skills && individual.skills.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {individual.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-blue-900">Contact Information:</h4>

            {individual.discord_link ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Discord</p>
                    <p className="font-medium text-slate-800">{individual.discord_link}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(individual.discord_link)}
                    className="bg-white border-gray-300 hover:bg-gray-50 text-slate-700"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-red-600 font-medium">No Discord provided</p>
                    <p className="text-xs text-slate-500">This person hasn't shared their Discord contact</p>
                  </div>
                </div>
              </div>
            )}

            {individual.github_link && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-slate-600" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">GitHub</p>
                    <p className="font-medium text-slate-800 truncate">{individual.github_link}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(individual.github_link, '_blank')}
                    className="bg-white border-gray-300 hover:bg-gray-50 text-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}