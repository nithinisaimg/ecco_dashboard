import React, { useState } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ExternalLink,
} from 'lucide-react';
import { API_BASE_URL, apiClient } from '../../services/api-client';

interface EndpointTest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  status?: number;
  latencyMs?: number;
  response?: unknown;
  error?: string;
  isTesting?: boolean;
}

export const DiagnosticsView: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointTest[]>([
    {
      path: '/api/health',
      method: 'GET',
      description: 'System health check and PostgreSQL connection status',
    },
    {
      path: '/api/dashboard',
      method: 'GET',
      description: 'Aggregated KPI metrics and recent market alerts',
    },
    {
      path: '/api/commodities',
      method: 'GET',
      description: 'Raw materials, unit prices, and lead time days',
    },
    {
      path: '/api/skus',
      method: 'GET',
      description: 'Finished footwear styles and target inventory',
    },
    {
      path: '/api/suppliers',
      method: 'GET',
      description: 'Global tanneries, ESG ratings, and on-time performance',
    },
    {
      path: '/api/purchases',
      method: 'GET',
      description: 'Procurement transaction history and active purchase orders',
    },
    {
      path: '/api/forecasts',
      method: 'GET',
      description: 'Statistical and ML model runs and prediction points',
    },
    {
      path: '/api/recommendations',
      method: 'GET',
      description: 'Algorithmic procurement advice and optimization actions',
    },
  ]);

  const [activePayload, setActivePayload] = useState<{
    path: string;
    data: unknown;
  } | null>(null);

  const testEndpoint = async (index: number) => {
    const ep = endpoints[index];
    const updated = [...endpoints];
    updated[index] = { ...ep, isTesting: true, error: undefined, status: undefined };
    setEndpoints(updated);

    const startTime = performance.now();
    try {
      const res = await apiClient.get(ep.path, { timeoutMs: 5000 });
      const latencyMs = Math.round(performance.now() - startTime);
      setEndpoints((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          isTesting: false,
          status: 200,
          latencyMs,
          response: res,
        };
        return next;
      });
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const apiErr = err as { status?: number; message?: string; details?: unknown };
      setEndpoints((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          isTesting: false,
          status: apiErr.status ?? 0,
          latencyMs,
          error: apiErr.message || 'Network failure',
          response: apiErr.details,
        };
        return next;
      });
    }
  };

  const testAll = async () => {
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">FastAPI Contract Verifier</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live diagnostic suite testing connection to Python FastAPI server at{' '}
            <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {API_BASE_URL}
            </code>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <span>Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            onClick={testAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Test All Endpoints
          </button>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <th className="p-3.5">Method</th>
              <th className="p-3.5">Endpoint Path</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Latency</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {endpoints.map((ep, idx) => (
              <tr key={ep.path} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-400 border border-sky-800/80">
                    {ep.method}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-white">{ep.path}</td>
                <td className="p-3.5 font-sans text-slate-400 text-xs">{ep.description}</td>
                <td className="p-3.5 text-center">
                  {ep.isTesting ? (
                    <span className="text-[11px] text-amber-400 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Testing...
                    </span>
                  ) : ep.status !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        ep.status === 200
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ep.status === 404
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {ep.status === 200 ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {ep.status === 0 ? 'OFFLINE' : ep.status}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[11px]">Untested</span>
                  )}
                </td>
                <td className="p-3.5 text-right">
                  {ep.latencyMs !== undefined ? (
                    <span className="text-slate-400">{ep.latencyMs}ms</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {ep.response !== undefined && (
                      <button
                        onClick={() => setActivePayload({ path: ep.path, data: ep.response })}
                        className="px-2 py-1 text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
                      >
                        Inspect Payload
                      </button>
                    )}
                    <button
                      onClick={() => testEndpoint(idx)}
                      disabled={ep.isTesting}
                      className="px-2.5 py-1 text-[11px] font-sans font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors disabled:opacity-40"
                    >
                      Ping
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* JSON Payload Inspector Drawer */}
      {activePayload && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-mono text-xs text-amber-400 font-bold">
              Response Payload: {activePayload.path}
            </span>
            <button
              onClick={() => setActivePayload(null)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>
          </div>
          <pre className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
            {JSON.stringify(activePayload.data, null, 2)}
          </pre>
        </div>
      )}

      {/* PostgreSQL Integration Architecture Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          Backend & PostgreSQL Architecture Blueprint
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          The frontend strictly obeys the separation of concerns contract: it communicates solely
          via standard HTTP/JSON requests with Python FastAPI. The FastAPI backend connects to
          PostgreSQL via SQLAlchemy models. Database credentials are NEVER exposed to the browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">1. FastAPI Server</span>
            <span className="text-slate-400 text-[11px]">
              Port: 8000
              <br />
              CORS: Allow http://localhost:5173
              <br />
              Swagger: /docs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">2. PostgreSQL Connection</span>
            <span className="text-slate-400 text-[11px]">
              Driver: psycopg2 / asyncpg
              <br />
              Host: localhost:5432
              <br />
              Managed in backend .env
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">3. Data Integrity</span>
            <span className="text-slate-400 text-[11px]">
              Zero mock data fallback
              <br />
              Typed schema contracts
              <br />
              Verified error telemetry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
