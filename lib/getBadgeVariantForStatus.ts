export function getBadgeVariantForStatus(status: string) {
  switch (status) {
    case "REPORTED":
      return "reported";
    case "IN_REVIEW":
      return "inReview";
    case "RESOLVED":
      return "resolved";
    case "CLOSED":
      return "closed";
    default:
      return "default";
  }
}
