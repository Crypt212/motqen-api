import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { PrismaClient, MessageType } = pkg;

const { Pool } = pg;

// Initialize Prisma Client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  try {
    console.log("Starting conversation seeding...");

    // Get existing users with profiles
    const clients = await prisma.clientProfile.findMany({
      include: { user: true }
    });

    const workers = await prisma.workerProfile.findMany({
      include: { user: true }
    });

    if (clients.length === 0 || workers.length === 0) {
      console.log("No clients or workers found. Please run createTestUsers.js first.");
      return;
    }

    console.log(`Found ${clients.length} clients and ${workers.length} workers`);

    // Create conversations between clients and workers
    const conversations = [];
    
    // Create conversations for first client with first few workers
    const firstClient = clients[0];
    const workersToConnect = workers.slice(0, 3); // Connect with first 3 workers

    for (const workerProfile of workersToConnect) {
      // Check if conversation already exists
      const existingConv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: firstClient.user.id } } },
            { participants: { some: { userId: workerProfile.user.id } } },
          ],
        },
      });

      if (!existingConv) {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: [
                  { userId: firstClient.user.id, role: 'CLIENT' },
                  { userId: workerProfile.user.id, role: 'WORKER' },
                ],
              },
            },
          },
          include: { participants: true },
        });

        conversations.push(conversation);
        console.log(`Created conversation between ${firstClient.user.firstName} and ${workerProfile.user.firstName}`);

        // Add some sample messages
        await createSampleMessages(conversation.id, firstClient.user.id, workerProfile.user.id);
      } else {
        console.log(`Conversation already exists between ${firstClient.user.firstName} and ${workerProfile.user.firstName}`);
      }
    }

    // Create conversation with unread messages
    if (clients.length > 1 && workers.length > 3) {
      const secondClient = clients[1];
      const fourthWorker = workers[3];

      const existingConv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: secondClient.user.id } } },
            { participants: { some: { userId: fourthWorker.user.id } } },
          ],
        },
      });

      if (!existingConv) {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: [
                  { userId: secondClient.user.id, role: 'CLIENT' },
                  { userId: fourthWorker.user.id, role: 'WORKER' },
                ],
              },
            },
          },
          include: { participants: true },
        });

        conversations.push(conversation);
        console.log(`Created conversation between ${secondClient.user.firstName} and ${fourthWorker.user.firstName}`);

        // Add messages with unread/undelivered status
        await createUnreadMessages(conversation.id, secondClient.user.id, fourthWorker.user.id);
      }
    }

    console.log(`\nCreated ${conversations.length} conversations`);
    console.log("\n--- Conversation seeding completed successfully! ---");

  } catch (error) {
    console.error("Error seeding conversations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createSampleMessages(conversationId, clientId, workerId) {
  const sampleMessages = [
    { senderId: clientId, content: "مرحباً، هل أنت متاح للعمل اليوم؟", type: MessageType.TEXT },
    { senderId: workerId, content: "نعم، أنا متاح. ما نوع العمل الذي تحتاجه؟", type: MessageType.TEXT },
    { senderId: clientId, content: "أحتاج إلى إصلاح صنبور المطبخ", type: MessageType.TEXT },
    { senderId: workerId, content: "بالتأكيد، يمكنني المساعدة في ذلك. متى يناسبك أن أحضر؟", type: MessageType.TEXT },
    { senderId: clientId, content: "هل يمكنك الحضور غداً في الصباح؟", type: MessageType.TEXT },
    { senderId: workerId, content: "نعم، سأكون هناك الساعة 9 صباحاً", type: MessageType.TEXT },
  ];

  for (let i = 0; i < sampleMessages.length; i++) {
    const messageData = sampleMessages[i];
    await prisma.message.create({
      data: {
        conversationId,
        senderId: messageData.senderId,
        messageNumber: i + 1,
        content: messageData.content,
        type: messageData.type,
      },
    });
  }

  // Update conversation message counter
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { messageCounter: sampleMessages.length },
  });

  // Update participants' read status (all messages read by both participants)
  await prisma.conversationParticipant.updateMany({
    where: { conversationId },
    data: {
      lastReadMessageNumber: sampleMessages.length,
      lastReceivedMessageNumber: sampleMessages.length,
    },
  });

  console.log(`  - Added ${sampleMessages.length} sample messages`);
}

async function createUnreadMessages(conversationId, clientId, workerId) {

  const unreadMessages = [
    { senderId: clientId, content: "أحتاج مساعدة في تركيب ستارة", type: MessageType.TEXT },
    { senderId: workerId, content: "يمكنني المساعدة في ذلك. ما هي أبعاد النافذة؟", type: MessageType.TEXT },
    { senderId: clientId, content: "العرض حوالي 2 متر والارتفاع 1.5 متر", type: MessageType.TEXT },
    { senderId: workerId, content: "سأحتاج إلى مواد إضافية. التكلفة ستكون حوالي 500 جنيه", type: MessageType.TEXT },
    { senderId: clientId, content: "موافق، متى يمكنك الحضور؟", type: MessageType.TEXT },
  ];

  for (let i = 0; i < unreadMessages.length; i++) {
    const messageData = unreadMessages[i];
    await prisma.message.create({
      data: {
        conversationId,
        senderId: messageData.senderId,
        messageNumber: i + 1,
        content: messageData.content,
        type: messageData.type,
      },
    });
  }

  // Update conversation message counter
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { messageCounter: unreadMessages.length },
  });

  // Set participant statuses to simulate unread/undelivered messages
  // Client has read all messages
  await prisma.conversationParticipant.updateMany({
    where: { 
      conversationId,
      userId: clientId 
    },
    data: {
      lastReadMessageNumber: unreadMessages.length,
      lastReceivedMessageNumber: unreadMessages.length,
    },
  });

  // Worker has only received first 3 messages (2 are unread)
  await prisma.conversationParticipant.updateMany({
    where: { 
      conversationId,
      userId: workerId 
    },
    data: {
      lastReadMessageNumber: 2, // Only read first 2 messages
      lastReceivedMessageNumber: 3, // Received first 3 messages
    },
  });

  console.log(`  - Added ${unreadMessages.length} messages with unread status for worker`);
}

main();
