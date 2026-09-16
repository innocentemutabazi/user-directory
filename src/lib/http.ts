export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) return 'That profile is not in the directory.';
    if (error.status >= 500)
      return 'The directory service is not responding. Try again in a moment.';
    return `The directory service returned ${error.status}.`;
  }
  if (error instanceof TypeError) {
    return 'Could not reach the directory. Check your connection and try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong while loading the directory.';
}

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

export async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Request to ${path} failed`);
  }

  return response.json();
}
