const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://backend.test";

type ApiResponse = {
  message: string;
  success: boolean;
};

async function getHello() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/hello`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: `Failed to load API: ${response.status}`,
      };
    }

    return {
      data: (await response.json()) as ApiResponse,
    };
  } catch {
    return {
      error: `Could not reach ${apiBaseUrl}`,
    };
  }
}

export default async function Home() {
  const result = await getHello();

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-16 text-neutral-900">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          Next.js to Laravel
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Simple API fetch</h1>
        <p className="mt-3 text-neutral-600">
          This page fetches data from your Laravel backend route
          <code className="mx-1 rounded bg-neutral-100 px-2 py-1 text-sm">
            /api/hello
          </code>
        </p>

        <div className="mt-8 rounded-2xl bg-neutral-950 p-6 text-neutral-50">
          <p className="text-sm text-neutral-400">API Base URL</p>
          <p className="mt-2 font-mono text-sm">{apiBaseUrl}</p>
          <p className="mt-6 text-sm text-neutral-400">Response</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm">
            {JSON.stringify(
              result.error
                ? { error: result.error }
                : result.data,
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </main>
  );
}
