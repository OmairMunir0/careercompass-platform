import jsPDF from 'jspdf';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface InterviewAnalysis {
  overall_score: number;
  emotions: Record<string, number>;
  video_path?: string;
}

/**
 * Generate an Interview Certificate PDF
 */
export const generateInterviewCertificate = (
  user: User,
  analysis: InterviewAnalysis,
  date: Date = new Date()
): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(147, 51, 234); // Purple
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(124, 58, 237); // Darker purple
  doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');

  // White content area
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, margin, contentWidth, contentHeight, 5, 5, 'F');

  // Title
  doc.setTextColor(147, 51, 234);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 50, { align: 'center' });

  // Subtitle
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Interview Practice Certificate', pageWidth / 2, 60, { align: 'center' });

  // This certifies
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

  // Name
  const fullName = `${user.firstName} ${user.lastName}`;
  doc.setTextColor(147, 51, 234);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(fullName, pageWidth / 2, 95, { align: 'center' });

  // Has successfully completed
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed an interview practice session', pageWidth / 2, 110, { align: 'center' });

  // Score section
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(pageWidth / 2 - 40, 120, 80, 30, 3, 3, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.text('Overall Performance Score', pageWidth / 2, 130, { align: 'center' });
  
  doc.setTextColor(147, 51, 234);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${analysis.overall_score}%`, pageWidth / 2, 145, { align: 'center' });

  // Emotion breakdown
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Emotion Analysis:', pageWidth / 2 - 60, 160, { align: 'left' });

  const emotions = Object.entries(analysis.emotions);
  const startY = 170;
  const colWidth = 50;
  let x = pageWidth / 2 - 60;
  let y = startY;
  let col = 0;

  emotions.forEach(([emotion, value], index) => {
    if (col === 2) {
      col = 0;
      x = pageWidth / 2 - 60;
      y += 10;
    }
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${value}%`, x, y, { align: 'left' });
    x += colWidth;
    col++;
  });

  // Date
  const dateStr = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.text(`Date: ${dateStr}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('SkillSeeker - Career Compass Platform', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save the PDF
  const fileName = `Interview_Certificate_${user.firstName}_${user.lastName}_${date.getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a Resume/Profile PDF
 */
export const generateResumePDF = (user: User, additionalInfo?: {
  skills?: string[];
  experience?: string[];
  education?: string[];
}): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFillColor(147, 51, 234);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.firstName} ${user.lastName}`, margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(user.email, margin, 35);

  yPos = 60;

  // Skills Section
  if (additionalInfo?.skills && additionalInfo.skills.length > 0) {
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills', margin, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    additionalInfo.skills.forEach((skill) => {
      doc.text(`• ${skill}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 5;
  }

  // Experience Section
  if (additionalInfo?.experience && additionalInfo.experience.length > 0) {
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Experience', margin, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    additionalInfo.experience.forEach((exp) => {
      const lines = doc.splitTextToSize(`• ${exp}`, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 7;
    });
    yPos += 5;
  }

  // Education Section
  if (additionalInfo?.education && additionalInfo.education.length > 0) {
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Education', margin, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    additionalInfo.education.forEach((edu) => {
      const lines = doc.splitTextToSize(`• ${edu}`, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 7;
    });
  }

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('Generated by SkillSeeker - Career Compass Platform', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  const fileName = `Resume_${user.firstName}_${user.lastName}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a custom document PDF
 */
export const generateCustomDocument = (
  title: string,
  content: string,
  user?: User
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Title
  doc.setTextColor(147, 51, 234);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, pageWidth - margin * 2);
  doc.text(titleLines, margin, yPos);
  yPos += titleLines.length * 8 + 10;

  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const contentLines = doc.splitTextToSize(content, pageWidth - margin * 2);
  
  contentLines.forEach((line: string) => {
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(line, margin, yPos);
    yPos += 7;
  });

  // Footer with user info if provided
  if (user) {
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generated by: ${user.firstName} ${user.lastName}`, margin, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  }

  const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

