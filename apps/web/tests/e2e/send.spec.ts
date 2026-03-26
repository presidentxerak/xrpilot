import { test, expect } from "@playwright/test";

test.describe("Send Transaction", () => {
  test.beforeEach(async ({ page }) => {
    // Seed the app with a test wallet via localStorage or test API
    await page.goto("/wallet");
    await page.evaluate(() => {
      localStorage.setItem(
        "pilot-wallet-state",
        JSON.stringify({
          initialized: true,
          hasWallet: true,
        })
      );
    });
    await page.reload();
  });

  test("should show confirmation dialog with human-readable details", async ({
    page,
  }) => {
    // Navigate to send page
    const sendButton = page.getByRole("button", { name: /send/i });
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Wait for the send form to appear
    await expect(page.getByText(/send|transfer/i)).toBeVisible();

    // Enter recipient address (valid XRPL address format)
    const recipientInput = page.getByPlaceholder(/address|recipient|destination/i);
    await expect(recipientInput).toBeVisible();
    await recipientInput.fill("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe");

    // Enter amount
    const amountInput = page.getByPlaceholder(/amount|quantity/i);
    await expect(amountInput).toBeVisible();
    await amountInput.fill("10");

    // Submit the send form
    const reviewButton = page.getByRole("button", {
      name: /review|continue|next/i,
    });
    await expect(reviewButton).toBeEnabled();
    await reviewButton.click();

    // Verify confirmation dialog appears with human-readable text
    const confirmDialog = page.getByRole("dialog").or(
      page.locator("[data-testid='confirm-transaction']")
    );
    await expect(confirmDialog).toBeVisible({ timeout: 5_000 });

    // Should display the amount in readable format
    await expect(page.getByText(/10/)).toBeVisible();
    await expect(page.getByText(/XRP/i)).toBeVisible();

    // Should display the recipient address
    await expect(
      page.getByText(/rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe/)
    ).toBeVisible();

    // Should show network fee information
    await expect(page.getByText(/fee|cost/i)).toBeVisible();

    // Confirm button should be available
    const confirmButton = page.getByRole("button", {
      name: /confirm|send|sign/i,
    });
    await expect(confirmButton).toBeVisible();
  });

  test("should validate recipient address format", async ({ page }) => {
    const sendButton = page.getByRole("button", { name: /send/i });
    await sendButton.click();

    const recipientInput = page.getByPlaceholder(/address|recipient|destination/i);
    await recipientInput.fill("not-a-valid-address");

    // Trigger validation by moving focus away
    await recipientInput.blur();

    // Should show an error for invalid address
    await expect(page.getByText(/invalid|error/i)).toBeVisible({
      timeout: 3_000,
    });
  });

  test("should validate amount is positive", async ({ page }) => {
    const sendButton = page.getByRole("button", { name: /send/i });
    await sendButton.click();

    const amountInput = page.getByPlaceholder(/amount|quantity/i);
    await amountInput.fill("0");
    await amountInput.blur();

    await expect(
      page.getByText(/invalid|error|must be|greater/i)
    ).toBeVisible({ timeout: 3_000 });
  });
});
