import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse } from "../common/response-utils";

interface InterventionMetadata {
  updatedAt: number;
  appliedAt: number;
  sentAt: number;
  description: string;
  reprovedIdentityAt?: number;
  resetPasswordAt?: number;
  accountDeletedAt?: number;
}

interface AccountState {
  blocked: boolean;
  suspended: boolean;
  reproveIdentity: boolean;
  resetPassword: boolean;
}

interface HistoryObject {
  sentAt: string;
  component: string;
  code: string;
  intervention: string;
  reason: string;
  originatingComponent?: string;
  originatorReferenceId?: string;
  requesterId?: string;
}

interface InterventionStatusResponse {
  intervention: InterventionMetadata;
  state: AccountState;
  auditLevel: string;
  history?: HistoryObject[];
}

function getAccountStateFromUserId(userId: string): {
  state: AccountState;
  description: string;
} {
  const lowerUserId = userId.toLowerCase();

  if (lowerUserId.startsWith("blocked")) {
    return {
      state: {
        blocked: true,
        suspended: false,
        reproveIdentity: false,
        resetPassword: false,
      },
      description: "AIS_ACCOUNT_BLOCKED",
    };
  }

  if (lowerUserId.startsWith("suspended-reprove-identity-and-reset-password")) {
    return {
      state: {
        blocked: false,
        suspended: true,
        reproveIdentity: true,
        resetPassword: true,
      },
      description: "AIS_FORCED_USER_PASSWORD_RESET_AND_IDENTITY_VERIFY",
    };
  }

  if (lowerUserId.startsWith("suspended-reprove-identity")) {
    return {
      state: {
        blocked: false,
        suspended: true,
        reproveIdentity: true,
        resetPassword: false,
      },
      description: "AIS_FORCED_USER_IDENTITY_VERIFY",
    };
  }

  if (lowerUserId.startsWith("suspended-reset-password")) {
    return {
      state: {
        blocked: false,
        suspended: true,
        reproveIdentity: false,
        resetPassword: true,
      },
      description: "AIS_FORCED_USER_PASSWORD_RESET",
    };
  }

  if (lowerUserId.startsWith("suspended")) {
    return {
      state: {
        blocked: false,
        suspended: true,
        reproveIdentity: false,
        resetPassword: false,
      },
      description: "AIS_ACCOUNT_SUSPENDED",
    };
  }

  return {
    state: {
      blocked: false,
      suspended: false,
      reproveIdentity: false,
      resetPassword: false,
    },
    description: "AIS_NO_INTERVENTION",
  };
}

function buildResponse(
  userId: string,
  includeHistory: boolean
): InterventionStatusResponse {
  const now = Date.now();
  const { state, description } = getAccountStateFromUserId(userId);

  const response: InterventionStatusResponse = {
    intervention: {
      updatedAt: now,
      appliedAt: now - 1000,
      sentAt: now - 2000,
      description,
    },
    state,
    auditLevel: "standard",
  };

  if (includeHistory) {
    response.history = [
      {
        sentAt: new Date(now - 2000).toISOString(),
        component: "TICF_CRI",
        code: "01",
        intervention: "FRAUD_SUSPEND_ACCOUNT",
        reason: "stub history entry",
      },
    ];
  }

  return response;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.userId;

  if (!userId || userId.trim() === "") {
    return formatResponse(400, { message: "userId is required" });
  }

  const validUserIdPattern = /^[^,\s]+$/;
  if (!validUserIdPattern.test(userId)) {
    return formatResponse(400, {
      message: "userId contains invalid characters",
    });
  }

  const includeHistory =
    event.queryStringParameters?.history === "true" ||
    event.queryStringParameters?.history === "1";

  const response = buildResponse(userId, includeHistory);

  return formatResponse(200, response);
};
