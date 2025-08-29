import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

const COMMON_SKILLS = [
  "JavaScript", "Python", "Java", "React", "Node.js", "HTML/CSS", 
  "UI/UX Design", "Machine Learning", "Data Science", "Mobile Development",
  "Backend Development", "Frontend Development", "DevOps", "Cloud Computing",
  "Communication", "Leadership", "Problem Solving", "Project Management"
];

export default function MemberInput({ 
  member, 
  index, 
  onChange, 
  isLeader = false, 
  title = "Member" 
}) {
  const [skillInput, setSkillInput] = React.useState("");

  const handleSkillAdd = (skill) => {
    if (skill && !member.skills?.includes(skill)) {
      onChange(index, "skills", [...(member.skills || []), skill]);
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    onChange(index, "skills", member.skills?.filter(skill => skill !== skillToRemove) || []);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title} {!isLeader && `#${index + 1}`}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${index}`} className="text-gray-300">Name *</Label>
          <Input
            id={`name-${index}`}
            placeholder="Enter full name"
            value={member.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`year-${index}`} className="text-gray-300">Year *</Label>
          <Input
            id={`year-${index}`}
            placeholder="e.g., 3rd Year"
            value={member.year || ""}
            onChange={(e) => onChange(index, "year", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`branch-${index}`} className="text-gray-300">Branch *</Label>
          <Input
            id={`branch-${index}`}
            placeholder="e.g., Computer Science"
            value={member.branch || ""}
            onChange={(e) => onChange(index, "branch", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`github-${index}`} className="text-gray-300">
            GitHub Link {!isLeader && "(Optional)"}
          </Label>
          <Input
            id={`github-${index}`}
            placeholder="https://github.com/username"
            value={member.github_link || ""}
            onChange={(e) => onChange(index, "github_link", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {isLeader && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`phone-${index}`} className="text-gray-300">Phone Number *</Label>
              <Input
                id={`phone-${index}`}
                placeholder="Your contact number"
                value={member.phone || ""}
                onChange={(e) => onChange(index, "phone", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`discord-${index}`} className="text-gray-300">Discord (Optional)</Label>
              <Input
                id={`discord-${index}`}
                placeholder="username#1234"
                value={member.discord || ""}
                onChange={(e) => onChange(index, "discord", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </>
        )}
      </div>

      {/* Skills Section */}
      <div className="space-y-3">
        <Label className="text-gray-300">Skills</Label>
        
        {/* Add Skill Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSkillAdd(skillInput);
              }
            }}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleSkillAdd(skillInput)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Common Skills */}
        <div className="flex flex-wrap gap-2">
          {COMMON_SKILLS.filter(skill => !member.skills?.includes(skill)).slice(0, 8).map((skill) => (
            <Button
              key={skill}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSkillAdd(skill)}
              className="text-xs bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              + {skill}
            </Button>
          ))}
        </div>

        {/* Selected Skills */}
        <div className="flex flex-wrap gap-2">
          {member.skills?.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-blue-600/20 text-blue-300 border-blue-500/30 pr-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className="ml-1 hover:bg-red-500/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}