// Temporary stub for backend imports during independent build
// This is a workaround for deployment - needs proper architecture refactoring

// Mock database connection
export const db = {
  insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
  select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
  delete: () => ({ where: () => Promise.resolve() }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
} as any;

// Mock schema
export const form = {} as any;
export const formDetails = {} as any;
export const formResults = {} as any;
export const schema = {
  form,
  formDetails,
  formResults,
} as any;

// Mock auth
export const auth = () => Promise.resolve(null);
export const signOut = () => Promise.resolve();

// Mock API handlers
export const GET = async () => new Response("{}");
export const POST = async () => new Response("{}");
