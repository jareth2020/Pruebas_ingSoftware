const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://dolitest0.with7.dolicloud.com';
const USUARIO = 'admin';
const PASSWORD = 'MinEcraft_13';

// Sufijo único por ejecución para no chocar con registros previos
const RUN_ID = Date.now().toString().slice(-4);
const NOMBRE_CLIENTE = `Cliente Prueba QA ${RUN_ID}`;
const NOMBRE_PROVEEDOR = `Proveedor Suministros QA ${RUN_ID}`;

async function iniciarSesion(page) {
  await page.goto(`${BASE_URL}/`);
  await page.locator('input[name="username"]').fill(USUARIO);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="password"]').press('Enter');
}

test.describe('Módulo #2 - Clientes y Proveedores (Dolibarr)', () => {
  test('CP-01: Inicio de sesión y acceso al módulo de Terceros', async ({ page }) => {
    await iniciarSesion(page);
    await page.locator('#mainmenutd_companies').getByRole('link').filter({ hasText: /^$/ }).click();
    await expect(page).toHaveURL(/societe|index\.php/);
  });

  test('CP-02: Alta de un nuevo Cliente con datos válidos', async ({ page }) => {
    await iniciarSesion(page);
    await page.goto(`${BASE_URL}/societe/card.php?action=create&type=c`);

    await page.locator('#name').fill(NOMBRE_CLIENTE);

    const checkCliente = page.getByRole('checkbox', { name: /^(Cliente|Customer)$/i }).first();
    if (!(await checkCliente.isChecked())) {
      await checkCliente.check();
    }

    await page.locator('input[name="name_alias"]').fill(`QA${RUN_ID}`);
    await page.locator('#address').fill('Av. Hidalgo 402');
    await page.locator('#zipcode').fill('89100');
    await page.locator('#town').fill('Tampico');
    await page.locator('#phone').fill('8331234567');
    await page.locator('#phone_mobile').fill('8331234567');
    await page.locator('#email').fill(`cliente.${RUN_ID}@prueba.com`);
    await page.locator('#idprof1').fill('XAXX010101000');
    await page.locator('#idprof2').fill('B1234567108');

    await page.locator('input[type="submit"], button[type="submit"]').filter({
      hasText: /(crear tercero|create third party)/i
    }).first().click();

    await expect(page.locator('body')).toContainText(NOMBRE_CLIENTE);
  });

  test('CP-03: Validación al intentar guardar un tercero sin nombre', async ({ page }) => {
    await iniciarSesion(page);
    await page.goto(`${BASE_URL}/societe/card.php?action=create&type=c`);

    await page.locator('input[type="submit"], button[type="submit"]').filter({
      hasText: /(crear tercero|create third party)/i
    }).first().click();

    await expect(page).toHaveURL(/action=create|card\.php/);
  });

  test('CP-04: Búsqueda y filtrado del cliente creado en el listado', async ({ page }) => {
    await iniciarSesion(page);
    await page.goto(`${BASE_URL}/societe/list.php?type=c`);

    const filtroNombre = page.locator('input[name="search_nom"]');
    await filtroNombre.fill(NOMBRE_CLIENTE);
    await filtroNombre.press('Enter');

    await expect(page.locator('body')).toContainText(NOMBRE_CLIENTE);
  });

  test('CP-05: Edición de datos de contacto del Cliente', async ({ page }) => {
    await iniciarSesion(page);
    await page.goto(`${BASE_URL}/societe/list.php?type=c`);

    const filtroNombre = page.locator('input[name="search_nom"]');
    await filtroNombre.fill(NOMBRE_CLIENTE);
    await filtroNombre.press('Enter');

    await page.getByRole('link', { name: NOMBRE_CLIENTE }).first().click();
    await page.getByRole('link', { name: /^(Modificar|Modify)$/i }).first().click();

    await page.locator('#phone').fill('8339876543');
    await page.locator('#email').fill(`editado.${RUN_ID}@prueba.com`);

    await page.locator('input[type="submit"], button[type="submit"]').filter({
      hasText: /(guardar|save)/i
    }).first().click();

    await expect(page.locator('body')).toContainText('8339876543');
    await expect(page.locator('body')).toContainText(`editado.${RUN_ID}@prueba.com`);
  });

  test('CP-06: Alta y consulta de un nuevo Proveedor', async ({ page }) => {
    await iniciarSesion(page);
    await page.goto(`${BASE_URL}/societe/card.php?action=create&type=f`);

    await page.locator('#name').fill(NOMBRE_PROVEEDOR);

    const checkProveedor = page.getByRole('checkbox', { name: /^(Proveedor|Vendor)$/i }).first();
    if (!(await checkProveedor.isChecked())) {
      await checkProveedor.check();
    }

    await page.locator('#address').fill('Calle Reforma 115');
    await page.locator('#zipcode').fill('89000');
    await page.locator('#town').fill('Tampico');
    await page.locator('#phone').fill('8335550199');
    await page.locator('#email').fill(`ventas.${RUN_ID}@proveedor.com`);
    await page.locator('#idprof1').fill('PSQ020202BBB');

    await page.locator('input[type="submit"], button[type="submit"]').filter({
      hasText: /(crear tercero|create third party)/i
    }).first().click();

    await expect(page.locator('body')).toContainText(NOMBRE_PROVEEDOR);

    // Verificar en listado de proveedores
    await page.goto(`${BASE_URL}/societe/list.php?type=f`);
    const filtroProveedor = page.locator('input[name="search_nom"]');
    await filtroProveedor.fill(NOMBRE_PROVEEDOR);
    await filtroProveedor.press('Enter');
    await expect(page.locator('body')).toContainText(NOMBRE_PROVEEDOR);
  });

  test('CP-07: Eliminación de registros de prueba (Cliente y Proveedor)', async ({ page }) => {
    await iniciarSesion(page);

    const objetivos = [
      { nombre: NOMBRE_CLIENTE, tipo: 'c', url: `${BASE_URL}/societe/list.php?type=c`, tipoCheckbox: /^(Cliente|Customer)$/i },
      { nombre: NOMBRE_PROVEEDOR, tipo: 'f', url: `${BASE_URL}/societe/list.php?type=f`, tipoCheckbox: /^(Proveedor|Vendor)$/i },
    ];

    for (const item of objetivos) {
      await page.goto(item.url);

      const filtro = page.locator('input[name="search_nom"]');
      await filtro.fill(item.nombre);
      await filtro.press('Enter');

      const registro = page.getByRole('link', { name: item.nombre, exact: true });
      if (await registro.count() === 0) {
        await page.goto(`${BASE_URL}/societe/card.php?action=create&type=${item.tipo}`);
        await page.locator('#name').fill(item.nombre);

        const checkTipo = page.getByRole('checkbox', { name: item.tipoCheckbox }).first();
        if (!(await checkTipo.isChecked())) {
          await checkTipo.check();
        }

        await page.locator('input[type="submit"], button[type="submit"]').filter({
          hasText: /(crear tercero|create third party)/i
        }).first().click();
        await expect(page.locator('body')).toContainText(item.nombre);

        await page.goto(item.url);
        await page.locator('input[name="search_nom"]').fill(item.nombre);
        await page.locator('input[name="search_nom"]').press('Enter');
      }

      await page.getByRole('link', { name: item.nombre }).first().click();

      const deleteAction = page.getByText(/^(delete|eliminar)$/i).first();
      await deleteAction.scrollIntoViewIfNeeded();

      const dialogPromise = page.waitForEvent('dialog', { timeout: 3000 })
        .then(async (dialog) => {
          await dialog.accept();
          return true;
        })
        .catch(() => false);
      const deletionComplete = page.waitForURL(/\/societe\/list\.php\?restore_lastsearch_values=1&delsoc=/);
      await deleteAction.click();

      if (!(await dialogPromise)) {
        const deleteConfirmation = page.locator('.ui-dialog:visible').filter({
          hasText: /delete|eliminar|eliminación|eliminacion/i
        });
        const confirmButton = deleteConfirmation.getByRole('button', {
          name: /^(yes|sí|si)$/i
        }).first();
        await confirmButton.click();
      }
      await deletionComplete;

      await page.goto(item.url);
      const filtroVerificacion = page.locator('input[name="search_nom"]');
      await filtroVerificacion.fill(item.nombre);
      await filtroVerificacion.press('Enter');
      await expect(page.locator('body')).not.toContainText(item.nombre);
    }
  });
});