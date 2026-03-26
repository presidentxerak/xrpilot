import { z } from "zod";
import { MAX_DESTINATION_TAG } from "../constants.js";

const xrpAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

export const TransactionStatusSchema = z.enum([
  "pending",
  "submitted",
  "validated",
  "failed",
  "rejected",
]);

export const TransactionRequestSchema = z
  .object({
    source: z
      .string()
      .regex(xrpAddressRegex, "Invalid source address"),
    destination: z
      .string()
      .regex(xrpAddressRegex, "Invalid destination address"),
    amount: z
      .string()
      .min(1, "Amount must not be empty")
      .regex(/^\d+(\.\d+)?$/, "Amount must be a positive numeric string")
      .refine(
        (val) => parseFloat(val) > 0,
        "Amount must be greater than zero",
      ),
    currency: z
      .string()
      .min(3, "Currency code must be at least 3 characters")
      .max(40, "Currency code must be at most 40 characters")
      .optional(),
    issuer: z
      .string()
      .regex(xrpAddressRegex, "Invalid issuer address")
      .optional(),
    destinationTag: z
      .number()
      .int("Destination tag must be an integer")
      .min(0, "Destination tag must be non-negative")
      .max(
        MAX_DESTINATION_TAG,
        `Destination tag must not exceed ${MAX_DESTINATION_TAG}`,
      )
      .optional(),
    memo: z
      .string()
      .max(1024, "Memo must be at most 1024 characters")
      .optional(),
    fee: z
      .string()
      .regex(/^\d+$/, "Fee must be a non-negative integer string in drops")
      .optional(),
  })
  .refine((data) => data.source !== data.destination, {
    message: "Source and destination must be different addresses",
    path: ["destination"],
  })
  .refine(
    (data) => {
      // If currency is provided (non-XRP), issuer must also be provided
      if (data.currency && data.currency !== "XRP" && !data.issuer) {
        return false;
      }
      return true;
    },
    {
      message: "Issuer is required for non-XRP currencies",
      path: ["issuer"],
    },
  );

export const TransactionResultSchema = z.object({
  hash: z
    .string()
    .regex(/^[0-9A-F]{64}$/i, "Transaction hash must be 64 hex characters"),
  ledgerIndex: z.number().int().positive().optional(),
  status: TransactionStatusSchema,
  resultCode: z.string().min(1, "Result code must not be empty"),
  resultMessage: z.string(),
  submittedAt: z
    .string()
    .datetime({ message: "submittedAt must be a valid ISO 8601 datetime" }),
  fee: z
    .string()
    .regex(/^\d+$/, "Fee must be a non-negative integer string in drops"),
});

export const HumanReadableTransactionSchema = z.object({
  summary: z.string().min(1, "Summary must not be empty"),
  description: z.string().min(1, "Description must not be empty"),
  type: z.string().min(1, "Type must not be empty"),
  warnings: z.array(z.string()),
});

export type TransactionRequestInput = z.input<typeof TransactionRequestSchema>;
export type TransactionResultInput = z.input<typeof TransactionResultSchema>;
export type HumanReadableTransactionInput = z.input<
  typeof HumanReadableTransactionSchema
>;
