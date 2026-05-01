export async function safeCatch<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))]; // Esto lo que hace es si err es de tipo Error, lo devuelve tal cual si no lo convierte en tipo Error
  }
}