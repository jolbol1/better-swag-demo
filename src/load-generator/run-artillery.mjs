import http from 'node:http';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parseNumber = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value || '', 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

const parseDurationToSeconds = rawValue => {
  if (!rawValue) {
    return 86400;
  }

  if (/^\d+$/.test(rawValue)) {
    return Number.parseInt(rawValue, 10);
  }

  const match = rawValue.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 86400;
  }

  const [, amountText, unit] = match;
  const amount = Number.parseInt(amountText, 10);
  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * multipliers[unit.toLowerCase()];
};

const escapeHtml = value =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const statusPort = parseNumber(process.env.LOADGEN_STATUS_PORT || process.env.LOCUST_WEB_PORT, 8089);
const target = (process.env.ARTILLERY_TARGET || process.env.LOCUST_HOST || 'http://better-swag.com').replace(/\/+$/, '');
const maxVusers = parseNumber(process.env.ARTILLERY_MAX_VUS || process.env.LOCUST_USERS, 10);
const arrivalRate = parseNumber(process.env.ARTILLERY_ARRIVAL_RATE || process.env.LOCUST_SPAWN_RATE, maxVusers);
const durationSeconds = parseDurationToSeconds(process.env.ARTILLERY_DURATION || '24h');
const headlessValue = process.env.ARTILLERY_HEADLESS ?? process.env.LOCUST_HEADLESS ?? 'true';
const headless = !['false', '0', 'no'].includes(String(headlessValue).toLowerCase());
const restartDelayMs = parseNumber(process.env.ARTILLERY_RESTART_DELAY_MS, 5000);
const logBufferLimit = 250;
const runtimeConfigPath = path.join(__dirname, 'artillery.generated.yml');
const artilleryBinPath = process.env.ARTILLERY_BIN || '/home/node/artillery/bin/run';

const status = {
  state: 'starting',
  startedAt: null,
  lastExitCode: null,
  restarts: 0,
  childPid: null,
  logLines: [],
  config: {
    target,
    statusPort,
    maxVusers,
    arrivalRate,
    durationSeconds,
    headless,
  },
};

let childProcess = null;
let shutdownRequested = false;

const pushLogLine = (stream, line) => {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} [${stream}] ${line}`;
  status.logLines.push(logLine);
  if (status.logLines.length > logBufferLimit) {
    status.logLines.shift();
  }
  console[stream === 'stderr' ? 'error' : 'log'](line);
};

const runtimeConfig = `config:
  target: ${JSON.stringify(target)}
  phases:
    - name: steady-browser
      duration: ${durationSeconds}
      arrivalRate: ${Math.max(1, arrivalRate)}
      maxVusers: ${Math.max(1, maxVusers)}
  engines:
    playwright:
      launchOptions:
        headless: ${headless}
      contextOptions:
        ignoreHTTPSErrors: true
      defaultTimeout: 15000
      defaultNavigationTimeout: 20000
  processor: "./artillery-funnel.cjs"
scenarios:
  - name: better-swag-browser-funnel
    engine: playwright
    testFunction: browserFunnel
`;

const startArtillery = async () => {
  await fs.writeFile(runtimeConfigPath, runtimeConfig, 'utf8');

  status.state = 'starting';
  status.startedAt = new Date().toISOString();

  childProcess = spawn(artilleryBinPath, ['run', runtimeConfigPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      ARTILLERY_DISABLE_TELEMETRY: process.env.ARTILLERY_DISABLE_TELEMETRY || 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  status.childPid = childProcess.pid;

  childProcess.stdout.setEncoding('utf8');
  childProcess.stderr.setEncoding('utf8');

  childProcess.stdout.on('data', chunk => {
    status.state = 'running';
    chunk
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach(line => pushLogLine('stdout', line));
  });

  childProcess.stderr.on('data', chunk => {
    chunk
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach(line => pushLogLine('stderr', line));
  });

  childProcess.on('exit', code => {
    status.childPid = null;
    status.lastExitCode = code;
    status.state = shutdownRequested ? 'stopped' : 'restarting';
    pushLogLine('stdout', `Artillery process exited with code ${code ?? 'null'}`);

    if (!shutdownRequested) {
      status.restarts += 1;
      setTimeout(() => {
        if (!shutdownRequested) {
          startArtillery().catch(error => {
            pushLogLine('stderr', `Unable to restart Artillery: ${error.stack || error.message}`);
          });
        }
      }, restartDelayMs);
    }
  });

  childProcess.on('error', error => {
    status.childPid = null;
    status.lastExitCode = null;
    status.state = 'error';
    pushLogLine('stderr', `Unable to launch Artillery: ${error.stack || error.message}`);

    if (!shutdownRequested) {
      status.restarts += 1;
      setTimeout(() => {
        if (!shutdownRequested) {
          startArtillery().catch(restartError => {
            pushLogLine('stderr', `Unable to restart Artillery: ${restartError.stack || restartError.message}`);
          });
        }
      }, restartDelayMs);
    }
  });
};

const renderHtml = () => {
  const logTail = status.logLines.slice(-80).join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Load Generator Status</title>
    <style>
      body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
      h1 { margin-top: 0; font-size: 24px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
      .card { background: #111827; border: 1px solid #334155; border-radius: 10px; padding: 14px; }
      .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
      .value { font-size: 16px; word-break: break-word; }
      pre { background: #020617; border: 1px solid #334155; border-radius: 10px; padding: 16px; overflow: auto; white-space: pre-wrap; }
      a { color: #7dd3fc; }
    </style>
  </head>
  <body>
    <h1>Load Generator Status</h1>
    <div class="grid">
      <div class="card"><div class="label">Engine</div><div class="value">Artillery + Playwright</div></div>
      <div class="card"><div class="label">State</div><div class="value">${escapeHtml(status.state)}</div></div>
      <div class="card"><div class="label">Target</div><div class="value">${escapeHtml(status.config.target)}</div></div>
      <div class="card"><div class="label">Max VUs</div><div class="value">${status.config.maxVusers}</div></div>
      <div class="card"><div class="label">Arrival Rate</div><div class="value">${status.config.arrivalRate}/s</div></div>
      <div class="card"><div class="label">Duration</div><div class="value">${status.config.durationSeconds}s</div></div>
      <div class="card"><div class="label">PID</div><div class="value">${status.childPid ?? 'n/a'}</div></div>
      <div class="card"><div class="label">Restarts</div><div class="value">${status.restarts}</div></div>
    </div>
    <p><a href="/status">JSON status</a></p>
    <pre>${escapeHtml(logTail || 'No logs yet.')}</pre>
  </body>
</html>`;
};

const server = http.createServer((request, response) => {
  if (!request.url) {
    response.writeHead(400).end();
    return;
  }

  if (request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, state: status.state }));
    return;
  }

  if (request.url === '/status') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(status, null, 2));
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(renderHtml());
});

const stopArtillery = signal => {
  shutdownRequested = true;
  status.state = 'stopping';

  if (childProcess && childProcess.exitCode === null) {
    childProcess.kill(signal);
  }

  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => stopArtillery('SIGTERM'));
process.on('SIGINT', () => stopArtillery('SIGINT'));

server.listen(statusPort, '0.0.0.0', async () => {
  pushLogLine('stdout', `Status server listening on 0.0.0.0:${statusPort}`);

  try {
    await startArtillery();
  } catch (error) {
    status.state = 'error';
    pushLogLine('stderr', `Unable to start Artillery: ${error.stack || error.message}`);
  }
});
