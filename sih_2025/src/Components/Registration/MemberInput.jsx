import React from "react";

export default function MemberInput({
  member,
  index,
  onChange,
  isLeader = false,
  title = "Member",
  onRemove,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-6 mb-5">

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">
          {title} {!isLeader && `${index + 1}`}
        </h2>

        {!isLeader && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            value={member.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Enter Name"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Year
          </label>
          <input
            type="text"
            value={member.year || ""}
            onChange={(e) => onChange(index, "year", e.target.value)}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="3rd Year"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Branch
          </label>
          <input
            type="text"
            value={member.branch || ""}
            onChange={(e) => onChange(index, "branch", e.target.value)}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Computer Science"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-slate-700">
            GitHub Link
          </label>
          <input
            type="text"
            value={member.github_link || ""}
            onChange={(e) => onChange(index, "github_link", e.target.value)}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Phone Number
          </label>
          <input
            type="text"
            value={member.phone || ""}
            onChange={(e) => onChange(index, "phone", e.target.value)}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="9876543210"
          />
        </div>

        {isLeader && (
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Discord
            </label>
            <input
              type="text"
              value={member.discord || ""}
              onChange={(e) => onChange(index, "discord", e.target.value)}
              className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="username#1234"
            />
          </div>
        )}

      </div>

    </div>
  );
}