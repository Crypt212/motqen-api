import 'dotenv/config';
import prisma from '../../src/libs/database.js';

const CLIENT_PHONE = '01199999999';
const WORKER_PHONE = '01188888888';

export async function seedChat() {
  console.log('--- Seeding Chat Module Data ---');

  // 1. Idempotency: cascade delete conversations to respect RESTRICT on messages
  const oldUsers = await prisma.user.findMany({
    where: { phoneNumber: { in: [CLIENT_PHONE, WORKER_PHONE] } },
    select: { id: true }
  });
  const oldUserIds = oldUsers.map(u => u.id);

  if (oldUserIds.length > 0) {
    await prisma.conversation.deleteMany({
      where: { participants: { some: { userId: { in: oldUserIds } } } }
    });
    // Delete worker badges/etc just to be safe
    await prisma.user.deleteMany({
      where: { id: { in: oldUserIds } }
    });
  }

  // 2. Setup the "Clean slate" user
  console.log('Creating specific test users isolated for chat...');
  const chatClient = await prisma.user.create({
    data: {
      phoneNumber: CLIENT_PHONE,
      firstName: 'Chat',
      middleName: 'Test',
      lastName: 'Client',
      role: 'USER',
      status: 'ACTIVE',
      clientProfile: {
        create: {}
      }
    }
  });

  const chatWorker = await prisma.user.create({
    data: {
      phoneNumber: WORKER_PHONE,
      firstName: 'Chat',
      middleName: 'Test',
      lastName: 'Worker',
      role: 'USER',
      status: 'ACTIVE',
      workerProfile: {
        create: {
          experienceYears: 5,
        }
      }
    }
  });

  // Create conversation #1 (Clean slate)
  const conv1 = await prisma.conversation.create({
    data: {
      messageCounter: 0,
      participants: {
        create: [
          { userId: chatClient.id, role: 'CLIENT' },
          { userId: chatWorker.id, role: 'WORKER' }
        ]
      }
    }
  });
  console.log('Created Clean Slate Conversation:', conv1.id);

  // Create conversation #2 (In-progress with unread messages)
  const conv2 = await prisma.conversation.create({
    data: {
      messageCounter: 3,
      participants: {
        create: [
          // Client has read all messages
          { userId: chatClient.id, role: 'CLIENT', lastReadMessageNumber: 3, lastReceivedMessageNumber: 3 },
          // Worker hasn't read the last message
          { userId: chatWorker.id, role: 'WORKER', lastReadMessageNumber: 2, lastReceivedMessageNumber: 3 }
        ]
      }
    }
  });

  // Insert messages for In-progress conversation
  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        senderId: chatClient.id,
        messageNumber: 1,
        content: 'Hello, need some work done',
        type: 'TEXT',
      },
      {
        conversationId: conv2.id,
        senderId: chatWorker.id,
        messageNumber: 2,
        content: 'Sure, what do you need?',
        type: 'TEXT',
      },
      {
        conversationId: conv2.id,
        senderId: chatClient.id,
        messageNumber: 3,
        content: 'I need a door fixed',
        type: 'TEXT',
      }
    ]
  });

  console.log('Created In-Progress Conversation:', conv2.id);
  console.log('--- Chat Seeding Complete ---');
}

// Execute standalone if called directly
if (process.argv[1] && process.argv[1].includes('createChatSeeds.js')) {
  seedChat().catch(console.error).finally(() => prisma.$disconnect());
}
