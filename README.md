# AI Meeting Insight Generator

The **AI Meeting Insight Generator** (ScribeAI) is a high-performance web application designed to transform raw meeting transcripts into structured, actionable insights. By leveraging the power of **Google Gemini AI**, it automatically extracts summaries, tasks, owners, deadlines, and project priorities, helping teams stay organized and focused.

---

## 🚀 Overview

Recording meetings is easy; finding the action items is hard. This application streamlines that process by analyzing your messy transcripts and instantly generating:
- **Concise Summaries**: 3-5 bullet points covering the core of the discussion.
- **Actionable Tasks**: Clearly extracted items that require follow-up.
- **Owner Identification**: Automatically assigns responsibility to the right team member.
- **Deadline Tracking**: Detects mentioned dates and applies them to specific tasks.
- **Priority Detection**: Intelligent scoring (High, Medium, Low) based on urgency and importance.

---

## ✨ Features

- 🧠 **AI-Powered Analysis**: Uses Gemini 1.5 Flash for rapid and accurate transcript processing.
- ✅ **Interactive Checklist UI**: View action items in a modern, easy-to-read checklist format.
- 🎨 **Premium Glassmorphism Design**: A sleek, dark-themed UI that feels modern and professional.
- 🏷️ **Priority Badging**: Color-coded badges (Red, Orange, Green) for instant visual triage.
- 📥 **Export to Markdown**: Download your structured insights as a formatted `.md` file for documentation or project management tools.
- 📱 **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Styling**: Modern CSS with Glassmorphism and specialized animations
- **Icons**: Font Awesome 6.4
- **AI Engine**: [Google Gemini API](https://aistudio.google.com/)
- **Server**: Static file serving (e.g., `serve`, `live-server`)

---

## 📥 Installation

Follow these steps to get the project running locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/meeting-insight-generator.git
   cd meeting-insight-generator
   ```

2. **Install Dependencies** (Optional)
   If you're using a specific Node.js server like `serve`:
   ```bash
   npm install
   ```

3. **Configure the AI API Key**
   - Head to [Google AI Studio](https://aistudio.google.com/) and create a free API key.
   - Open `main.js` and replace the placeholder with your key:
     ```javascript
     const CONFIG = {
         API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
         MODEL: 'gemini-1.5-flash'
     };
     ```

4. **Run the Development Server**
   ```bash
   npx serve .
   ```
   The app will typically be available at `http://localhost:3000`.

---

## 📖 Usage

1. **Paste your transcript**: Copy-paste your meeting recording's text (e.g., from Zoom, Teams, or Otter.ai) into the large textarea.
2. **Generate Insights**: Click the **"Generate Insights"** button and wait for the AI to process the content.
3. **Review**: The four cards below will populate with your summary, prioritized action items, and task owners.
4. **Export**: Use the **"Export to Markdown"** button at the bottom to download a formatted file for your records.

---

## 📊 Example Output

### Meeting Summary
* The team discussed the upcoming Q4 product launch and marketing strategy.
* Key decisions were made regarding the budget allocation for digital ads.
* The timeline for the final beta release was shifted to ensure stability.

### Action Items
| Task | Owner | Deadline | Priority |
| :--- | :--- | :--- | :--- |
| Finalize digital ad budget | Sarah | Friday COB | High |
| Conduct final security audit | David | October 15th | Medium |
| Update internal documentation | Mark | Monday | Low |

---

## 🔮 Future Improvements

- 📒 **Notion Integration**: Directly sync action items to your Notion database.
- 💬 **Slack Task Notifications**: Send triggered alerts to project channels.
- 📅 **Calendar Deadline Sync**: Automatically add detected deadlines to Google or Outlook calendars.
- 🕰️ **Multi-meeting History**: A local database to track and search past meeting insights.

---

*Built with ❤️ for productive teams.*
