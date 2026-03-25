import { z } from 'zod';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  selectedVariantId: z.string().uuid().nullish(), // Allow null, undefined, or valid UUID
  selectedPaymentMethodId: z.string().uuid().nullish(), // Allow null, undefined, or valid UUID
});

export const chatbotValidation = {
  chatSchema
};