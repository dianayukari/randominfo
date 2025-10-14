<script>
import { onMount } from 'svelte';
import { browser, dev } from '$app/environment';

let participants = [
    { name: 'Arnar', id: 0, keywords: '' },
    { name: 'Cassandra', id: 1, keywords: '' },
    { name: 'Costanza', id: 2, keywords: '' },
    { name: 'Diana', id: 3, keywords: '' },
    { name: 'Haotong', id: 4, keywords: '' },
    { name: 'Kosara', id: 5, keywords: '' },
    { name: 'Li', id: 6, keywords: '' },
    { name: 'Luca M', id: 7, keywords: '' },
    { name: 'Luca W', id: 8, keywords: '' },
    { name: 'Lucas G', id: 9, keywords: '' },
    { name: 'Martina', id: 10, keywords: '' },
    { name: 'Matteo', id: 11, keywords: '' },
    { name: 'Samuel', id: 12, keywords: '' },
    { name: 'Sergio', id: 13, keywords: '' },
    { name: 'Zhiyi', id: 14, keywords: '' }
];

let isGenerating = false;
let allFieldsFilled = false;
let presentationOrder = [];
let groups = [];
let isRandomized = false;
let selectedParticipantId = 0;
let errorMessage = '';
let isLoading = true;
let isSaving = false;

const API_BASE_URL = dev 
    ? 'http://localhost:3000' 
    : 'https://randominfo.vercel.app';

$: allFieldsFilled = participants.every( p => p.keywords.trim() !== '' );

$: selectedParticipant = participants.find( p => p.id === selectedParticipantId ) || participants[0];

onMount(async () => {
   await loadData();
   isLoading = false;
})

async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        if (response.ok) {
            const data = await response.json();
            participants = data.participants || participants;
            selectedParticipantId = data.selectedParticipantId ?? 0;
            isRandomized = data.isRandomized || false;
            presentationOrder = data.presentationOrder || [];
            groups = data.groups || [];
        }
    }   catch (error) {
        console.error('Error loading data:', error);
    }
}

  async function saveData() {
    if (isSaving) return;
    
    isSaving = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            participants,
            selectedParticipantId,
            isRandomized,
            presentationOrder,
            groups
            })
        });
      
        if (!response.ok) {
        console.error('Failed to save data');
        }

    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        isSaving = false;
    }
  }


function updateKeywords(event) {
    
    const updatedParticipants = participants.map( p => 
        p.id === selectedParticipant.id 
        ? { ...p, keywords: event.target.value } : p
    );
    
    participants = updatedParticipants;
}

async function clearAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'DELETE'
        });

        if (response.ok) {
            participants = participants.map( p => ({ ...p, keywords: '' }) );
            isRandomized = false;
            presentationOrder = [];
            groups = [];
            selectedParticipantId = 0;
        } else {
            console.error('Failed to clear data');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

async function generateRandomOrder() {
    if (!allFieldsFilled || isRandomized) return;

    isGenerating = true;

    try {
        console.log(`Calling API at ${API_BASE_URL}`);

        const validParticipants = participants
            .filter( p => p.keywords.trim() !== '' )
            .map( p => ({ name: p.name, keywords: p.keywords.trim()
        }));

        const response = await fetch(`${API_BASE_URL}/api/group-topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                        'Accept': 'application/json'
             },
            body: JSON.stringify({ participants: validParticipants })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if(!data.groups || !Array.isArray(data.groups)) {
            throw new Error('Invalid response format from server');
        }

        console.log('Received data:', data);

        const shuffleGroups = shuffleArray([...data.groups]);
        const finalOrder = []

        shuffleGroups.forEach( group => {
            const shuffledGroupMembers = shuffleArray([...group.members]);
            shuffledGroupMembers.forEach(member => {
                finalOrder.push({
                    ...member,
                    theme: group.theme
                });
            });
        });

        presentationOrder = finalOrder;
        groups = shuffleGroups;
        isRandomized = true;
        
        await saveData();
    
    } catch (error) {
        console.error('Error generating order:', error);
        errorMessage = `Failed to generate order: ${error.message}`;

        if (error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to the API server. Please check if the server is running.';
        }else if (error.message.includes('quota')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        }else if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your configuration.';
        }
} finally {
        isGenerating = false;
    }
}


function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

$: completedCount = participants.filter( p => p.keywords.trim() !== '').length;

$: groupedParticipants = presentationOrder.reduce((acc, participant, index) => {
    const theme = participant.theme;
    if (!acc[theme]) {
        acc[theme] = [];
    }
    acc[theme].push({ ...participant, position: index + 1 });
    return acc;
}, {});


</script>

<div class="container"></div>
    <h1>Presentation randomizer</h1>

{#if isRandomized && presentationOrder.length > 0}
    <!-- Show results screen when presentation order has been generated -->
    <div class='results'>
        <h2>Presentation Order</h2>
        {#if Object.keys(groupedParticipants).length > 0}
            {#each Object.entries(groupedParticipants) as [theme, participants]}
            <div class="theme-group">
                <h3>{theme}</h3>
                {#each participants as participant, index}
                    <div class="participant-item">
                        <div class="participant-info">
                            <div class="participant-name">{participant.name}</div>
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
        {/if}
        
        {#if presentationOrder.length === 0}
            <p>No order generated yet.</p>
        {/if}
        
        <div class="results-actions">
            <button on:click={clearAllData} class="clear-button">
                Clear All Data
            </button>
        </div>
    </div>
{:else}
    <!-- Show input screen only when no results exist -->
    <div class="input-section">
        <h2>Enter information</h2>    
        <p>All 15 participants must fill out their information before generating the order</p>

        <div class="participant-list">
            <div class="select-container">
                <select class="name-input" 
                    bind:value={selectedParticipantId}>
                    {#each participants as p}
                        <option value={p.id}>{p.name}</option>
                    {/each}
                </select>
            </div>

            <div class="keywords-container">
                <textarea 
                    class="keywords-input"
                    value={selectedParticipant.keywords}
                    on:input={updateKeywords}
                    placeholder="Keywords (comma separated)" 
                    rows="6"
                ></textarea>
            </div>
        </div>

        <button on:click={() => {saveData();}}>Save</button>

        <div class="action-section">
            <button 
                class="generate-button" 
                on:click={generateRandomOrder}
                disabled={!allFieldsFilled || isGenerating}
                class:disabled={!allFieldsFilled || isGenerating}
            >
            {#if isGenerating}
                <p>Generating...</p>
            {:else if !allFieldsFilled}
                Waiting for all participants ({participants.filter(p => p.name.trim() && p.keywords.trim()).length}/15)
            {:else}
                Generate Presentation Order
            {/if}
            </button>
        </div>

        <button on:click={clearAllData} class="clear-button">
                Clear All Data
        </button>
        
    </div>
{/if}
