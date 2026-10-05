import api from './api';
import { normalizeId } from './ids';

export async function getOrCreateConversation(recipientId, projectId) {
  const normalizedRecipientId = normalizeId(recipientId);
  if (!normalizedRecipientId) {
    throw new Error('Invalid recipient');
  }

  const payload = { recipientId: normalizedRecipientId };
  const normalizedProjectId = normalizeId(projectId);
  if (normalizedProjectId) payload.projectId = normalizedProjectId;

  const { data } = await api.post('/messages/conversations', payload);
  return data.conversation;
}

export function getOtherParticipant(conversation, currentUserId) {
  if (!conversation?.participants || !currentUserId) return null;
  return conversation.participants.find((p) => {
    const participantId = p._id?.toString?.() || p.toString();
    return participantId !== currentUserId.toString();
  });
}
