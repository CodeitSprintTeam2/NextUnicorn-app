import { ApiError } from "../errors/api-error.js";

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    const body = {
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (Array.isArray(error.details)) {
      const details = error.details
        .filter(
          (detail) =>
            typeof detail?.field === "string" &&
            typeof detail?.reason === "string",
        )
        .map(({ field, reason }) => ({ field, reason }));

      if (details.length > 0) {
        body.error.details = details;
      }
    }

    response.status(error.status).json(body);
    return;
  }

  if (error.type === "entity.parse.failed") {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "요청 값이 올바르지 않습니다.",
      },
    });
    return;
  }

  console.error("Unhandled error", {
    name: error?.name,
    code: error?.code,
  });

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류가 발생했습니다.",
    },
  });
}
