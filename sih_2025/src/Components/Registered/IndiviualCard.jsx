import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Github, Phone, MessageCircle, Calendar, Award } from "lucide-react";
import { format } from "date-fns";

export default function IndividualCard({ individual, onContact }) {
  return (
    <Card className="glass-card hover:scale-105 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
            {individual.name}
          </h3>
          <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
            <User className="w-3 h-3 mr-1" />
            Individual
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-sm">{individual.year} • {individual.branch}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {individual.skills && individual.skills.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-2">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {individual.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-blue-600/20 text-blue-300">
                  {skill}
                </Badge>
              ))}
              {individual.skills.length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-600/20 text-gray-400">
                  +{individual.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {individual.has_deployed_software && (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">Has deployed software</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {format(new Date(individual.created_date), "MMM d, yyyy")}
          </div>
          
          <div className="flex items-center gap-2">
            {individual.github_link && (
              <Github className="w-4 h-4 text-gray-400" />
            )}
            <Phone className="w-4 h-4 text-green-400" />
            {individual.discord_link && (
              <MessageCircle className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>
        
        <Button 
          onClick={() => onContact(individual)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          Contact This Person
        </Button>
      </CardContent>
    </Card>
  );
}