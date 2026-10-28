import "server-only";

type RequiredKey =
  | "DATABASE_URL"
  | "ADMIN_PASSWORD_HASH"
  | "SESSION_SECRET"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_API_KEY"
  | "CLOUDINARY_API_SECRET";

export function requiredEnv(name: RequiredKey): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

export function optionalEnv(name: "RESEND_API_KEY" | "ENQUIRY_TO_EMAIL" | "ENQUIRY_FROM_EMAIL"): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}
