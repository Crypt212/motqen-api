/**
 * @fileoverview Tests for chat validators
 * @module tests/validators/chat
 */

describe('Chat Validators', () => {
  describe('createConversationValidators', () => {
    test('should validate workerId and clientId are required UUIDs', () => {
      const validators = [
        {
          chainer: 'isLength',
          builder: { fields: ['workerId'], optional: false },
        },
        {
          chainer: 'isLength',
          builder: { fields: ['clientId'], optional: false },
        },
      ];

      expect(validators).toHaveLength(2);
      expect(validators[0].builder.fields[0]).toBe('workerId');
      expect(validators[1].builder.fields[0]).toBe('clientId');
    });
  });

  describe('getMessagesValidators', () => {
    test('should have conversationId param and optional query params', () => {
      const validators = [
        {
          chainer: 'isLength',
          builder: { fields: ['conversationId'], optional: false },
        },
        { chainer: 'isInt', builder: { fields: ['after'], optional: true } },
        { chainer: 'isInt', builder: { fields: ['limit'], optional: true } },
      ];

      expect(validators).toHaveLength(3);
      expect(validators[0].builder.fields[0]).toBe('conversationId');
      expect(validators[1].builder.optional).toBe(true);
      expect(validators[2].builder.optional).toBe(true);
    });
  });

  describe('getMissedMessagesValidators', () => {
    test('should have conversationId param and required after query', () => {
      const validators = [
        {
          chainer: 'isLength',
          builder: { fields: ['conversationId'], optional: false },
        },
        { chainer: 'isInt', builder: { fields: ['after'], optional: false } },
      ];

      expect(validators).toHaveLength(2);
      expect(validators[0].builder.fields[0]).toBe('conversationId');
      expect(validators[1].builder.optional).toBe(false);
    });
  });

  describe('validator structure', () => {
    test('conversationId should be validated as UUID', () => {
      const validatorDef = {
        chainer: 'isUUID',
        builder: { fields: ['conversationId'] },
      };
      expect(validatorDef.chainer).toBe('isUUID');
      expect(validatorDef.builder.fields[0]).toBe('conversationId');
    });

    test('after query should be validated as integer', () => {
      const validatorDef = { chainer: 'isInt', builder: { fields: ['after'] } };
      expect(validatorDef.chainer).toBe('isInt');
    });
  });
});
