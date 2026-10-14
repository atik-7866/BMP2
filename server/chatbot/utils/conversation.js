const MAX_HISTORY_MESSAGES = 6;

export function formatConversationHistory(conversationHistory) {
    return conversationHistory.slice(-MAX_HISTORY_MESSAGES)
        .map(message => `${message.role}: ${message.content}`)
        .join("\n");
}
