const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Schema for Individual Registrations ---

const IndividualSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    otherSkills: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    instagram: {
        type: String,
        required: true,
        trim: true
    },
    github: {
        type: String,
        trim: true
    },
    discord: {
        type: String,
        trim: true
    },
    hasDeployed: {
        type: Boolean,
        default: false
    },
    productLink: {
        type: String,
        trim: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

// --- Schema for Team Registrations ---

// A sub-schema for team members to keep the main schema clean
const MemberSchema = new Schema({
    name: { type: String, required: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    contactNumber: { type: String, required: true },
    instagram: { type: String, required: true },
    githubLink: { type: String },
    skills: { type: [String], default: [] },
    otherSkills: { type: String }
}, { _id: false }); // _id is not needed for sub-documents in this case

const TeamSchema = new Schema({
    teamName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    problemStatement: {
        type: String,
        trim: true
    },
    leader: {
        name: { type: String, required: true },
        year: { type: String, required: true },
        branch: { type: String, required: true },
        contactNumber: { type: String, required: true },
        githubLink: { type: String },
    },
    // The leader's main phone and discord are stored here for easy access
    leaderContact: {
        phone: { type: String, required: true },
        discord: { type: String }
    },
    members: {
        type: [MemberSchema],
        // You can add validation to ensure a certain number of members if needed
        validate: [
            {
                validator: function(arr) {
                    // This allows for teams with 0 to 5 members listed
                    // Members with empty names are filtered out on the frontend before submission
                    return arr.length <= 5;
                },
                message: 'A team can have a maximum of 5 members.'
            }
        ]
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});


const Individual = mongoose.model('Individual', IndividualSchema);
const Team = mongoose.model('Team', TeamSchema);

module.exports = { Individual, Team };
