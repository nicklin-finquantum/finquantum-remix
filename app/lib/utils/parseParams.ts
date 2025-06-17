
/**
 * Parse request parameters (matching your backend parseParams function)
 */
export function parseParams(request: Request, requiredFields: string[]): Record<string, any> {
  const url = new URL(request.url);
  const params: Record<string, any> = {};

  // Get from URL params for GET requests
  for (const field of requiredFields) {
    const value = url.searchParams.get(field);
    if (value) {
      params[field] = value;
    }
  }

  return params;
}