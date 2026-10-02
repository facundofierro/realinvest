import { test, DEMO_STATE } from "../fixtures";
test.use({ storageState: DEMO_STATE });
test("dbg", async ({ page }) => {
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("CONSOLE", m.type(), m.text().slice(0, 1500)); });
  await page.goto("/project/torre-libertador-8000/units", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
});
