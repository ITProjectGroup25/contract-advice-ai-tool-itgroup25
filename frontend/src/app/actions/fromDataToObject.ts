export function formDataToObject<T = Record<string, any>>(
  formData: FormData
): T {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Try to parse numbers
    if (!isNaN(Number(value))) {
      obj[key] = Number(value);
      return;
    }

    // Try to parse JSON
    try {
      obj[key] = JSON.parse(value as string);
      return;
    } catch {}

    // Default to string
    obj[key] = value;
  });
  return obj as T;
}
