import { z } from 'zod';

const schema = z.object({
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

const result = schema.safeParse({
  password: '123',
  confirmPassword: '123'
});

console.log(JSON.stringify(result, null, 2));
