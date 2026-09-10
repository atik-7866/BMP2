const MAX_HISTORY_MESSAGES = 6;

export function formatConversationHistory(conversationHistory) {
    return conversationHistory.slice(-MAX_HISTORY_MESSAGES)
        .map(message => {
            const intent = message.intent ? `\nnormalized intent: ${message.intent}` : "";
            return `${message.role}: ${message.content}${intent}`;
        })
        .join("\n");
}
