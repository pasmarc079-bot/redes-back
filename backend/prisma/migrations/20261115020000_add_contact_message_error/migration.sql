-- Keeps the reason why the email could not be sent, so the panel can explain it without
-- needing access to the server logs.
ALTER TABLE "contact_messages" ADD COLUMN "error" TEXT;
