import { SESClient } from "@aws-sdk/client-ses";

export function configureAWS() {
  // AWS SES configuration
  return new SESClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}
