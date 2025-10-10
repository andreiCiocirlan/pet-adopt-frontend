import { jsPDF } from "jspdf";

const generateAdoptionCertificate = async (pet) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const imageWidth = 80;
  const imageHeight = 80;
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = 60;

  // Background: soft pastel
  doc.setFillColor(245, 245, 250);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, "F");

  // Decorative border
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(2);
  doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.height - 10);

  // Header block
  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Pet Adoption Certificate", pageWidth / 2, 30, { align: "center" });

  // Add image if available
  if (pet.imageUrls && pet.imageUrls.length > 0) {
    try {
      const imageUrl = pet.imageUrls[0];
      const proxyUrl = `http://localhost:8081/api/pets/image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      const dataUrl = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      doc.addImage(dataUrl, "JPEG", imageX, imageY, imageWidth, imageHeight);
    } catch (error) {
      console.warn("Could not load image for PDF:", error);
    }
  }

  // Position text below the image (image ends at imageY + imageHeight = 140)
  const textStartY = imageY + imageHeight + 10;

  // Main text
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(`This certifies that the pet named "${pet.name}"`, margin, textStartY);
  doc.text(`has found a loving forever home!`, margin, textStartY + 10);

  // Characteristics
  if (pet.characteristics) {
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("Pet Characteristics:", margin, textStartY + 30);
    const splitText = doc.splitTextToSize(pet.characteristics, 170);
    doc.text(splitText, margin, textStartY + 40);
  }

  // Adoption date
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Adoption Date: ${new Date().toLocaleDateString()}`, margin, textStartY + 80);

  // Thank you note
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 150);
  doc.text("Thank you for giving this pet a second chance and a new loving family.", margin, textStartY + 95);

  // Shelter info
  if (pet.clinic) {
    const clinic = pet.clinic;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Shelter: ${clinic.name} | Phone: ${clinic.phoneNumber || clinic.phone || "N/A"}`, margin, doc.internal.pageSize.height - 30);
  }

  doc.setTextColor(100, 100, 100);
  doc.text("Authorized Signature: ____________________", margin, doc.internal.pageSize.height - 18);

  // Save PDF
  doc.save(`Adoption_Certificate_${pet.name}.pdf`);
};

export default generateAdoptionCertificate;
