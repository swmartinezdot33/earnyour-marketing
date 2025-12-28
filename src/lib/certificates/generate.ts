import PDFDocument from "pdfkit";
import type { Course, User } from "@/lib/db/schema";

export async function generateCertificate(
  user: User,
  course: Course
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc.fontSize(24).font("Helvetica-Bold").text("Certificate of Completion", { align: "center" });
      doc.moveDown();

      // Body
      doc.fontSize(16).font("Helvetica").text("This is to certify that", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(20).font("Helvetica-Bold").text(user.name || user.email, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").text("has successfully completed the course", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(18).font("Helvetica-Bold").text(course.title, { align: "center" });
      doc.moveDown(2);

      // Date
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fontSize(12).font("Helvetica").text(`Issued on ${date}`, { align: "center" });
      doc.moveDown(2);

      // Footer
      doc.fontSize(10).font("Helvetica").text("EarnYour Marketing", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}







