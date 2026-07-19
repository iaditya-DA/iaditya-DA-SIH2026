import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Github, Phone, MessageCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TeamCard({ team, onClick }) {
  const totalMembers = 1 + (team.members?.filter(m => m.name).length || 0);

  return (
    <Card
      className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-orange-400 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-blue-900 group-hover:text-orange-500 transition-colors duration-300">
            {team.team_name}
          </h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300">
            <Users className="w-3 h-3 mr-1" />
            {totalMembers} members
          </Badge>
        </div>

        {team.problem_statement && (
          <p className="text-slate-600 text-sm mt-2 line-clamp-2">
            <strong className="text-slate-800">Problem:</strong> {team.problem_statement}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-slate-500 text-sm mb-2">Team Leader:</p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            <span className="text-slate-800 font-medium">{team.leader?.name}</span>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-slate-700">
              {team.leader?.year} • {team.leader?.branch}
            </Badge>
          </div>
        </div>

        {team.leader?.skills && team.leader.skills.length > 0 && (
          <div>
            <p className="text-slate-500 text-sm mb-2">Leader Skills:</p>
            <div className="flex flex-wrap gap-1">
              {team.leader.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                  {skill}
                </Badge>
              ))}
              {team.leader.skills.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-slate-500 border-gray-300">
                  +{team.leader.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
            <Calendar className="w-3 h-3" />
            {format(new Date(team.created_date), "MMM d, yyyy")}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {team.leader?.github_link && (
              <Github className="w-4 h-4 text-slate-500" />
            )}
            {team.leader?.phone && (
              <Phone className="w-4 h-4 text-green-600" />
            )}
            {team.leader?.discord && (
              <MessageCircle className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}