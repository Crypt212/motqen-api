/**
 * @fileoverview Tests for ChatService image message features
 * @module tests/services/ChatService.image
 */

import { jest } from '@jest/globals';
import { mockDeep } from 'jest-mock-extended';

// ─── Mock Cloudinary provider before ChatService loads ──────────────────────
const mockUploadToCloudinary = jest.fn();
jest.unstable_mockModule('../src/providers/cloudinaryProvider', () => ({
  default: mockUploadToCloudinary,
}));

// Dynamic imports — must come after jest.unstable_mockModule
const { default: ChatService } = await import('../../src/services/ChatService.js');
const { default: AppError } = await import('../../src/errors/AppError.js');

describe('ChatService — image messaging', () => {
  /** @type {InstanceType<typeof ChatService>} */
  let chatService;
  let deps;

  beforeEach(() => {
    deps = {
      conversationRepository: mockDeep(),
      messageRepository: mockDeep(),
      workerRepository: mockDeep(),
      clientRepository: mockDeep(),
      presence: mockDeep(),
    };
    chatService = new ChatService(deps);
    jest.restoreAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // sendImageMessage
  // ═══════════════════════════════════════════════════════════════════════════

  describe('sendImageMessage', () => {
    const CONV_ID = 'conv-1';
    const SENDER_ID = 'user-1';
    const FAKE_BUFFER = Buffer.from('fake-image-data');
    const FAKE_URL = 'https://res.cloudinary.com/demo/image/upload/v1/Motqen/chat-images/abc.jpg';

    test('calls uploadToCloudinary with buffer and correct folder, then calls sendMessage with IMAGE type', async () => {
      // Arrange
      mockUploadToCloudinary.mockResolvedValue({ url: FAKE_URL, publicId: 'abc' });

      const fakeMessage = {
        id: 'msg-1', conversationId: CONV_ID, senderId: SENDER_ID,
        messageNumber: 1, content: FAKE_URL, type: 'IMAGE', createdAt: new Date(),
      };
      // Spy on sendMessage to avoid needing prisma mock
      const sendMessageSpy = jest.spyOn(chatService, 'sendMessage').mockResolvedValue(fakeMessage);

      // Act
      const result = await chatService.sendImageMessage({
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        imageBuffer: FAKE_BUFFER,
      });

      // Assert — uploadToCloudinary called correctly
      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
      expect(mockUploadToCloudinary).toHaveBeenCalledWith(FAKE_BUFFER, 'Motqen/chat-images');

      // Assert — sendMessage called with IMAGE type and Cloudinary URL
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        content: FAKE_URL,
        type: 'IMAGE',
      });

      // Assert — returns the message
      expect(result).toEqual(fakeMessage);
    });

    test('throws AppError 400 when imageBuffer is missing', async () => {
      const sendMessageSpy = jest.spyOn(chatService, 'sendMessage');

      await expect(
        chatService.sendImageMessage({
          conversationId: CONV_ID,
          senderId: SENDER_ID,
          imageBuffer: null,
        })
      ).rejects.toMatchObject({
        message: 'Image buffer is required',
        statusCode: 400,
      });

      // Neither Cloudinary nor sendMessage should be called
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    test('Cloudinary failure throws and does not call sendMessage', async () => {
      mockUploadToCloudinary.mockRejectedValue(new Error('Cloudinary upload failed'));
      const sendMessageSpy = jest.spyOn(chatService, 'sendMessage');

      await expect(
        chatService.sendImageMessage({
          conversationId: CONV_ID,
          senderId: SENDER_ID,
          imageBuffer: FAKE_BUFFER,
        })
      ).rejects.toThrow('Cloudinary upload failed');

      // Cloudinary was called, but sendMessage was not
      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // sendMessage — type validation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('sendMessage — type validation', () => {
    const CONV_ID = 'conv-1';
    const SENDER_ID = 'user-1';

    test('rejects invalid type (e.g. VIDEO) with AppError 400', async () => {
      await expect(
        chatService.sendMessage({
          conversationId: CONV_ID,
          senderId: SENDER_ID,
          content: 'some content',
          type: 'VIDEO',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid message type'),
      });
    });

    test('type TEXT with empty content throws AppError 400', async () => {
      await expect(
        chatService.sendMessage({
          conversationId: CONV_ID,
          senderId: SENDER_ID,
          content: '   ',
          type: 'TEXT',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Message content cannot be empty',
      });
    });

    test('type IMAGE with valid URL content passes validation (reaches DB layer)', async () => {
      const fakeUrl = 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg';

      // sendMessage will try to hit prisma.$transaction — we expect it to
      // get past validation and fail at the DB layer (since DB is not set up).
      // The key assertion: it does NOT throw a validation AppError.
      const result = chatService.sendMessage({
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        content: fakeUrl,
        type: 'IMAGE',
      });

      // If it threw a 400 validation error, the test would fail.
      // It should throw a different error (DB-related) or resolve.
      await expect(result).rejects.not.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid message type'),
      });
    });

    test('type TEXT with valid content passes validation (reaches DB layer)', async () => {
      const result = chatService.sendMessage({
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        content: 'Hello, world!',
        type: 'TEXT',
      });

      // Should not throw a validation error
      await expect(result).rejects.not.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid message type'),
      });
      await expect(result).rejects.not.toMatchObject({
        statusCode: 400,
        message: 'Message content cannot be empty',
      });
    });
  });
});
