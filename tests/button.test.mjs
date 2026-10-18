import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buttonVariants } from "../src/components/ui/button/Variants.ts";

const source = readFileSync(
  new URL("../src/components/ui/button/Button.astro", import.meta.url),
  "utf8",
);

test("button variants keep the site's colours, focus states, and reusable card styling", () => {
  const defaults = buttonVariants();
  assert.match(defaults, /bg-primary text-primary-foreground/);
  assert.match(defaults, /focus-visible:ring-ring/);
  assert.match(defaults, /disabled:opacity-50/);
  assert.match(
    buttonVariants({ variant: "outline", size: "lg" }),
    /border shadow-xs/,
  );
  assert.match(buttonVariants({ variant: "outline", size: "lg" }), /h-10/);
  assert.match(buttonVariants({ className: "min-h-11" }), /min-h-11/);
  for (const [size, expected] of [
    ["icon-sm", "size-8"],
    ["icon", "size-9"],
    ["icon-lg", "size-10"],
  ])
    assert.ok(buttonVariants({ size }).includes(expected));
});

test("native rendering uses href presence and defaults only actual buttons to type button", () => {
  assert.match(source, /rest.href !== undefined \? \(/);
  assert.match(source, /<a\b/);
  assert.match(source, /<button\b/);
  assert.match(source, /type=\{rest.type \?\? "button"\}/);
  assert.match(source, /href: string/);
  assert.match(source, /type\?: never/);
  assert.match(source, /disabled\?: never/);
  assert.equal((source.match(/\{\.\.\.rest\}/g) ?? []).length, 2);
});

test("Bejamas button keeps slots and data hooks without a wrapper, icon renderer, or client runtime", () => {
  assert.match(source, /Bejamas UI Button/);
  assert.match(source, /"data-slot": dataSlot = "button"/);
  assert.equal((source.match(/data-slot=\{dataSlot\}/g) ?? []).length, 2);
  assert.match(source, /data-variant=\{variant\}/);
  assert.match(source, /data-size=\{size\}/);
  assert.match(source, /<slot\s*\/>/);
  assert.doesNotMatch(
    source,
    /<script|<style|client:|set:html|DynamicIcon|<Element|React|@ts-/,
  );
  assert.match(source, /new Set\(`/);
  assert.match(source, /noopener noreferrer/);
});
