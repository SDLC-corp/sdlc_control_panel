import crypto from 'node:crypto';

export const db = {
  customers: new Map(),
  instances: new Map(),
  products: new Map(),
  installations: new Map(),
  entitlements: new Map(),
  supportNotes: new Map(),
  remoteCommands: new Map(),
  heartbeatLogs: [],
  installationHealthLogs: [],
  usageMetrics: [],
  auditLogs: []
};

export function nowIso() {
  return new Date().toISOString();
}

export function createId() {
  return crypto.randomUUID();
}

export function seedProducts() {
  if (db.products.size > 0) {
    return;
  }

  const products = [
    {
      code: 'sdlc_shopify_connector',
      name: 'Shopify Connector',
      appType: 'paid',
      isFreeByDefault: false,
      latestVersion: '1.2.0',
      minimumSupportedVersion: '1.0.0',
      defaultReleaseChannel: 'stable',
      supportedOdoo: ['16.0', '17.0']
    },
    {
      code: 'project_costing',
      name: 'Project Costing',
      appType: 'hybrid',
      isFreeByDefault: true,
      latestVersion: '2.0.0',
      minimumSupportedVersion: '1.5.0',
      defaultReleaseChannel: 'stable',
      supportedOdoo: ['16.0', '17.0']
    },
    {
      code: 'sdlc_emp_dashboard',
      name: 'Employee Dashboard',
      appType: 'free',
      isFreeByDefault: true,
      latestVersion: '1.0.0',
      minimumSupportedVersion: '1.0.0',
      defaultReleaseChannel: 'stable',
      supportedOdoo: ['16.0', '17.0']
    }
  ];

  for (const product of products) {
    const id = createId();
    db.products.set(id, {
      id,
      ...product,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  }
}

export function findProductByCode(code) {
  return Array.from(db.products.values()).find((product) => product.code === code) || null;
}

export function findCustomerByEmail(email) {
  if (!email) {
    return null;
  }
  return Array.from(db.customers.values()).find((customer) => customer.email === email) || null;
}

export function findInstanceByDbUuid(dbUuid) {
  return Array.from(db.instances.values()).find((instance) => instance.dbUuid === dbUuid) || null;
}

export function findInstallationByInstanceAndProduct(instanceId, productId) {
  return (
    Array.from(db.installations.values()).find(
      (installation) => installation.instanceId === instanceId && installation.productId === productId
    ) || null
  );
}

export function findEntitlementByInstallationId(installationId) {
  return (
    Array.from(db.entitlements.values()).find(
      (entitlement) => entitlement.installationId === installationId
    ) || null
  );
}

export function getInstallationWithRelations(installation) {
  return {
    ...installation,
    customer: db.customers.get(installation.customerId) || null,
    instance: db.instances.get(installation.instanceId) || null,
    product: db.products.get(installation.productId) || null,
    entitlement: findEntitlementByInstallationId(installation.id),
    supportNotes: Array.from(db.supportNotes.values()).filter(
      (note) => note.installationId === installation.id
    )
  };
}

export function getInstallationsWithRelations() {
  return Array.from(db.installations.values()).map(getInstallationWithRelations);
}
