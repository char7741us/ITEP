import { expect, it } from "vitest";
import { saveProfile, getProfiles, getActiveUsername, setActiveUsername } from "./profileRepo";

it("reserves the daily-progress guest namespace and renames students without moving their data", () => {
  localStorage.clear();
  expect(() => saveProfile("Invitado", "guest")).toThrow("reservado");
  expect(getProfiles()).toEqual([]);
  const first = saveProfile("Ana", "ana");
  const renamed = saveProfile("Ana María", "ana");
  expect(renamed).toEqual({ ...first, name: "Ana María" });
  expect(getProfiles()).toHaveLength(1);
  expect(getActiveUsername()).toBe("ana");
  setActiveUsername(null);
  expect(getActiveUsername()).toBeNull();
});
