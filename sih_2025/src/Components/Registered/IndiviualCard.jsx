import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Github, Phone, MessageCircle, Calendar, Award } from "lucide-react";
import { format } from "date-fns";

export default function IndividualCard({ individual, onContact }) {
  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-orange-400 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-blue-900 group-hover:text-orange-500 transition-colors duration-300">
            {individual.name}
          </h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300">
            <User className="w-3 h-3 mr-1" />
            Individual
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-sm">{individual.year} • {individual.branch}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {individual.skills && individual.skills.length > 0 && (
          <div>
            <p className="text-slate-500 text-sm mb-2">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {individual.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                  {skill}
                </Badge>
              ))}
              {individual.skills.length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-slate-500 border-gray-300">
                  +{individual.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {individual.has_deployed_software && (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Has deployed software</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
            <Calendar className="w-3 h-3" />
            {format(new Date(individual.created_date), "MMM d, yyyy")}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {individual.github_link && (
              <Github className="w-4 h-4 text-slate-500" />
            )}
            <Phone className="w-4 h-4 text-green-600" />
            {individual.discord_link && (
              <MessageCircle className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>

        <Button
          onClick={() => onContact(individual)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          Contact This Person
        </Button>
      </CardContent>
    </Card>
  );
}