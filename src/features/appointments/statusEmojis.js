export function getStatusWithEmoji(status) {
  switch (status) {
    case "PENDING":
      return "PENDING ⏳";
    case "COMPLETED":
      return "COMPLETED ✅";
    case "CANCELLED":
      return "CANCELLED ❌";
    case "CONFIRMED":
      return "CONFIRMED ✅";
    case "NO_SHOW":
      return "NO SHOW ❌";
    default:
      return status;
  }
}
