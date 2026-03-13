// API endpoint configuration
const API_ENDPOINT = '/api/analyze';

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

        // Local validation remains same (no transcript check)

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
     * Calls the local serverless API to process the transcript
     */
    async function analyzeMeetingTranscript(transcript) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transcript })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
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
