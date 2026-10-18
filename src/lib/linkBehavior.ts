// Match the destination indicator to the actual navigation behavior.
export function getLinkBehavior(href: string) {
  const newTab = /^(?:https?:)?\/\//i.test(href);
  return {
    target: newTab ? ("_blank" as const) : undefined,
    rel: newTab ? "noopener noreferrer" : undefined,
    arrow: newTab ? "↗" : "→",
  };
}
