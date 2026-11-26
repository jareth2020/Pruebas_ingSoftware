const { test, expect } = require('@playwright/test');

test.describe('Módulo #2 - Clientes y Proveedores (Dolibarr)', () => {
  test('CP-01: Inicio de sesión y acceso al módulo de Terceros', async ({ page }) => {
    await page.goto('/');
    // Aquí iremos agregando los pasos verificados en Dolibarr
  });
});