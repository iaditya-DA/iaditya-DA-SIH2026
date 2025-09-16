import { Result } from './Models/SIHSCHEMA.js';

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all results or filter by branch
            const { branch } = req.query;
            let filter = {};
            
            if (branch) {
                // Filter for BCA or MCA teams only
                if (branch.toLowerCase() === 'bca' || branch.toLowerCase() === 'mca') {
                    filter.branch = new RegExp(branch, 'i');
                }
            } else {
                // Default: only show BCA and MCA teams
                filter.branch = /^(BCA|MCA)/i;
            }

            const results = await Result.find(filter)
                .sort({ teamNumber: 1 })
                .lean();

            return res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });

        } else if (req.method === 'POST') {
            // Create new result or bulk create
            const { results } = req.body;
            
            if (Array.isArray(results)) {
                // Bulk create results
                const createdResults = await Result.insertMany(results, { ordered: false });
                return res.status(201).json({
                    success: true,
                    data: createdResults,
                    message: `${createdResults.length} results created successfully`
                });
            } else {
                // Single result creation
                const newResult = new Result(req.body);
                const savedResult = await newResult.save();
                return res.status(201).json({
                    success: true,
                    data: savedResult,
                    message: 'Result created successfully'
                });
            }

        } else if (req.method === 'PUT') {
            // Update result by team number
            const { teamNumber } = req.query;
            const updateData = { ...req.body, updatedAt: new Date() };
            
            const updatedResult = await Result.findOneAndUpdate(
                { teamNumber: parseInt(teamNumber) },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedResult) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedResult,
                message: 'Result updated successfully'
            });

        } else if (req.method === 'DELETE') {
            // Delete result by team number
            const { teamNumber } = req.query;
            
            const deletedResult = await Result.findOneAndDelete({ 
                teamNumber: parseInt(teamNumber) 
            });

            if (!deletedResult) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Result deleted successfully'
            });

        } else {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('API Error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Team number already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}