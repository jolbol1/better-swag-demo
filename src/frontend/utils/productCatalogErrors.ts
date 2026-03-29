const GRPC_NOT_FOUND_CODE = 5;

type ErrorWithCode = Error & {
  code?: number;
  details?: string;
};

export function isProductNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const grpcError = error as ErrorWithCode;

  return (
    grpcError.code === GRPC_NOT_FOUND_CODE ||
    error.message.includes('NOT_FOUND') ||
    error.message.includes('Product Not Found')
  );
}
