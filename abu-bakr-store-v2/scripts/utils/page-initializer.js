// scripts/utils/page-initializer.js
import { loadComponent } from './components.js';

export async function initializeCommonComponents() {
    try {
        await Promise.all([
            loadComponent('header', '/abu-bakr-store-v2/components/header/header.html'),
            loadComponent('footer', '/abu-bakr-store-v2/components/footer/footer.html')
        ]);
    } catch (error) {
        console.error('Error initializing common components:', error);
    }
}
