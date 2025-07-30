import { generateSuggestedQuestions, optimizePrompt, autoGeneratePrompt } from '@/services/ai'
import { ref } from 'vue'

export const useGenerateSuggestedQuestions = () => {
  const loading = ref(false)
  const suggested_questions = ref<string[]>([])

  const handleGenerateSuggestedQuestions = async (message_id: string) => {
    try {
      loading.value = true
      const resp = await generateSuggestedQuestions(message_id)
      suggested_questions.value = resp.data
    } finally {
      loading.value = false
    }
  }
  return { loading, suggested_questions, handleGenerateSuggestedQuestions }
}

export const useGeneratePrompt = () => {
  const loading = ref(false)
  const prompt = ref<string>('')
  const handleGeneratePrompt = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await autoGeneratePrompt(app_id)
      prompt.value = resp.data
    } finally {
      loading.value = false
    }
  }
  return { loading, prompt, handleGeneratePrompt }
}

export const useOptimizePrompt = () => {
  const loading = ref(false)
  const optimize_prompt = ref('')
  const handleOptimizePrompt = async (prompt: string) => {
    try {
      loading.value = true
      optimize_prompt.value = ''
      await optimizePrompt(prompt, (event_response) => {
        const data = event_response.data
        optimize_prompt.value += data?.optimize_prompt
      })
    } finally {
      loading.value = false
    }
  }
  return { loading, optimize_prompt, handleOptimizePrompt }
}
