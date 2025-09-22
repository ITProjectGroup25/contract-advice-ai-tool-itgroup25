// "use server";

// import { db, form } from "@backend";
// import { eq } from "drizzle-orm";

// export const getSubmissions = async (formId: number) => {
//   const targetForm = await db.query.form.findFirst({
//     where: eq(form.id, formId),
//     with: {
//       questions: {
//         with: {
//           fieldOptions: true,
//         },
//       },
//       submissions: {
//         with: {
//           answers: {
//             with: {
//               fieldOption: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   return targetForm;
// };
