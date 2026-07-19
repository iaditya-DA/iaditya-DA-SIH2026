import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User, Github, Phone, MessageCircle, Calendar, Target } from "lucide-react";
import { format } from "date-fns";

export default function TeamDetailsDialog({ team, isOpen, onClose }) {
  if (!team) return null;

  const validMembers = team.members?.filter(member => member.name) || [];
  const totalMembers = 1 + validMembers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 text-slate-800 max-w-2xl max-h-[80vh] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-900 font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            {team.team_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Team Info */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300">
                  <Users className="w-3 h-3 mr-1" />
                  {totalMembers} members
                </Badge>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  Registered {format(new Date(team.created_date), "MMM d, yyyy")}
                </div>
              </div>

              {team.problem_statement && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-blue-900">Problem Statement:</span>
                  </div>
                  <p className="text-slate-700 bg-white border border-orange-100 rounded-lg p-3">
                    {team.problem_statement}
                  </p>
                </div>
              )}
            </div>

            {/* Team Leader */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-blue-900 text-lg">Team Leader</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{team.leader?.name}</h4>
                  <p className="text-slate-500 text-sm">{team.leader?.year} • {team.leader?.branch}</p>
                </div>

                {team.leader?.skills && team.leader.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.leader.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  {team.leader?.github_link && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </div>
                  )}
                  {team.leader?.phone && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Phone className="w-4 h-4" />
                      <span>Phone</span>
                    </div>
                  )}
                  {team.leader?.discord && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>Discord</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            {validMembers.length > 0 && (
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-900" />
                  <span className="font-bold text-blue-900 text-lg">Team Members</span>
                </div>

                <div className="space-y-4">
                  {validMembers.map((member, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="bg-gray-200 my-3" />}
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{member.name}</h4>
                          <p className="text-slate-500 text-sm">{member.year} • {member.branch}</p>
                        </div>

                        {member.skills && member.skills.length > 0 && (
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs bg-blue-50 text-blue-900 border-blue-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.github_link && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Github className="w-4 h-4" />
                            <span>GitHub Profile</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}