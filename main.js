// Configuration - Get your API key from https://aistudio.google.com/
const CONFIG = {
    API_KEY: 'AIzaSyCcG7TrZ7NauMH6zJZAh8IauMXJIFaJTgY',
    MODEL: 'gemini-1.5-flash-8b'
};

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnIcon = generateBtn.querySelector('i');
    const loader = document.getElementById('btn-loader');
    const transcriptInput = document.getElementById('transcript-input');
    const exportBtn = document.getElementById('export-btn');

    // State to store current result for export
    let currentResult = null;

    // Card content containers
    const summaryContainer = document.querySelector('#card-summary .card-content');
    const actionItemsContainer = document.querySelector('#card-action-items .card-content');
    const ownersContainer = document.querySelector('#card-owners .card-content');
    const deadlinesContainer = document.querySelector('#card-deadlines .card-content');

    generateBtn.addEventListener('click', async () => {
        const transcript = transcriptInput.value.trim();

        if (!transcript) {
            alert('Please paste a meeting transcript first.');
            return;
        }

        if (!CONFIG.API_KEY || CONFIG.API_KEY.includes('PASTE_YOUR_GEMINI')) {
            alert('Please add your Google Gemini API key in main.js to use the AI features.');
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            // Call Real AI API (Gemini)
            const result = await analyzeMeetingTranscript(transcript);
            currentResult = result;

            // Populate UI with results
            populateResults(result);

            // Enable export button
            exportBtn.disabled = false;

            // Visual success feedback
            document.querySelectorAll('.result-card').forEach(card => {
                card.style.borderColor = 'var(--accent-primary)';
                setTimeout(() => {
                    card.style.borderColor = 'var(--border-color)';
                }, 1000);
            });
        } catch (error) {
            console.error('AI Processing Error:', error);
            currentResult = null;
            exportBtn.disabled = true;
            handleError(error);
        } finally {
            setLoading(false);
        }
    });

    /**
     * Export to Markdown Logic
     */
    exportBtn.addEventListener('click', () => {
        if (!currentResult) return;

        const markdown = generateMarkdown(currentResult);
        downloadBlob(markdown, 'meeting-notes.md', 'text/markdown');
    });

    /**
     * Generates markdown string from the result data
     */
    function generateMarkdown(data) {
        let md = `# Meeting Summary\n\n`;
        data.summary.forEach(point => {
            md += `* ${point}\n`;
        });

        md += `\n# Action Items\n\n`;
        md += `| Task | Owner | Deadline | Priority |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;

        data.action_items.forEach(item => {
            md += `| ${item.task} | ${item.owner} | ${item.deadline} | ${item.priority} |\n`;
        });

        return md;
    }

    /**
     * Browser download helper
     */
    function downloadBlob(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Real AI API Call using Google Gemini
     */
    async function analyzeMeetingTranscript(transcript) {
        const URL = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${CONFIG.API_KEY}`;

        const systemPrompt = "You are an AI meeting assistant. Extract structured information from meeting transcripts.";

        const userPrompt = `
Extract meeting insights from the following transcript:

"${transcript}"

Requirements:
1. Return a valid JSON object.
2. The summary must contain 3-5 concise bullet points.
3. Extract clear action items/tasks.
4. Identify owners and deadlines for each task.
5. Assign a priority to each task based on these rules:
   - High: Urgent tasks or deadlines within a few days.
   - Medium: Important but not urgent.
   - Low: Optional or long-term tasks.
6. If owner or deadline is missing, return "Not specified".

JSON Format:
{
  "summary": ["point1", "point2", "point3"],
  "action_items": [
    {
      "task": "item description",
      "owner": "name or 'Not specified'",
      "deadline": "date or 'Not specified'",
      "priority": "High | Medium | Low"
    }
  ]
}
`;

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();

        try {
            const rawText = data.candidates[0].content.parts[0].text;
            return JSON.parse(rawText);
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            throw new Error("The AI returned an invalid response format. Please try again.");
        }
    }

    /**
     * Populates the UI cards with the processed data
     */
    function populateResults(data) {
        // 1. Summary Card
        const summaryHtml = `
            <ul class="result-list">
                ${data.summary.map(point => `<li>${point}</li>`).join('')}
            </ul>
        `;
        renderCard(summaryContainer, summaryHtml);

        // 2. Action Items Card (Checklist Style)
        const actionItemsHtml = `
            <div class="action-checklist">
                ${data.action_items.map(item => `
                    <div class="checklist-item">
                        <div class="item-main">
                            <i class="fa-regular fa-square"></i>
                            <span class="item-task">${item.task}</span>
                        </div>
                        <div class="item-meta">
                            <span class="meta-label">Owner:</span> ${item.owner} | 
                            <span class="meta-label">Deadline:</span> ${item.deadline} |
                            <span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        renderCard(actionItemsContainer, actionItemsHtml);

        // 3. Owners Card
        const ownersHtml = `
            <ul class="result-list">
                ${data.action_items.map(item => `
                    <li>
                        <span class="item-owner">${item.owner}</span>: 
                        <span class="item-context">${item.task}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        renderCard(ownersContainer, ownersHtml);

        // 4. Deadlines Card
        const deadlinesHtml = `
            <ul class="result-list">
                ${data.action_items.map(item => `
                    <li>
                        <span class="item-deadline">${item.deadline}</span>: 
                        <span class="item-context">${item.task}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        renderCard(deadlinesContainer, deadlinesHtml);
    }

    /**
     * Helper to render content and remove empty state
     */
    function renderCard(container, html) {
        container.classList.remove('empty');
        container.innerHTML = html;
        container.style.animation = 'fadeInUp 0.5s ease-out forwards';
    }

    /**
     * Shows a friendly error message in the UI
     */
    function handleError(error) {
        const errorHtml = `
            <div class="error-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p><strong>Processing Failed</strong></p>
                <p>${error.message}</p>
            </div>
        `;

        [summaryContainer, actionItemsContainer, ownersContainer, deadlinesContainer].forEach(container => {
            container.innerHTML = errorHtml;
            container.classList.add('empty');
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.textContent = 'AI is thinking...';
            btnIcon.style.display = 'none';
            loader.style.display = 'block';
        } else {
            generateBtn.disabled = false;
            btnText.textContent = 'Generate Insights';
            btnIcon.style.display = 'block';
            loader.style.display = 'none';
        }
    }
});
