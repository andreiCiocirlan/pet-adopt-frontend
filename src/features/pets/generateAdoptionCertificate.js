import { jsPDF } from "jspdf";

const generateAdoptionCertificate = (pet) => {
  const doc = new jsPDF();

  // Background: soft pastel
  doc.setFillColor(245, 245, 250); // Lavender blush
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

  // Decorative border
  doc.setDrawColor(70, 130, 180); // Steel Blue
  doc.setLineWidth(2);
  doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

  // Header block with solid banner
  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, doc.internal.pageSize.width, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Pet Adoption Certificate", doc.internal.pageSize.width / 2, 30, { align: "center" });

  // Main text
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(
    `This certifies that the pet named "${pet.name}"`,
    20,
    70
  );
  doc.text(
    `has found a loving forever home!`,
    20,
    80
  );

  // Characteristics
  if (pet.characteristics) {
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("Pet Characteristics:", 20, 100);
    const splitText = doc.splitTextToSize(pet.characteristics, 170);
    doc.text(splitText, 20, 110);
  }

  // Adoption date below text block
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Adoption Date: ${new Date().toLocaleDateString()}`, 20, 155);

  // Thank you note
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 150);
  doc.text(
    "Thank you for giving this pet a second chance and a new loving family.",
    20,
    170
  );

  // Footer with shelter info from nested clinic object
  if (pet.clinic) {
    const clinic = pet.clinic;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Shelter: ${clinic.name} | Phone: ${clinic.phoneNumber || clinic.phone || "N/A"}`,
      20,
      doc.internal.pageSize.height - 30
    );
  }
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Authorized Signature: ____________________",
    20,
    doc.internal.pageSize.height - 18
  );

  // Save the PDF
  doc.save(`Adoption_Certificate_${pet.name}.pdf`);
};

export default generateAdoptionCertificate;
