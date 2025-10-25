const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  },

  // Get current emotion analytics
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/api/analytics`);
    return response.json();
  },

  // Get random joke
  async getJoke() {
    const response = await fetch(`${API_BASE_URL}/api/joke`);
    return response.json();
  },

  // Get random fact
  async getFact() {
    const response = await fetch(`${API_BASE_URL}/api/fact`);
    return response.json();
  },

  // Get questionnaire
  async getQuestionnaire(name) {
    const response = await fetch(`${API_BASE_URL}/api/questionnaire/${name}`);
    return response.json();
  },

  // Submit questionnaire
  async submitQuestionnaire(name, answers) {
    const response = await fetch(`${API_BASE_URL}/api/questionnaire/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, answers }),
    });
    return response.json();
  },

  // Reset emotion history
  async resetEmotionHistory() {
    const response = await fetch(`${API_BASE_URL}/api/emotion/reset`, {
      method: 'POST',
    });
    return response.json();
  },

  // Get video feed URL
  getVideoFeedUrl() {
    return `${API_BASE_URL}/api/video_feed`;
  },
};
