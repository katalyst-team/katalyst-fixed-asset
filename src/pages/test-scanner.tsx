import type { GetServerSideProps } from "next";
import { useState } from "react";

interface ApiResult {
  status?: number;
  data?: unknown;
  error?: string;
  versionCode?: number;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function TestScannerAPI() {
  const [versionResult, setVersionResult] = useState<ApiResult | null>(null);
  const [updateResult, setUpdateResult] = useState<ApiResult | null>(null);
  const [versionCode, setVersionCode] = useState(95);
  const [loading, setLoading] = useState(false);

  const testVersion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scanner/version");
      const data = await response.json();
      setVersionResult({ data, status: response.status });
    } catch (error) {
      setVersionResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setLoading(false);
  };

  const testUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/scanner/simple-update?versionCode=${versionCode}`
      );
      const data = await response.json();
      setUpdateResult({ data, status: response.status, versionCode });
    } catch (error) {
      setUpdateResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Scanner App API Tester</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          margin: "20px 0",
          padding: "20px",
        }}
      >
        <h2>1. Get Version (Simple)</h2>
        <p>
          <code>GET /api/scanner/version</code>
        </p>
        <button
          disabled={loading}
          style={{ cursor: "pointer", padding: "10px 20px" }}
          onClick={testVersion}
        >
          {loading ? "Loading..." : "Test Version API"}
        </button>

        {versionResult && (
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: "3px",
              margin: "10px 0",
              padding: "10px",
            }}
          >
            {versionResult.error ? (
              <p style={{ color: "red" }}>Error: {versionResult.error}</p>
            ) : (
              <>
                <h4>Status: {versionResult.status}</h4>
                <pre
                  style={{
                    background: "#eee",
                    borderRadius: "3px",
                    overflowX: "auto",
                    padding: "10px",
                  }}
                >
                  {JSON.stringify(versionResult.data, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          margin: "20px 0",
          padding: "20px",
        }}
      >
        <h2>2. Check Update (Simple)</h2>
        <p>
          <code>GET /api/scanner/simple-update?versionCode=X</code>
        </p>

        <div style={{ margin: "10px 0" }}>
          <label>Version Code: </label>
          <input
            placeholder="Version Code (e.g., 95)"
            style={{ margin: "5px", padding: "8px" }}
            type="number"
            value={versionCode}
            onChange={(e) => setVersionCode(Number(e.target.value))}
          />
          <button
            disabled={loading}
            style={{ cursor: "pointer", margin: "5px", padding: "10px 20px" }}
            onClick={testUpdate}
          >
            {loading ? "Loading..." : "Test Update API"}
          </button>
        </div>

        <div style={{ color: "#666", fontSize: "14px", margin: "10px 0" }}>
          <p>
            <strong>Test Scenarios:</strong>
          </p>
          <button
            style={{ margin: "2px", padding: "5px 10px" }}
            onClick={() => setVersionCode(95)}
          >
            95 (Update Available)
          </button>
          <button
            style={{ margin: "2px", padding: "5px 10px" }}
            onClick={() => setVersionCode(80)}
          >
            80 (Force Update)
          </button>
          <button
            style={{ margin: "2px", padding: "5px 10px" }}
            onClick={() => setVersionCode(100)}
          >
            100 (Up to Date)
          </button>
        </div>

        {updateResult && (
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: "3px",
              margin: "10px 0",
              padding: "10px",
            }}
          >
            {updateResult.error ? (
              <p style={{ color: "red" }}>Error: {updateResult.error}</p>
            ) : (
              <>
                <h4>Status: {updateResult.status}</h4>
                <h4>Testing with Version Code: {updateResult.versionCode}</h4>
                <pre
                  style={{
                    background: "#eee",
                    borderRadius: "3px",
                    overflowX: "auto",
                    padding: "10px",
                  }}
                >
                  {JSON.stringify(updateResult.data, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          background: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "5px",
          margin: "20px 0",
          padding: "20px",
        }}
      >
        <h3>📋 API Summary</h3>
        <ul>
          <li>
            <code>/api/scanner/version</code> - Get latest version & download
            URL
          </li>
          <li>
            <code>/api/scanner/simple-update</code> - Check if update needed
          </li>
        </ul>

        <h4>🔧 Configuration</h4>
        <p>
          Edit <code>/src/constants/simple-version.ts</code> to update version
          info
        </p>

        <h4>📖 Documentation</h4>
        <p>
          Check <code>SIMPLE_API_DOCS.md</code> for complete API documentation
        </p>
      </div>
    </div>
  );
}
