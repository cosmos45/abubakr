// scripts/utils/components.js
export async function loadComponent(targetId, componentPath) {
    try {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            throw new Error(`Target element with id "${targetId}" not found`);
        }
        
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${componentPath}`);
        
        const html = await response.text();
        targetElement.innerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
        throw error;
    }
}
