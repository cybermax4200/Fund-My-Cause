import {
  measureCoreWebVitals,
  getCoreWebVitals,
  measurePageLoadTime,
  getResourceTimings,
  reportPerformanceMetrics,
  markPerformance,
  measurePerformance,
} from "./performanceMonitoring";

describe("performanceMonitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("measureCoreWebVitals", () => {
    it("should call callback with metrics", () => {
      const callback = jest.fn();
      measureCoreWebVitals(callback);
      expect(callback).toHaveBeenCalled();
    });

    it("should include performance metrics", () => {
      const callback = jest.fn();
      measureCoreWebVitals(callback);
      const metrics = callback.mock.calls[0][0];
      expect(metrics).toBeDefined();
    });
  });

  describe("getCoreWebVitals", () => {
    it("should return core web vitals object", () => {
      const vitals = getCoreWebVitals();
      expect(vitals).toHaveProperty("lcp");
      expect(vitals).toHaveProperty("fid");
      expect(vitals).toHaveProperty("cls");
    });

    it("should have null values initially", () => {
      const vitals = getCoreWebVitals();
      expect(vitals.lcp === null || typeof vitals.lcp === "number").toBe(true);
      expect(vitals.fid === null || typeof vitals.fid === "number").toBe(true);
      expect(vitals.cls === null || typeof vitals.cls === "number").toBe(true);
    });
  });

  describe("measurePageLoadTime", () => {
    it("should return number", () => {
      const time = measurePageLoadTime();
      expect(typeof time).toBe("number");
    });

    it("should return non-negative value", () => {
      const time = measurePageLoadTime();
      expect(time).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getResourceTimings", () => {
    it("should return array", () => {
      const timings = getResourceTimings();
      expect(Array.isArray(timings)).toBe(true);
    });
  });

  describe("reportPerformanceMetrics", () => {
    it("should send metrics to endpoint", async () => {
      const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("ok")
      );

      const metrics = { fcp: 100, lcp: 200 };
      await reportPerformanceMetrics("/api/metrics", metrics);

      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/metrics",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );

      fetchSpy.mockRestore();
    });

    it("should handle fetch errors", async () => {
      const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValueOnce(
        new Error("Network error")
      );

      const metrics = { fcp: 100 };
      await reportPerformanceMetrics("/api/metrics", metrics);

      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("markPerformance", () => {
    it("should create performance mark", () => {
      const markSpy = jest.spyOn(performance, "mark");
      markPerformance("test-mark");
      expect(markSpy).toHaveBeenCalledWith("test-mark");
      markSpy.mockRestore();
    });
  });

  describe("measurePerformance", () => {
    it("should measure between marks", () => {
      performance.mark("start");
      performance.mark("end");

      const duration = measurePerformance("test", "start", "end");
      expect(typeof duration).toBe("number");
    });

    it("should return 0 on error", () => {
      const duration = measurePerformance("test", "nonexistent", "marks");
      expect(duration).toBe(0);
    });
  });
});
