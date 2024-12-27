export const apiPrefix: string = 'http://127.0.0.1:5000'

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
