import mongoose from 'mongoose';
const { Schema } = mongoose;

// --- Schema for Individual Registrations ---
const IndividualSchema = new Schema({
    name: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    skills: { type: [String], default: [] },
    otherSkills: { type: String, trim: true },
    contactNumber: { type: String, required: true },
    instagram: { type: String, required: true, trim: true },
    github: { type: String, trim: true },
    discord: { type: String, trim: true },
    hasDeployed: { type: Boolean, default: false },
    productLink: { type: String, trim: true },
    registeredAt: { type: Date, default: Date.now }
});

// --- Sub-schema for Team Members ---
const MemberSchema = new Schema({
    name: { type: String, required: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    contactNumber: { type: String, required: true },
    instagram: { type: String, required: true },
    githubLink: { type: String },
    skills: { type: [String], default: [] },
    otherSkills: { type: String }
}, { _id: false });

// --- Schema for Team Registrations ---
const TeamSchema = new Schema({
    teamName: { type: String, required: true, unique: true, trim: true },
    problemStatement: { type: String, trim: true },
    leader: {
        name: { type: String, required: true },
        year: { type: String, required: true },
        branch: { type: String, required: true },
        contactNumber: { type: String, required: true },
        githubLink: { type: String }
    },
    leaderContact: {
        phone: { type: String, required: true },
        discord: { type: String }
    },
    members: {
        type: [MemberSchema],
        validate: [
            {
                validator: function(arr) {
                    return arr.length <= 5;
                },
                message: 'A team can have a maximum of 5 members.'
            }
        ]
    },
    registeredAt: { type: Date, default: Date.now }
});

// Fix for Vercel Serverless (avoid OverwriteModelError)
export const Individual = mongoose.models.Individual || mongoose.model('Individual', IndividualSchema);
export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
