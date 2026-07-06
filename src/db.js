import Dexie from 'dexie';

/**
 * Sets up the client-side database using Dexie.js.
 * This database will store all user-specific data like conversations and messages
 * locally on the user's device.
 */
export const db = new Dexie('bubbleDB');

db.version(1).stores({
  // '++id' means auto-incrementing primary key.
  // '&id' means the id property must be unique.
  // '[user1+user2]' is a compound index for finding 1-on-1 chats.
  conversations: '++id, &conversationId, name',
  messages: '++id, conversationId, timestamp',
  users: '&userId, username', // Stores info about other users, like their public keys
  keyStore: '&keyName', // To store our own keys
});

export default db;