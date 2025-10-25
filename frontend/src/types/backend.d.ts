// Type declarations to bypass backend type checking issues
declare module "@backend" {
  export const GET: any;
  export const POST: any;
  export const sqlClient: any;
  export const db: any;
  export const schema: any;
  export const authOptions: any;
}

declare module "@backend/*" {
  const content: any;
  export default content;
}
