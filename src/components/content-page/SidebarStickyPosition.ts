// Short cards stick below the header. Tall cards first scroll with the page,
// then stick with their bottom edge visible, without an inner scrollbar.
// Below lg, the CSS top inset is auto (NaN), so no JS breakpoint is duplicated.
export function getStickySidebarTop({
  viewportHeight,
  top,
  cardHeight,
  bottomGap,
  headerBottom,
}: {
  viewportHeight: number;
  top: number;
  cardHeight: number;
  bottomGap: number;
  headerBottom: number;
}): number | undefined {
  if (
    ![viewportHeight, top, cardHeight, bottomGap, headerBottom].every(
      Number.isFinite,
    ) ||
    cardHeight <= 0 ||
    bottomGap < 0 ||
    viewportHeight <= headerBottom + bottomGap ||
    top < headerBottom + bottomGap
  )
    return undefined;
  return Math.min(top, viewportHeight - bottomGap - cardHeight);
}
