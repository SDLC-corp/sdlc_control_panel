import express from 'express';
import cors from 'cors';
import {
  db,
  createId,
  nowIso,
  seedProducts,
  findProductByCode,
  findCustomerByEmail,
  findInstanceByDbUuid,
  findInstallationByInstanceAndProduct,
  findEntitlementByInstallationId
} from './data/store.js';
import { addAuditLog } from './services/auditService.js';
import installationsRouter from './routes/installations.js';
import entitlementsRouter from './routes/entitlements.js';
import supportRouter from './routes/support.js';
import healthRouter from './routes/health.js';
import releasesRouter from './routes/releases.js';
import auditRouter from './routes/audit.js';
import commandsRouter from './routes/commands.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
seedProducts();

function createCustomerIfMissing({ companyName, companyEmail }) {
  let customer = findCustomerByEmail(companyEmail);

  if (!customer) {
    customer = {
      id: createId(),
      name: companyName || 'Unknown company',
      email: companyEmail || null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.customers.set(customer.id, customer);
  }

  return customer;
}

function createInstanceIfMissing({ customerId, dbUuid, baseUrl, odooVersion }) {
  let instance = findInstanceByDbUuid(dbUuid);

  if (!instance) {
    instance = {
      id: createId(),
      customerId,
      dbUuid,
      baseUrl,
      odooVersion: odooVersion || 'unknown',
      lastSeenAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.instances.set(instance.id, instance);
  }

  return instance;
}

function issueEntitlement(product) {
  const isFree = product.isFreeByDefault;

  return {
    id: createId(),
    state: isFree ? 'free' : 'trial',
    planCode: isFree ? 'free' : 'trial',
    planVersion: '1',
    billingMode: isFree ? 'free' : 'subscription',
    trialStartedAt: isFree ? null : nowIso(),
    trialEndsAt: isFree ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    startsAt: nowIso(),
    expiresAt: isFree ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    graceEndsAt: null,
    isGrandfathered: false,
    manualOverride: false,
    manualOverrideReason: null,
    overrideActor: null,
    overrideAt: null,
    lastEntitlementIssuedAt: nowIso(),
    lastEntitlementVerifiedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

function registerModules(payload) {
  const customer = createCustomerIfMissing(payload);
  const instance = createInstanceIfMissing({
    customerId: customer.id,
    dbUuid: payload.dbUuid,
    baseUrl: payload.baseUrl,
    odooVersion: payload.odooVersion
  });

  const registered = [];

  for (const moduleCode of payload.modules || []) {
    const product = findProductByCode(moduleCode);

    if (!product) {
      registered.push({
        productCode: moduleCode,
        status: 'skipped',
        reason: 'Unknown product code'
      });
      continue;
    }

    const existing = findInstallationByInstanceAndProduct(instance.id, product.id);

    if (existing) {
      registered.push({
        installationId: existing.id,
        productCode: moduleCode,
        status: 'already_registered'
      });
      continue;
    }

    const installation = {
      id: createId(),
      customerId: customer.id,
      instanceId: instance.id,
      productId: product.id,
      installedVersion: product.minimumSupportedVersion,
      latestAvailableVersion: product.latestVersion,
      odooVersion: instance.odooVersion,
      releaseChannel: product.defaultReleaseChannel,
      upgradeNeeded: false,
      upgradePriority: 'low',
      migrationRequired: false,
      securityPatchRequired: false,
      compatibilityStatus: product.supportedOdoo.includes(instance.odooVersion)
        ? 'compatible'
        : 'warning',
      heartbeatStatus: 'healthy',
      healthStatus: 'healthy',
      failureStreak: 0,
      lastErrorCode: null,
      lastErrorMessage: null,
      lastHeartbeatAt: null,
      needsAttention: false,
      manualAttentionNeeded: false,
      installedAt: nowIso(),
      lastUpgradeAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    db.installations.set(installation.id, installation);

    const entitlement = {
      ...issueEntitlement(product),
      installationId: installation.id
    };

    db.entitlements.set(entitlement.id, entitlement);

    addAuditLog({
      customerId: customer.id,
      instanceId: instance.id,
      installationId: installation.id,
      entityType: 'installation',
      entityId: installation.id,
      action: 'created',
      newValue: installation
    });

    addAuditLog({
      customerId: customer.id,
      instanceId: instance.id,
      installationId: installation.id,
      entityType: 'entitlement',
      entityId: entitlement.id,
      action: 'issued',
      newValue: entitlement
    });

    registered.push({
      installationId: installation.id,
      productCode: moduleCode,
      status: 'registered',
      entitlementState: entitlement.state
    });
  }

  return {
    customerId: customer.id,
    instanceId: instance.id,
    registered
  };
}

app.get("/", (req, res) => {
	res.send("Server is running....");
});


app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sdlc-control-plane', time: nowIso() });
});

app.post('/api/register', (req, res) => {
  const { dbUuid, baseUrl } = req.body;

  if (!dbUuid || !baseUrl) {
    return res.status(400).json({ error: 'dbUuid and baseUrl are required' });
  }

  const result = registerModules({
    companyName: req.body.companyName,
    companyEmail: req.body.companyEmail,
    dbUuid,
    baseUrl,
    odooVersion: req.body.odooVersion || '17.0',
    modules: req.body.modules || []
  });

  return res.json({ ok: true, ...result });
});

app.post('/api/demo/bootstrap', (_req, res) => {
  const seed = Math.floor(Math.random() * 10000);

  const result = registerModules({
    companyName: `Demo Customer ${seed}`,
    companyEmail: `demo-${seed}@example.com`,
    dbUuid: `db-${seed}`,
    baseUrl: `https://demo-${seed}.example.com`,
    odooVersion: '17.0',
    modules: ['sdlc_shopify_connector', 'project_costing', 'sdlc_emp_dashboard']
  });

  return res.status(201).json({ ok: true, ...result });
});

app.post('/api/heartbeat', (req, res) => {
  const { instanceId, appMetrics = {} } = req.body;
  const instance = db.instances.get(instanceId);

  if (!instance) {
    return res.status(404).json({ error: 'Instance not found' });
  }

  const installations = Array.from(db.installations.values()).filter(
    (installation) => installation.instanceId === instanceId
  );

  instance.lastSeenAt = nowIso();
  instance.updatedAt = nowIso();

  for (const installation of installations) {
    const metrics = appMetrics[installation.id] || {};
    const success = metrics.status !== 'failure';

    installation.lastHeartbeatAt = nowIso();
    installation.heartbeatStatus = 'healthy';
    installation.healthStatus = success ? 'healthy' : 'failing';
    installation.failureStreak = success ? 0 : (installation.failureStreak || 0) + 1;
    installation.lastErrorCode = success ? null : metrics.errorCode || 'APP_FAILURE';
    installation.lastErrorMessage = success ? null : metrics.errorMessage || 'Unknown failure';
    installation.needsAttention = installation.failureStreak > 2;
    installation.updatedAt = nowIso();

    db.installationHealthLogs.push({
      id: createId(),
      installationId: installation.id,
      eventType: 'heartbeat',
      status: success ? 'success' : 'failure',
      errorCode: installation.lastErrorCode,
      errorMessage: installation.lastErrorMessage,
      failureStreak: installation.failureStreak,
      recordedAt: nowIso()
    });

    const usage = Array.isArray(metrics.usage) ? metrics.usage : [];
    for (const metric of usage) {
      db.usageMetrics.push({
        id: createId(),
        installationId: installation.id,
        metricKey: metric.metricKey,
        metricValue: metric.metricValue,
        recordedAt: metric.recordedAt || nowIso()
      });
    }
  }

  db.heartbeatLogs.push({
    id: createId(),
    instanceId,
    payload: req.body,
    receivedAt: nowIso()
  });

  return res.json({
    ok: true,
    entitlements: installations.map((installation) => {
      const entitlement = findEntitlementByInstallationId(installation.id);
      return {
        installationId: installation.id,
        state: entitlement?.state || 'free',
        planCode: entitlement?.planCode || 'free',
        expiresAt: entitlement?.expiresAt || null
      };
    })
  });
});

app.get('/api/dashboard', (_req, res) => {
  const installations = Array.from(db.installations.values());
  const entitlements = Array.from(db.entitlements.values());

  res.json({
    summary: {
      totalCustomers: db.customers.size,
      totalInstances: db.instances.size,
      totalInstallations: installations.length,
      free: entitlements.filter((row) => row.state === 'free').length,
      trial: entitlements.filter((row) => row.state === 'trial').length,
      active: entitlements.filter((row) => row.state === 'active').length,
      expired: entitlements.filter((row) => row.state === 'expired').length,
      suspended: entitlements.filter((row) => row.state === 'suspended').length,
      needsAttention: installations.filter((row) => row.needsAttention).length,
      upgradeNeeded: installations.filter((row) => row.upgradeNeeded).length
    }
  });
});

app.use('/api/installations', installationsRouter);
app.use('/api/entitlements', entitlementsRouter);
app.use('/api/support', supportRouter);
app.use('/api/health', healthRouter);
app.use('/api/releases', releasesRouter);
app.use('/api/audit-logs', auditRouter);
app.use('/api/commands', commandsRouter);

app.listen(PORT, () => {
  console.log(`IT s changing API listening on http://localhost:${PORT}`);
});
