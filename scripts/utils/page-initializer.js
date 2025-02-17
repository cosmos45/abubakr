// scripts/utils/page-initializer.js
import { loadComponent } from "./components.js";

export async function initializeCommonComponents() {
  try {
    await Promise.all([
      loadComponent("header", "/components/header/header.html"),
      loadComponent("footer", "/components/footer/footer.html"),
    ]);
  } catch (error) {
    console.error("Error initializing common components:", error);
  }
}
