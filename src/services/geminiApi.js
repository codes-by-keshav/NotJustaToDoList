// Gemini AI API service for fetching motivational quotes

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.baseURL = GEMINI_API_ENDPOINT
    this.requestHistory = []
    this.maxRequestsPerMinute = 60 // Increased limit
    this.isQuotaExhausted = false
    this.quotaResetTime = null
  }

  // Check if we have a valid API key
  isConfigured() {
    return !!this.apiKey
  }

  // Simple rate limiting
  canMakeRequest() {
    const now = Date.now()
    
    // If quota is exhausted, check if reset time has passed
    if (this.isQuotaExhausted && this.quotaResetTime) {
      if (now < this.quotaResetTime) {
        console.log('API quota exhausted, waiting for reset...')
        return false
      } else {
        // Reset quota status
        this.isQuotaExhausted = false
        this.quotaResetTime = null
        this.requestHistory = []
        console.log('Quota status reset, API calls enabled again')
      }
    }

    // Clean old requests from history (older than 1 minute)
    const oneMinuteAgo = now - 60000
    this.requestHistory = this.requestHistory.filter(time => time > oneMinuteAgo)

    // Check if we're under the rate limit
    if (this.requestHistory.length >= this.maxRequestsPerMinute) {
      console.log(`Rate limit reached (${this.requestHistory.length}/${this.maxRequestsPerMinute} requests in last minute)`)
      return false
    }

    return true
  }

  // Make API request to Gemini - NO CACHING
  async makeRequest(prompt) {
    if (!this.isConfigured()) {
      console.warn('Gemini API key not configured')
      throw new Error('Gemini API key not configured')
    }

    // Check rate limit
    if (!this.canMakeRequest()) {
      throw new Error('Rate limit exceeded - please wait a moment')
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 1.0, // Maximum creativity
        topK: 1,
        topP: 1,
        maxOutputTokens: 80,
        stopSequences: []
      }
    }

    try {
      // Record request time
      this.requestHistory.push(Date.now())
      
      console.log(`Making fresh API request (${this.requestHistory.length}/${this.maxRequestsPerMinute} in last minute)`)
      
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Gemini API error:', response.status, errorData)
        
        // Handle quota exhaustion
        if (response.status === 429) {
          this.isQuotaExhausted = true
          this.quotaResetTime = Date.now() + (5 * 60 * 1000) // 5 minutes
          console.error('API quota exhausted. Disabling API calls for 5 minutes.')
        }
        
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid response structure:', data)
        throw new Error('Invalid response from Gemini API')
      }

      const result = data.candidates[0].content.parts[0].text.trim()
      console.log('✅ Fresh API response:', result)
      
      return result
    } catch (error) {
      console.error('Gemini API request failed:', error)
      throw error
    }
  }

  // Get general motivational quote - NO FALLBACKS
  async getMotivationalQuote() {
    const hour = new Date().getHours()
    const randomSeed = Math.floor(Math.random() * 10000)
    const timeContext = hour < 12 ? 'morning energy' : hour < 17 ? 'afternoon focus' : 'evening determination'
    
    const prompt = `Generate a powerful motivational quote that obliterates procrastination, wasted time, and compulsive urges like masturbation, using sharp, commanding language that sparks relentless discipline and immediate action, but keep capitalization normal - no all‑caps or shouting, just standard sentence case. Output only the quote itself in plain text with no extra characters or formatting.`
    
    return await this.makeRequest(prompt)
  }

  // Get task-specific motivational quote - NO FALLBACKS
  async getTaskMotivationalQuote(taskTitle) {
   
    const prompt = `Generate a powerful motivational quote that obliterates procrastination, wasted time, and compulsive urges like masturbation, using sharp, commanding language that sparks relentless discipline and immediate action, but keep capitalization normal - no all‑caps or shouting, just standard sentence case. Output only the quote itself in plain text with no extra characters or formatting.`
    
    return await this.makeRequest(prompt)
  }

  // Get notification quote - NO FALLBACKS
  async getNotificationQuote() {
    
    const prompt = `Generate a powerful motivational quote that obliterates procrastination, wasted time, and compulsive urges like masturbation, using sharp, commanding language that sparks relentless discipline and immediate action, but keep capitalization normal - no all‑caps or shouting, just standard sentence case. Output only the quote itself in plain text with no extra characters or formatting.`
    
    return await this.makeRequest(prompt)
  }

  // Get time of day for context
  getTimeOfDay() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  // Reset quota status (for manual reset)
  resetQuotaStatus() {
    this.isQuotaExhausted = false
    this.quotaResetTime = null
    this.requestHistory = []
    console.log('Quota status manually reset')
  }

  // Get current status for debugging
  getStatus() {
    return {
      isConfigured: this.isConfigured(),
      requestsInLastMinute: this.requestHistory.length,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      isQuotaExhausted: this.isQuotaExhausted,
      quotaResetTime: this.quotaResetTime ? new Date(this.quotaResetTime).toLocaleTimeString() : null
    }
  }
}

// Create singleton instance
const geminiService = new GeminiService()

// Export individual functions for convenience
export const getMotivationalQuote = () => geminiService.getMotivationalQuote()
export const getTaskMotivationalQuote = (taskTitle) => geminiService.getTaskMotivationalQuote(taskTitle)
export const getNotificationQuote = () => geminiService.getNotificationQuote()

// Export service for debugging
export { geminiService }

// Set as default export
export default geminiService