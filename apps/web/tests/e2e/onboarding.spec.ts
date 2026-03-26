import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("should create a new wallet through the onboarding flow", async ({
    page,
  }) => {
    await page.goto("/wallet");

    // Landing page should show the create wallet CTA
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();

    // Start wallet creation
    const createButton = page.getByRole("button", {
      name: /create your wallet/i,
    });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Step 1: Accept terms / security notice
    await expect(page.getByText(/security/i)).toBeVisible();
    const acknowledgeButton = page.getByRole("button", {
      name: /continue|acknowledge|accept/i,
    });
    if (await acknowledgeButton.isVisible()) {
      await acknowledgeButton.click();
    }

    // Step 2: Recovery phrase display
    await expect(
      page.getByText(/recovery phrase|seed phrase|backup/i)
    ).toBeVisible();

    // Verify 12 or 24 mnemonic words are displayed
    const wordElements = page.locator("[data-testid^='mnemonic-word-']");
    const wordCount = await wordElements.count();
    expect([12, 24]).toContain(wordCount);

    // Proceed past recovery phrase
    const savedButton = page.getByRole("button", {
      name: /saved|continue|next/i,
    });
    await expect(savedButton).toBeVisible();
    await savedButton.click();

    // Step 3: Confirm recovery phrase (select words in correct order)
    const confirmationStep = page.getByText(/confirm|verify/i);
    if (await confirmationStep.isVisible()) {
      // Click through confirmation - the specific implementation varies
      const confirmButton = page.getByRole("button", {
        name: /confirm|verify|done/i,
      });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }

    // Wallet should be created - verify we see the wallet dashboard
    await expect(
      page.getByText(/wallet|balance|portfolio/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should show import wallet option", async ({ page }) => {
    await page.goto("/wallet");

    const importLink = page.getByRole("button", {
      name: /import|restore|recover/i,
    });
    await expect(importLink).toBeVisible();
  });
});
