export class ApiError extends Error {
  status: number;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;

  constructor(message: string, status: number, errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function handleApiError(response: Response): Promise<never> {
  const data = await response.json();
  
  if (response.status === 401) {
    throw new ApiError(data.message || 'Please authenticate', 401);
  }

  if (response.status === 403) {
    throw new ApiError(data.message || 'Insufficient permissions', 403);
  }

  if (response.status === 404) {
    throw new ApiError(data.message || 'Resource not found', 404);
  }

  if (response.status === 400) {
    if (data.errors) {
      throw new ApiError('Validation error', 400, data.errors);
    }
    throw new ApiError(data.message || 'Bad request', 400);
  }

  throw new ApiError(data.message || 'Internal server error', 500);
} 