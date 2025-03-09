import { ref } from 'vue'
import { audioToText, messageToAudio } from '@/services/audio'
import { Message } from '@arco-design/web-vue'

export const useAudioToText = () => {
  const loading = ref(false)
  const text = ref('')

  const handleAudioToText = async (file: Blob) => {
    try {
      loading.value = true
      const resp = await audioToText(file)
      Message.success('语音转文本成功')
      text.value = resp.data.text
    } finally {
      loading.value = false
    }
  }

  return { loading, text, handleAudioToText }
}

export const useMessageToAudio = () => {
  const loading = ref(false)

  const handleMessageToAudio = async (
    message_id: string,
    onData: (event_response: Record<string, any>) => void,
  ) => {
    try {
      loading.value = true
      await messageToAudio(message_id, onData)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleMessageToAudio }
}

export const useAudioPlayer = () => {
  const audioContext = ref<AudioContext>() // 音频上下文
  const mediaSource = ref<MediaSource>() // 媒体资源
  const audioElement = ref<HTMLAudioElement>() // HTML音频元素
  const sourceBuffer = ref<SourceBuffer>() // 资源缓冲
  const isAudioLoaded = ref(false) // 是否加载音频完毕
  const isPlaying = ref(false) // 是否正在播放
  const { loading: textToAudioLoading, handleMessageToAudio } = useMessageToAudio() // 使用消息转音频hook

  // 定义资源打开监听事件
  const onSourceOpen = () => {
    sourceBuffer.value = mediaSource.value?.addSourceBuffer('audio/mpeg')
  }

  // 定义添加数据源缓冲处理器
  const appendSourceBuffer = (base64Data: string) => {
    try {
      // 编码base64数据为二进制数据
      const binaryString = atob(base64Data)
      const buffer = new ArrayBuffer(binaryString.length)
      const uint8Array = new Uint8Array(buffer)

      // 3.2 将编码后的二进制字符串转换为uint8Array
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i)
      }

      // 数据存在并且没在更新更新则插入数据
      if (sourceBuffer.value && !sourceBuffer.value.updating) {
        sourceBuffer.value.appendBuffer(uint8Array)
      } else {
        // 如果 sourceBuffer 正在更新，可以尝试稍后插入数据
        sourceBuffer.value?.addEventListener(
          'updateend',
          () => {
            appendSourceBuffer(base64Data)
          },
          { once: true },
        )
      }
    } catch (error) {
      Message.error(`添加sourceBuffer出错: ${error}`)
    }
  }

  // 定义获取音频流数据处理器
  const fetchAudioStream = async (messageId: string) => {
    // 调用audioToMessage hook获取数据
    await handleMessageToAudio(messageId, (event_response) => {
      // 提取流式事件响应数据以事件名称
      const event = event_response?.event
      const data = event_response?.data

      // 如果事件为tts_message表示音频流式事件响应
      if (event === 'tts_message') {
        appendSourceBuffer(data?.audio)
      }
    })
  }

  // 定义开始播放音频流函数
  const startAudioStream = (messageId: string) => {
    // 如果数据已经加载过且正在播放，则无需重复请求
    if (isAudioLoaded.value && audioElement.value?.paused === false) {
      // 音频已加载并且正在播放，直接播放(重置播放时间为0)
      if (audioElement.value instanceof HTMLAudioElement) {
        audioElement.value.currentTime = 0
        audioElement.value.play().then(() => {
          isPlaying.value = true
        })
      }
      return
    }

    // 如果音频数据尚未加载，则初始化 AudioContext 和 MediaSource
    audioContext.value = new AudioContext()
    mediaSource.value = new MediaSource()

    // 使用 new Audio() 来播放音频流，而不是创建 <audio> 标签
    audioElement.value = new Audio()

    // 监听暂停与播放
    audioElement.value.addEventListener('play', onAudioPlay)
    audioElement.value.addEventListener('pause', onAudioPause)
    audioElement.value.addEventListener('ended', onAudioPause)

    // 为audio添加播放音频URL
    audioElement.value.src = URL.createObjectURL(mediaSource.value)

    // 为 mediaSource 添加事件监听
    mediaSource.value.addEventListener('sourceopen', onSourceOpen, { once: true })

    // 请求音频流数据
    fetchAudioStream(messageId)

    // 标记音频数据已加载并播放音频
    isAudioLoaded.value = true
    audioElement.value.play().then(() => {
      isPlaying.value = true
    })
  }

  // 定义停止播放音频流函数
  const stopAudioStream = () => {
    if (audioElement.value) {
      // 停止播放
      if (audioElement.value instanceof HTMLAudioElement) {
        audioElement.value.pause()
        audioElement.value.currentTime = 0
      }

      isPlaying.value = false
    }
  }

  // 定义音频开始播放监听处理器
  const onAudioPlay = () => {
    isPlaying.value = true
  }

  // 定义音频停止播放监听函数
  const onAudioPause = () => {
    isPlaying.value = false
  }

  return {
    isAudioLoaded,
    isPlaying,
    textToAudioLoading,
    startAudioStream,
    stopAudioStream,
  }
}
