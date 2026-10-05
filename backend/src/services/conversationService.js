const Conversation = require('../models/Conversation');
const { parseObjectId } = require('../utils/objectId');

async function findOrCreateConversation(userA, userB, projectId) {
  const participantA = parseObjectId(userA, 'user ID');
  const participantB = parseObjectId(userB, 'recipient ID');
  const project = projectId ? parseObjectId(projectId, 'project ID') : null;

  const participantQuery = { participants: { $all: [participantA, participantB] } };

  let conversation = project
    ? await Conversation.findOne({ ...participantQuery, project })
    : null;

  if (!conversation) {
    conversation = await Conversation.findOne(participantQuery);
  }

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [participantA, participantB],
      ...(project && { project }),
    });
  } else if (project && !conversation.project) {
    conversation.project = project;
    await conversation.save();
  }

  return conversation;
}

module.exports = { findOrCreateConversation };
