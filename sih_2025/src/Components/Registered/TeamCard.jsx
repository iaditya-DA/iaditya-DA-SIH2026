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
      className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
            {team.team_name}
          </h3>
          <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
            <Users className="w-3 h-3 mr-1" />
            {totalMembers} members
          </Badge>
        </div>
        
        {team.problem_statement && (
          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
            <strong>Problem:</strong> {team.problem_statement}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm mb-2">Team Leader:</p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">{team.leader?.name}</span>
            <Badge variant="secondary" className="text-xs">
              {team.leader?.year} • {team.leader?.branch}
            </Badge>
          </div>
        </div>
        
        {team.leader?.skills && team.leader.skills.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-2">Leader Skills:</p>
            <div className="flex flex-wrap gap-1">
              {team.leader.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-purple-600/20 text-purple-300">
                  {skill}
                </Badge>
              ))}
              {team.leader.skills.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-600/20 text-gray-400">
                  +{team.leader.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {format(new Date(team.created_date), "MMM d, yyyy")}
          </div>
          
          <div className="flex items-center gap-2">
            {team.leader?.github_link && (
              <Github className="w-4 h-4 text-gray-400" />
            )}
            {team.leader?.phone && (
              <Phone className="w-4 h-4 text-green-400" />
            )}
            {team.leader?.discord && (
              <MessageCircle className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}