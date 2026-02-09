import { describe, expect, it } from "vitest";

describe("Supabase Configuration", () => {
  it("should have valid Supabase environment variables", () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).toContain("supabase.co");
    expect(supabaseAnonKey).toBeDefined();
    expect(supabaseAnonKey).toContain("eyJ");
  });

  it("should validate JWT token format", () => {
    const token = process.env.VITE_SUPABASE_ANON_KEY;
    const parts = token?.split(".");
    
    expect(parts).toHaveLength(3);
    expect(parts?.[0]).toBeDefined();
    expect(parts?.[1]).toBeDefined();
    expect(parts?.[2]).toBeDefined();
  });
});
