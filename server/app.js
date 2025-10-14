const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    });

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://dianayukari.github.io/randominfo'
        : ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.json({ message: 'API is running',
        version: '1.0.0',
        status: 'healthy' 
    });
});

app.post('/api/group-topics', async (req, res) => {
    try {
        console.log('received request to group topics');
        const { participants } = req.body;

        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({ error: 'Invalid participants data',
                message: 'Participants should be a non-empty array'    
            });
        }

        if (participants.length === 0) {
            return res.status(400).json({ error: 'Participants list is empty',
                message: 'Participants should be a non-empty array'
            });
        }

        const validParticipants = participants.filter(
            p => p.name && p.name.trim() && p.keywords && p.keywords.trim()
        );

        if (validParticipants.length === 0) {
            return res.status(400).json({
                error: 'No valid participants with keywords provided',
                message: 'Each participant must have a name and keywords'
            });
        }

    console.log(`Processing ${validParticipants.length} participants`);

    const prompt = `
    You are an expert in grouping thesis presentations by similar topics. Here are ${validParticipants.length} participants with their names and thesis keywords:

    ${validParticipants.map((p, i) => `${i + 1}. ${p.name}: ${p.keywords}`).join('\n')}

    Please group these participants by similar thesis topics/themes. Create 4 groups where participants with related research areas are together. 3 groups should have 4 participants, 1 group should have 3 participants.
    Return your response as a JSON object with this exact structure:
    {
    "groups": [
        {
        "theme": "Theme name describing the research area",
        "members": [
            {"name": "Participant Name", "keywords": "their keywords"},
            {"name": "Participant Name", "keywords": "their keywords"}
        ]
        }
    ]
    }

    Important rules:
    - Focus on grouping by research domain, methodology, or subject matter
    - Include ALL ${validParticipants.length} participants across the groups
    - Each participant should appear in exactly one group
    - Group names should be descriptive of the research themes
    - Return valid JSON only, no additional text`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: "You are an academic advisor helping to organize thesis presentations by grouping similar research topics together. You must return valid JSON only."
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.3,
        max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('OpenAI response received');

    let groupData;
    try {
        groupData = JSON.parse(responseText);
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        console.error('Response text:', responseText);
        return res.status(500).json({ 
            error: 'Failed to parse response from OpenAI',
            message: 'Failed to parse grouping results.'});
    }

    if (!groupData.groups || !Array.isArray(groupData.groups)) {
        return res.status(500).json({ 
            error: 'Invalid group data structure from OpenAI',
            message: 'Grouping results are in an unexpected format.' });
    }

    console.log(`Successfully grouped into ${groupData.groups.length} groups`);
    res.json(groupData);

    } catch (error) {
        console.error('Error with OpenAI API:', error);
        if (error.code === 'insufficient_quota') {
            return res.status(402).json({ 
                error: 'OpenAI API quota exceeded',
                message: 'The server has exceeded its OpenAI API quota. Please try again later.' 
            });
        }

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ 
                error: 'Invalid OpenAI API key',
                message: 'The server is misconfigured. Please contact the administrator.' 
            });
        }

        res.status(500).json({
            error: 'Failed to group topics',
            message: 'Internal server error'
        });
    }
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(port, () => {
  console.log(`Thesis randomizer API listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

    
