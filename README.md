# SoftingyPulse LM - Clinical Health Workspace

SoftingyPulse is an advanced clinical workspace powered by the **Google Gemini API**, designed specifically for analyzing and conversing about healthcare documents (e.g., blood reports, doctor notes, metabolic panels). It was built as a submission for the **GeeksforGeeks X Google Gemini Hackathon**.

## 🌟 Key Features

*   **Clinical Conversational AI**: A strictly agentic and grounded AI chat that *only* answers based on the active documents you select. It prevents medical hallucinations by citing its sources and refusing to answer queries outside the provided medical context.
*   **Workspace Bento Analytics**: A sleek dashboard that automatically extracts a clinical summary and parses critical lab values (e.g., LDL Cholesterol, TSH, Fasting Glucose) into a clean, easy-to-read UI widget.
*   **Interactive Audio Podcast Briefing**: Generates an interactive podcast-style briefing summarizing the patient's selected records, turning dense medical data into an easily digestible format.
*   **Document Management**: Upload `.txt` or `.md` files or paste text directly to add custom health documents to your workspace. Select multiple documents to serve as the active context for the AI.
*   **Local Privacy**: Your API key is stored securely in your browser's local storage and is only sent directly to Google's Gemini servers. No intermediate servers store your data.
*   **Health-Themed UI**: A highly responsive, glassmorphism-inspired UI with beautiful CSS animations (ECG pulse lines, floating orbs, DNA dot grids) that works seamlessly across desktop, tablet, and mobile.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/softingypulse.git
    cd softingypulse
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173` in your browser.

## 📖 How to Use SoftingyPulse

1.  **Set Your API Key 🔑**:
    Click the Settings (gear/key) icon in the sidebar and paste your Google Gemini API key.
2.  **Manage Health Documents 📄**:
    Use the **+ Add Health Document** button to upload or paste medical reports. Use the checkboxes to select which documents the AI should use as its context.
3.  **Sync Insights & Podcast 🎧**:
    In the Workspace Bento Analytics section, click **Sync Insights**. The AI will process the active documents, extract key biological indicators, write a clinical summary, and generate a podcast briefing.
4.  **Chat with the AI 💬**:
    Ask questions in the right panel. Use preset prompts like "Explain abnormals" or "Diet suggestions". The AI will format its responses with Markdown and cite the specific documents it used to answer your question.

## 🛠️ Technology Stack

*   **Frontend Framework**: React 19 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Vanilla CSS with modern Glassmorphism and CSS Keyframe Animations
*   **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
*   **Markdown Parsing**: `react-markdown` & `remark-gfm`
*   **Icons**: Lucide React

## ⚠️ Disclaimer

SoftingyPulse is an educational tool built for a hackathon. **It is not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

---
*Built with ❤️ for the GeeksforGeeks x Google Hackathon by Softingy.*
