const baseUrl = "/api/v1";

const pathParam = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
});

const jsonRequest = (schema, description = "Request body") => ({
  required: true,
  description,
  content: {
    "application/json": { schema },
  },
});

const multipartRequest = (schema, description = "Multipart request body") => ({
  required: true,
  description,
  content: {
    "multipart/form-data": { schema },
  },
});

const standardErrors = {
  400: { description: "Invalid input data" },
  401: { description: "Authorization not provided" },
  403: { description: "Insufficient access" },
  404: { description: "Resource not found" },
  500: { description: "Internal server error" },
};

const makeOperation = ({
  tag,
  summary,
  description,
  parameters = [],
  requestBody,
  responses = {},
  secured = true,
}) => ({
  tags: [tag],
  summary,
  description,
  ...(parameters.length ? { parameters } : {}),
  ...(requestBody ? { requestBody } : {}),
  ...(secured ? { security: [{ bearerAuth: [] }] } : {}),
  responses: {
    200: { description: "Successful response" },
    ...standardErrors,
    ...responses,
  },
});

const schemas = {
  ApiError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Invalid input data" },
    },
  },
  AuthUser: {
    type: "object",
    properties: {
      id: { type: "string", example: "66a1f0d2b5a9d8d1f1c2e3a4" },
      fullName: { type: "string", example: "Alex Morgan" },
      email: { type: "string", format: "email", example: "alex@example.com" },
    },
  },
  AuthTokens: {
    type: "object",
    properties: {
      accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
      user: { $ref: "#/components/schemas/AuthUser" },
    },
  },
  RegisterInput: {
    type: "object",
    required: ["fullName", "email", "password"],
    properties: {
      fullName: { type: "string", minLength: 2, maxLength: 50, example: "Alex Morgan" },
      email: { type: "string", format: "email", example: "alex@example.com" },
      password: {
        type: "string",
        minLength: 8,
        example: "Password1",
        description: "Must contain at least one uppercase letter and one digit.",
      },
    },
  },
  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "alex@example.com" },
      password: { type: "string", minLength: 8, example: "Password1" },
    },
  },
  ForgotPasswordInput: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "alex@example.com" },
    },
  },
  ResetPasswordInput: {
    type: "object",
    required: ["password"],
    properties: {
      password: { type: "string", minLength: 8, example: "Password1" },
    },
  },
  TripInput: {
    type: "object",
    required: ["title", "description", "startDate", "endDate"],
    properties: {
      title: { type: "string", minLength: 5, maxLength: 50, example: "Goa Holiday" },
      description: { type: "string", minLength: 10, maxLength: 300, example: "A 5-day group trip to Goa." },
      startDate: { type: "string", format: "date", example: "2026-07-10" },
      endDate: { type: "string", format: "date", example: "2026-07-15" },
    },
  },
  MemberAddInput: {
    type: "object",
    required: ["email"],
    properties: {
      tripId: { type: "string", description: "Optional if trip is already in the route." },
      email: { type: "string", format: "email", example: "friend@example.com" },
      role: { type: "string", enum: ["Editor", "Viewer"], default: "Viewer" },
    },
  },
  MemberRoleInput: {
    type: "object",
    required: ["role"],
    properties: {
      role: { type: "string", enum: ["Editor", "Viewer"], example: "Editor" },
    },
  },
  DestinationInput: {
    type: "object",
    required: ["name", "description", "visitDate", "visitTime", "estimatedCost"],
    properties: {
      name: { type: "string", minLength: 5, maxLength: 50, example: "Baga Beach" },
      description: { type: "string", minLength: 10, maxLength: 300, example: "Sunset stop with nearby cafes." },
      visitDate: { type: "string", format: "date", example: "2026-07-11" },
      visitTime: { type: "string", example: "AM" },
      estimatedCost: { type: "string", example: "2500" },
    },
  },
  ExpenseInput: {
    type: "object",
    required: ["title", "amount", "category"],
    properties: {
      title: { type: "string", minLength: 5, maxLength: 50, example: "Taxi to hotel" },
      note: { type: "string", minLength: 5, maxLength: 20, example: "airport ride" },
      amount: { type: "number", minimum: 1, example: 1200 },
      category: { type: "string", enum: ["Food", "Hotel", "Transport", "Shopping", "Other"], example: "Transport" },
    },
  },
  DocumentUploadInput: {
    type: "object",
    required: ["file"],
    properties: {
      file: { type: "string", format: "binary" },
      name: { type: "string", example: "Boarding Pass" },
    },
  },
  ActivityInput: {
    type: "object",
    required: ["title", "visitDate", "startTime", "endTime", "estimatedCost"],
    properties: {
      title: { type: "string", minLength: 5, maxLength: 50, example: "Dolphin tour" },
      description: { type: "string", minLength: 10, maxLength: 300, example: "Morning boat ride with snorkeling stop." },
      visitDate: { type: "string", format: "date", example: "2026-07-11" },
      startTime: { type: "string", example: "09:00" },
      endTime: { type: "string", example: "11:00" },
      estimatedCost: { type: "string", example: "1800" },
    },
  },
  ActivityUpdateInput: {
    type: "object",
    minProperties: 1,
    properties: {
      title: { type: "string", minLength: 5, maxLength: 50, example: "Dolphin tour" },
      description: { type: "string", minLength: 10, maxLength: 300, example: "Updated description." },
      visitDate: { type: "string", format: "date", example: "2026-07-11" },
      startTime: { type: "string", example: "09:00" },
      endTime: { type: "string", example: "11:00" },
      estimatedCost: { type: "string", example: "1800" },
    },
  },
  ActivityOrderInput: {
    type: "object",
    required: ["activities"],
    properties: {
      activities: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "order"],
          properties: {
            id: { type: "string", example: "66a1f0d2b5a9d8d1f1c2e3a4" },
            order: { type: "integer", minimum: 1, example: 1 },
          },
        },
      },
    },
  },
  CommentInput: {
    type: "object",
    required: ["text"],
    properties: {
      text: { type: "string", minLength: 1, maxLength: 200, example: "Looks good to me." },
    },
  },
  ChecklistItemInput: {
    type: "object",
    required: ["text"],
    properties: {
      text: { type: "string", minLength: 1, maxLength: 50, example: "Pack charger" },
    },
  },
  ChecklistItemUpdateInput: {
    type: "object",
    minProperties: 1,
    properties: {
      text: { type: "string", minLength: 1, maxLength: 50, example: "Pack charger" },
      completed: { type: "boolean", example: true },
    },
  },
};

const responses = {
  created: { description: "Created successfully" },
  noContent: { description: "Deleted successfully" },
};

const spec = {
  openapi: "3.0.3",
  info: {
    title: "TripSync API Reference",
    version: "1.0.0",
    description: "Interactive documentation for the TripSync REST API.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth", description: "Authentication and account sessions" },
    { name: "Trips", description: "Trip lifecycle endpoints" },
    { name: "Members", description: "Trip member management" },
    { name: "Destinations", description: "Trip destination endpoints" },
    { name: "Expenses", description: "Expense tracking and balances" },
    { name: "Documents", description: "Trip file uploads" },
    { name: "Activities", description: "Destination activity management" },
    { name: "Comments", description: "Activity comments" },
    { name: "Checklists", description: "Packing and shared checklist items" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas,
  },
  paths: {
    [`${baseUrl}/auth/register`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Register a new user",
        description: "Creates a new TripSync account and sends a verification email.",
        secured: false,
        requestBody: jsonRequest(schemas.RegisterInput),
        responses: { 201: { description: "Verification email sent" } },
      }),
    },
    [`${baseUrl}/auth/login`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Login with email and password",
        description: "Authenticates a verified user and issues access credentials.",
        secured: false,
        requestBody: jsonRequest(schemas.LoginInput),
        responses: { 200: { description: "Login successful" } },
      }),
    },
    [`${baseUrl}/auth/refresh-token`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Refresh the access token",
        description: "Uses the refresh token cookie to mint a new access token.",
        secured: false,
        responses: { 200: { description: "Token refreshed" } },
      }),
    },
    [`${baseUrl}/auth/logout`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Logout the current user",
        description: "Clears the stored refresh token and invalidates the session.",
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/auth/google`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Login with Google",
        description: "Completes Google OAuth login for an existing or new user.",
        secured: false,
        responses: { 200: { description: "Google login successful" } },
      }),
    },
    [`${baseUrl}/auth/verify-email/{token}`]: {
      get: makeOperation({
        tag: "Auth",
        summary: "Verify an email address",
        description: "Marks the account as verified using the one-time email token.",
        secured: false,
        parameters: [pathParam("token", "Email verification token")],
        responses: { 200: { description: "Email verified" } },
      }),
    },
    [`${baseUrl}/auth/resend-verification`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Resend the verification email",
        description: "Sends a fresh verification link to an unverified account.",
        secured: false,
        requestBody: jsonRequest(schemas.ForgotPasswordInput),
        responses: { 200: { description: "Verification email sent" } },
      }),
    },
    [`${baseUrl}/auth/forgot-password`]: {
      post: makeOperation({
        tag: "Auth",
        summary: "Request a password reset",
        description: "Sends a password reset link to the user's email address.",
        secured: false,
        requestBody: jsonRequest(schemas.ForgotPasswordInput),
        responses: { 200: { description: "Reset email sent" } },
      }),
    },
    [`${baseUrl}/auth/reset-password/{token}`]: {
      put: makeOperation({
        tag: "Auth",
        summary: "Reset a password with token",
        description: "Completes the password reset flow using a one-time token.",
        parameters: [pathParam("token", "Password reset token")],
        secured: false,
        requestBody: jsonRequest(schemas.ResetPasswordInput),
        responses: { 200: { description: "Password reset successful" } },
      }),
    },
    [`${baseUrl}/auth/me`]: {
      get: makeOperation({
        tag: "Auth",
        summary: "Get the current user",
        description: "Returns the authenticated user's profile.",
        responses: { 200: { description: "Profile returned" } },
      }),
    },
    [`${baseUrl}/trips/create-trip`]: {
      post: makeOperation({
        tag: "Trips",
        summary: "Create a trip",
        description: "Creates a new collaborative trip workspace.",
        requestBody: jsonRequest(schemas.TripInput),
        responses: { 201: responses.created },
      }),
    },
    [`${baseUrl}/trips/getAllTrips`]: {
      get: makeOperation({
        tag: "Trips",
        summary: "List all trips",
        description: "Returns trips the current user can access.",
        responses: { 200: { description: "Trips returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}`]: {
      patch: makeOperation({
        tag: "Trips",
        summary: "Update a trip",
        description: "Updates trip metadata such as title, dates, or description.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: jsonRequest(schemas.TripInput),
        responses: { 200: { description: "Trip updated" } },
      }),
      delete: makeOperation({
        tag: "Trips",
        summary: "Delete a trip",
        description: "Removes a trip and its related records.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/cover`]: {
      patch: makeOperation({
        tag: "Trips",
        summary: "Upload a trip cover image",
        description: "Uploads or replaces the cover image for a trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: multipartRequest({
          type: "object",
          required: ["cover"],
          properties: { cover: { type: "string", format: "binary" } },
        }),
        responses: { 200: { description: "Cover updated" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/members`]: {
      get: makeOperation({
        tag: "Members",
        summary: "List trip members",
        description: "Returns all members for the selected trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 200: { description: "Members returned" } },
      }),
      post: makeOperation({
        tag: "Members",
        summary: "Add a trip member",
        description: "Invites a user and assigns them a trip role.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: jsonRequest(schemas.MemberAddInput),
        responses: { 201: responses.created },
      }),
    },
    [`${baseUrl}/trips/{tripId}/members/{memberId}`]: {
      get: makeOperation({
        tag: "Members",
        summary: "Get a trip member",
        description: "Returns a single member record for a trip.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("memberId", "Trip member identifier")],
        responses: { 200: { description: "Member returned" } },
      }),
      patch: makeOperation({
        tag: "Members",
        summary: "Update a member role",
        description: "Updates a trip member's role.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("memberId", "Trip member identifier")],
        requestBody: jsonRequest(schemas.MemberRoleInput),
        responses: { 200: { description: "Member updated" } },
      }),
      delete: makeOperation({
        tag: "Members",
        summary: "Remove a trip member",
        description: "Removes a member from the trip.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("memberId", "Trip member identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/destinations`]: {
      post: makeOperation({
        tag: "Destinations",
        summary: "Create a destination",
        description: "Adds a destination to a trip itinerary.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: jsonRequest(schemas.DestinationInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Destinations",
        summary: "List destinations",
        description: "Returns destinations for a trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 200: { description: "Destinations returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/destinations/{destinationId}`]: {
      get: makeOperation({
        tag: "Destinations",
        summary: "Get a destination",
        description: "Returns one destination for a trip.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        responses: { 200: { description: "Destination returned" } },
      }),
      patch: makeOperation({
        tag: "Destinations",
        summary: "Update a destination",
        description: "Edits a destination on the itinerary.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        requestBody: jsonRequest(schemas.DestinationInput),
        responses: { 200: { description: "Destination updated" } },
      }),
      delete: makeOperation({
        tag: "Destinations",
        summary: "Delete a destination",
        description: "Deletes a destination from the trip.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/expenses`]: {
      post: makeOperation({
        tag: "Expenses",
        summary: "Create an expense",
        description: "Logs a new expense and calculates the split.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: jsonRequest(schemas.ExpenseInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Expenses",
        summary: "List expenses",
        description: "Returns all expenses for a trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 200: { description: "Expenses returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/expenses/balances`]: {
      get: makeOperation({
        tag: "Expenses",
        summary: "Get trip balances",
        description: "Returns who owes what in the trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 200: { description: "Balances returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/expenses/{expenseId}`]: {
      get: makeOperation({
        tag: "Expenses",
        summary: "Get an expense",
        description: "Returns a single expense record.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("expenseId", "Expense identifier")],
        responses: { 200: { description: "Expense returned" } },
      }),
      patch: makeOperation({
        tag: "Expenses",
        summary: "Update an expense",
        description: "Edits an expense and recalculates balances.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("expenseId", "Expense identifier")],
        requestBody: jsonRequest(schemas.ExpenseInput),
        responses: { 200: { description: "Expense updated" } },
      }),
      delete: makeOperation({
        tag: "Expenses",
        summary: "Delete an expense",
        description: "Removes an expense from the trip ledger.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("expenseId", "Expense identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/documents`]: {
      post: makeOperation({
        tag: "Documents",
        summary: "Upload a document",
        description: "Uploads a file and attaches it to the trip.",
        parameters: [pathParam("tripId", "Trip identifier")],
        requestBody: multipartRequest(schemas.DocumentUploadInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Documents",
        summary: "List documents",
        description: "Returns trip files and uploaded metadata.",
        parameters: [pathParam("tripId", "Trip identifier")],
        responses: { 200: { description: "Documents returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/documents/{docId}`]: {
      delete: makeOperation({
        tag: "Documents",
        summary: "Delete a document",
        description: "Deletes a file from the trip.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("docId", "Document identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/destinations/{destinationId}/activities`]: {
      post: makeOperation({
        tag: "Activities",
        summary: "Create an activity",
        description: "Adds an activity to a destination.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        requestBody: jsonRequest(schemas.ActivityInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Activities",
        summary: "List activities",
        description: "Returns activities for a destination.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        responses: { 200: { description: "Activities returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/destinations/{destinationId}/activities/reorder`]: {
      patch: makeOperation({
        tag: "Activities",
        summary: "Reorder activities",
        description: "Updates the order of activities within a destination.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("destinationId", "Destination identifier")],
        requestBody: jsonRequest(schemas.ActivityOrderInput),
        responses: { 200: { description: "Order updated" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/destinations/{destinationId}/activities/{activityId}`]: {
      patch: makeOperation({
        tag: "Activities",
        summary: "Update an activity",
        description: "Edits one activity in a destination.",
        parameters: [
          pathParam("tripId", "Trip identifier"),
          pathParam("destinationId", "Destination identifier"),
          pathParam("activityId", "Activity identifier"),
        ],
        requestBody: jsonRequest(schemas.ActivityUpdateInput),
        responses: { 200: { description: "Activity updated" } },
      }),
      delete: makeOperation({
        tag: "Activities",
        summary: "Delete an activity",
        description: "Removes an activity from a destination.",
        parameters: [
          pathParam("tripId", "Trip identifier"),
          pathParam("destinationId", "Destination identifier"),
          pathParam("activityId", "Activity identifier"),
        ],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/{tripId}/activities/{activityId}/comments`]: {
      post: makeOperation({
        tag: "Comments",
        summary: "Create a comment",
        description: "Adds a comment to an activity.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("activityId", "Activity identifier")],
        requestBody: jsonRequest(schemas.CommentInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Comments",
        summary: "List comments",
        description: "Returns comments attached to an activity.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("activityId", "Activity identifier")],
        responses: { 200: { description: "Comments returned" } },
      }),
    },
    [`${baseUrl}/trips/{tripId}/comments/{commentId}`]: {
      patch: makeOperation({
        tag: "Comments",
        summary: "Update a comment",
        description: "Edits one comment on an activity.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("commentId", "Comment identifier")],
        requestBody: jsonRequest(schemas.CommentInput),
        responses: { 200: { description: "Comment updated" } },
      }),
      delete: makeOperation({
        tag: "Comments",
        summary: "Delete a comment",
        description: "Deletes one comment from an activity.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("commentId", "Comment identifier")],
        responses: { 204: responses.noContent },
      }),
    },
    [`${baseUrl}/trips/checklists/{tripId}/{type}`]: {
      post: makeOperation({
        tag: "Checklists",
        summary: "Create a checklist item",
        description: "Adds an item to either the Packing or Shared checklist.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("type", "Checklist type")],
        requestBody: jsonRequest(schemas.ChecklistItemInput),
        responses: { 201: responses.created },
      }),
      get: makeOperation({
        tag: "Checklists",
        summary: "List checklist items",
        description: "Returns items for the selected checklist type.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("type", "Checklist type")],
        responses: { 200: { description: "Checklist items returned" } },
      }),
    },
    [`${baseUrl}/trips/checklists/{tripId}/{checklistItemId}`]: {
      patch: makeOperation({
        tag: "Checklists",
        summary: "Update a checklist item",
        description: "Updates an existing checklist item.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("checklistItemId", "Checklist item identifier")],
        requestBody: jsonRequest(schemas.ChecklistItemUpdateInput),
        responses: { 200: { description: "Checklist item updated" } },
      }),
      delete: makeOperation({
        tag: "Checklists",
        summary: "Delete a checklist item",
        description: "Deletes an item from a checklist.",
        parameters: [pathParam("tripId", "Trip identifier"), pathParam("checklistItemId", "Checklist item identifier")],
        responses: { 204: responses.noContent },
      }),
    },
  },
};

export default spec;