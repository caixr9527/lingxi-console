export const apiPrefix: string = import.meta.env.VITE_API_PREFIX
export const icpCode: string = import.meta.env.VITE_ICP_CODE
export const gaCode: string = import.meta.env.VITE_GA_CODE
export const title: string = import.meta.env.VITE_TITLE

export const httpCode = {
  success: 'success',
  fail: 'fail',
  notFount: 'not_found',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  validateError: 'validate_error',
}

export const typeMap = {
  str: '字符串',
  int: '整型',
  fload: '浮点型',
  bool: '布尔值',
}

export const QueueEvent = {
  longTermMemoryRecall: 'long_term_memory_recall',
  agentThought: 'agent_thought',
  agentMessage: 'agent_message',
  agentAction: 'agent_action',
  datasetRetrieval: 'dataset_retrieval',
  agentEnd: 'agent_ent',
  stop: 'stop',
  error: 'error',
  timeout: 'timeout',
  ping: 'ping',
}
