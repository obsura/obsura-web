export class ApiError extends Error {
  status?: number;
  details?: any;
  raw?: any;

  constructor(message: string, status?: number, details?: any, raw?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.raw = raw;
  }
}

export const handleApiError = async (res: Response) => {
  if (!res.ok) {
    let errorData;
    let message = `API request failed with status ${res.status}`;
    try {
      errorData = await res.json();
      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // Body not JSON
    }
    throw new ApiError(
      message,
      res.status,
      errorData?.details || errorData,
      errorData,
    );
  }
  return res;
};
