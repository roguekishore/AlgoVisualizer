/**
 * Unit tests for judgeApi.traceCode()
 * Verifies: resolves parsed TraceResult on 200, rejects with a derived Error
 * on non-2xx, and does not mutate the provided payload.
 */
import { traceCode } from "./judgeApi";

describe("traceCode", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  function mockFetch(impl) {
    global.fetch = jest.fn(impl);
  }

  test("POSTs to /api/trace with language, code, and input", async () => {
    const result = { status: "OK", steps: [] };
    mockFetch(async () => ({ ok: true, json: async () => result }));

    await traceCode({ language: "cpp", code: "int main(){}", input: "5\n" });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/trace$/);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      language: "cpp",
      code: "int main(){}",
      input: "5\n",
    });
  });

  test("defaults input to empty string when omitted", async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }));

    await traceCode({ language: "java", code: "class A{}" });

    const [, options] = global.fetch.mock.calls[0];
    expect(JSON.parse(options.body).input).toBe("");
  });

  test("resolves with the parsed TraceResult on 200", async () => {
    const result = { status: "OK", blockTree: { id: "b0" }, steps: [{ index: 0 }] };
    mockFetch(async () => ({ ok: true, json: async () => result }));

    await expect(
      traceCode({ language: "cpp", code: "x", input: "" })
    ).resolves.toEqual(result);
  });

  test("rejects with the server-provided error message on non-2xx", async () => {
    mockFetch(async () => ({
      ok: false,
      json: async () => ({ error: "Unsupported language. Use 'cpp' or 'java'." }),
    }));

    await expect(
      traceCode({ language: "py", code: "print(1)", input: "" })
    ).rejects.toThrow("Unsupported language. Use 'cpp' or 'java'.");
  });

  test("rejects with a default message when body has no error field", async () => {
    mockFetch(async () => ({ ok: false, json: async () => ({}) }));

    await expect(
      traceCode({ language: "cpp", code: "", input: "" })
    ).rejects.toThrow("Trace failed");
  });

  test("rejects with a default message when body is not JSON", async () => {
    mockFetch(async () => ({
      ok: false,
      json: async () => {
        throw new Error("invalid json");
      },
    }));

    await expect(
      traceCode({ language: "cpp", code: "x", input: "" })
    ).rejects.toThrow("Trace failed");
  });

  test("does not mutate the provided payload", async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }));

    const payload = { language: "cpp", code: "int main(){}", input: "1 2 3" };
    const snapshot = JSON.parse(JSON.stringify(payload));

    await traceCode(payload);

    expect(payload).toEqual(snapshot);
  });
});
