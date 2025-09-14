import XLSX from 'xlsx';
import fs from 'fs';

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return [];
    }
}

function formatTeamData(teams) {
    const rows = [];
    
    teams.forEach((team, teamIndex) => {
        // Team header row
        rows.push({
            'S.No': teamIndex + 1,
            'Team Name': team.teamName,
            'Problem Statement': team.problemStatement || 'Not specified',
            'Registration Date': new Date(team.registeredAt).toLocaleDateString('en-IN'),
            'Total Members': team.members.length + 1,
            'Role': '',
            'Name': '',
            'Year': '',
            'Branch': '',
            'Contact': '',
            'Instagram': '',
            'GitHub': '',
            'Discord': '',
            'Skills': ''
        });
        
        // Team Leader row
        rows.push({
            'S.No': '',
            'Team Name': '',
            'Problem Statement': '',
            'Registration Date': '',
            'Total Members': '',
            'Role': 'Team Leader',
            'Name': team.leader.name,
            'Year': team.leader.year,
            'Branch': team.leader.branch,
            'Contact': team.leader.contactNumber,
            'Instagram': '',
            'GitHub': team.leader.githubLink || '',
            'Discord': team.leaderContact.discord || '',
            'Skills': ''
        });
        
        // Team Members rows
        team.members.forEach((member, memberIndex) => {
            rows.push({
                'S.No': '',
                'Team Name': '',
                'Problem Statement': '',
                'Registration Date': '',
                'Total Members': '',
                'Role': `Member ${memberIndex + 1}`,
                'Name': member.name,
                'Year': member.year,
                'Branch': member.branch,
                'Contact': member.contactNumber,
                'Instagram': member.instagram || '',
                'GitHub': member.githubLink || '',
                'Discord': '',
                'Skills': Array.isArray(member.skills) ? member.skills.join(', ') : (member.otherSkills || '')
            });
        });
        
        // Add spacing rows between teams
        rows.push({
            'S.No': '',
            'Team Name': '',
            'Problem Statement': '',
            'Registration Date': '',
            'Total Members': '',
            'Role': '',
            'Name': '',
            'Year': '',
            'Branch': '',
            'Contact': '',
            'Instagram': '',
            'GitHub': '',
            'Discord': '',
            'Skills': ''
        });
        
        rows.push({
            'S.No': '',
            'Team Name': '',
            'Problem Statement': '',
            'Registration Date': '',
            'Total Members': '',
            'Role': '',
            'Name': '',
            'Year': '',
            'Branch': '',
            'Contact': '',
            'Instagram': '',
            'GitHub': '',
            'Discord': '',
            'Skills': ''
        });
    });
    
    return rows;
}

function formatIndividualData(individuals) {
    return individuals.map((individual, index) => ({
        'S.No': index + 1,
        'Name': individual.name,
        'Year': individual.year,
        'Branch': individual.branch,
        'Contact Number': individual.contactNumber,
        'Instagram': individual.instagram,
        'GitHub': individual.github || '',
        'Discord': individual.discord || '',
        'Skills': Array.isArray(individual.skills) ? individual.skills.join(', ') : '',
        'Other Skills': individual.otherSkills || '',
        'Has Deployed Project': individual.hasDeployed ? 'Yes' : 'No',
        'Product Link': individual.productLink || '',
        'Registration Date': new Date(individual.registeredAt).toLocaleDateString('en-IN')
    }));
}

async function exportToExcel() {
    console.log('🔄 Fetching data from API...');
    
    // Fetch data from your local API
    const teams = await fetchData('http://localhost:8000/api/teams');
    const individuals = await fetchData('http://localhost:8000/api/individuals');
    
    if (teams.length === 0 && individuals.length === 0) {
        console.error('❌ No data found. Make sure your backend server is running on port 8000');
        return;
    }
    
    console.log(`📊 Found ${teams.length} teams and ${individuals.length} individuals`);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Process teams data
    if (teams.length > 0) {
        console.log('📝 Processing teams data...');
        const formattedTeams = formatTeamData(teams);
        const teamsWorksheet = XLSX.utils.json_to_sheet(formattedTeams);
        
        // Set column widths for better readability
        const teamCols = [
            {wch: 5},   // S.No
            {wch: 25},  // Team Name
            {wch: 45},  // Problem Statement
            {wch: 12},  // Registration Date
            {wch: 8},   // Total Members
            {wch: 12},  // Role
            {wch: 20},  // Name
            {wch: 8},   // Year
            {wch: 15},  // Branch
            {wch: 12},  // Contact
            {wch: 15},  // Instagram
            {wch: 25},  // GitHub
            {wch: 15},  // Discord
            {wch: 25}   // Skills
        ];
        
        teamsWorksheet['!cols'] = teamCols;
        XLSX.utils.book_append_sheet(workbook, teamsWorksheet, 'Teams');
    }
    
    // Process individuals data
    if (individuals.length > 0) {
        console.log('📝 Processing individuals data...');
        const formattedIndividuals = formatIndividualData(individuals);
        const individualsWorksheet = XLSX.utils.json_to_sheet(formattedIndividuals);
        
        // Set column widths for individuals sheet
        const individualCols = [
            {wch: 5},   // S.No
            {wch: 20},  // Name
            {wch: 8},   // Year
            {wch: 15},  // Branch
            {wch: 12},  // Contact Number
            {wch: 15},  // Instagram
            {wch: 25},  // GitHub
            {wch: 15},  // Discord
            {wch: 30},  // Skills
            {wch: 20},  // Other Skills
            {wch: 12},  // Has Deployed
            {wch: 30},  // Product Link
            {wch: 12}   // Registration Date
        ];
        
        individualsWorksheet['!cols'] = individualCols;
        XLSX.utils.book_append_sheet(workbook, individualsWorksheet, 'Individuals');
    }
    
    // Create summary sheet
    const summary = [
        { 'Category': 'Total Teams', 'Count': teams.length },
        { 'Category': 'Total Individuals', 'Count': individuals.length },
        { 'Category': 'Total Team Members', 'Count': teams.reduce((sum, team) => sum + team.members.length, 0) },
        { 'Category': 'Total Team Leaders', 'Count': teams.length },
        { 'Category': 'Grand Total Participants', 'Count': individuals.length + teams.reduce((sum, team) => sum + team.members.length + 1, 0) },
        { 'Category': 'Export Date', 'Count': new Date().toLocaleString() }
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
    const filename = `SIH_2025_Registration_Data_${timestamp}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, filename);
    
    console.log(`✅ Excel file created: ${filename}`);
    console.log(`📁 Location: ${process.cwd()}\\${filename}`);
    console.log(`\n📊 Summary:`);
    console.log(`   • Teams: ${teams.length}`);
    console.log(`   • Individual Registrations: ${individuals.length}`);
    console.log(`   • Total Team Members: ${teams.reduce((sum, team) => sum + team.members.length, 0)}`);
    console.log(`   • Grand Total Participants: ${individuals.length + teams.reduce((sum, team) => sum + team.members.length + 1, 0)}`);
}

// Run the export
exportToExcel().catch(console.error);
