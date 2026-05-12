import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { marked } from 'marked';

const TOOL_META = {
  gemini: { label: "Google Gemini", color: "#10b981" },
  claude: { label: "Anthropic Claude", color: "#d97757" },
  cursor: { label: "Cursor AI", color: "#3b82f6" },
  chatgpt: { label: "ChatGPT", color: "#10a37f" }
};

export function generatePDF(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(createWriteStream('audit_report.pdf'));

  const startX = 40;
  const contentWidth = 595.28 - 80; 
  const pageHeight = 841.89;

  // Page break utility
  const checkPageBreak = (requiredHeight) => {
    if (doc.y + requiredHeight > pageHeight - 40) {
      doc.addPage();
      return true;
    }
    return false;
  };

  // --- 1. HEADER ---
  doc.circle(startX + 3, doc.y + 4, 3).fill('#10b981');
  doc.font('Courier-Bold').fontSize(10).fillColor('#94a3b8').text('SHARED REPORT', startX + 12, doc.y);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').fontSize(26).fillColor('#0f172a').text('Found ', startX, doc.y, { continued: true })
     .fillColor('#059669').text(`$${data.monthlySave}/mo`, { continued: true })
     .fillColor('#0f172a').text(' in potential savings.');
  
  doc.moveDown(0.5);
  const totalFindings = Object.values(data.findings).reduce((acc, curr) => acc + curr.length, 0);
  doc.font('Courier').fontSize(11).fillColor('#64748b').text(`${Object.keys(data.findings).length} tools audited · identifying details stripped for privacy`);
  doc.moveDown(2);

  // --- 2. STATS GRID ---
  const stats = [
    { label: 'Monthly Savings', val: `$${data.monthlySave}`, sub: 'potential', color: '#059669' },
    { label: 'Annual Savings', val: `$${data.yearlySave}`, sub: 'potential', color: '#0f172a' },
    { label: 'Total Findings', val: totalFindings.toString(), sub: 'across stack', color: '#0f172a' }
  ];
  const boxWidth = (contentWidth - 20) / 3; 
  const boxHeight = 75;
  const statsY = doc.y;

  stats.forEach((stat, i) => {
    const x = startX + i * (boxWidth + 10);
    doc.lineWidth(1).strokeColor('#e2e8f0').roundedRect(x, statsY, boxWidth, boxHeight, 8).stroke();
    doc.font('Courier-Bold').fontSize(9).fillColor('#94a3b8').text(stat.label.toUpperCase(), x + 16, statsY + 16);
    doc.font('Courier-Bold').fontSize(20).fillColor(stat.color).text(stat.val, x + 16, statsY + 32);
    doc.font('Helvetica').fontSize(10).fillColor('#94a3b8').text(stat.sub, x + 16, statsY + 54);
  });
  doc.y = statsY + boxHeight + 24;

  // --- 3. SUMMARY ---

  const tokens = marked.lexer(data.summary);

  const renderMarkdown = (tokens, x, width) => {
    tokens.forEach((token) => {
      switch (token.type) {
        case "heading":
          doc
            .font("Helvetica-Bold")
            .fontSize(16)
            .fillColor("#0f172a")
            .text(token.text, x, doc.y, { width });

          doc.moveDown(0.6);
          break;

        case "paragraph":
          token.tokens.forEach((t, idx) => {
            const continued = idx !== token.tokens.length - 1;

            doc.font(
              t.type === "strong"
                ? "Helvetica-Bold"
                : "Helvetica"
            );

            doc
              .fontSize(12)
              .fillColor("#334155")
              .text(t.text, {
                width,
                continued,
              });
          });

          doc.moveDown(0.8);
          break;

        case "list":
          token.items.forEach((item) => {
            doc
              .font("Helvetica")
              .fontSize(12)
              .fillColor("#334155")
              .text("• ", x, doc.y, {
                continued: true,
              });

            item.tokens.forEach((t, idx) => {
              const continued = idx !== item.tokens.length - 1;

              doc.font(
                t.type === "strong"
                  ? "Helvetica-Bold"
                  : "Helvetica"
              );

              doc.text(t.text, {
                width: width - 20,
                continued,
              });
            });

            doc.moveDown(0.5);
          });

          doc.moveDown(0.4);
          break;
      }
    });
  };

  // Estimate height roughly
  doc.font("Helvetica").fontSize(12).lineGap(6);

  const headingCount = (data.summary.match(/^#/gm) || []).length;
  const bulletCount = (data.summary.match(/^- /gm) || []).length;

  const estimatedHeight =
    doc.heightOfString(
      data.summary.replace(/[#*`>-]/g, ""),
      {
        width: contentWidth - 40,
        lineGap: 6,
      }
    ) +
    headingCount * 12 +
    bulletCount * 6 +
    30;

  const sumBoxHeight = estimatedHeight;

  checkPageBreak(sumBoxHeight);

  const sumY = doc.y;

  // Box
  doc
    .lineWidth(1)
    .strokeColor("#e2e8f0")
    .roundedRect(startX, sumY, contentWidth, sumBoxHeight, 8)
    .stroke();

  // Accent bar
  doc
    .save()
    .roundedRect(startX, sumY, contentWidth, sumBoxHeight, 8)
    .clip()
    .rect(startX, sumY, 4, sumBoxHeight)
    .fill("#e2e8f0")
    .restore();

  // Title
  doc
    .font("Courier-Bold")
    .fontSize(10)
    .fillColor("#94a3b8")
    .text("SUMMARY", startX + 20, sumY + 16);

  // Markdown content
  doc.y = sumY + 40;

  renderMarkdown(
    tokens,
    startX + 20,
    contentWidth - 40
  );

  doc.y += 24;

  // --- 4. DETAILED FINDINGS ---
  doc.font('Courier-Bold').fontSize(10).fillColor('#94a3b8').text('DETAILED FINDINGS', startX, doc.y);
  doc.moveDown(1.5);

  Object.entries(data.findings).forEach(([toolName, findings]) => {
    doc.font('Helvetica').fontSize(11).lineGap(4);

    // Step A: Calculate mathematically exact box height required
    let cardHeight = 16 + 14 + 16; // Top pad + Header Font + Header bottom gap
    
    findings.forEach((f, idx) => {
      const reasonHeight = doc.heightOfString(f.reason, { width: contentWidth - 32 });
      let itemHeight = 18 + 8 + reasonHeight + 16; // Badge + gap + text + bottom pad
      
      if (idx < findings.length - 1) itemHeight += 1 + 16; // Divider line + gap after line
      cardHeight += itemHeight;
    });

    checkPageBreak(cardHeight + 20);
    const cardY = doc.y;

    // Step B: Draw the exact bounding box
    doc.lineWidth(1).strokeColor('#e2e8f0').roundedRect(startX, cardY, contentWidth, cardHeight, 8).stroke();
    
    // Step C: Draw Header
    const meta = TOOL_META[toolName] || { label: toolName };
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text(meta.label, startX + 16, cardY + 16);
    doc.moveTo(startX + 16, cardY + 40).lineTo(startX + contentWidth - 16, cardY + 40).lineWidth(1).strokeColor('#f1f5f9').stroke();

    // Step D: Iterate and draw items strictly by `currentY`
    let currentY = cardY + 56;

    findings.forEach((f, idx) => {
      // 1. Badge Background & Text
      doc.font('Courier-Bold').fontSize(9);
      const badgeText = `[${f.type}]`;
      const badgeWidth = doc.widthOfString(badgeText) + 12;
      doc.roundedRect(startX + 16, currentY, badgeWidth, 18, 4).fill('#f1f5f9');
      doc.fillColor('#64748b').text(badgeText, startX + 22, currentY + 5);

      // 2. Savings value (Right Aligned)
      const saveText = f.monthlySaving > 0 ? `-$${f.monthlySaving}/mo` : `-$0/mo`;
      const saveColor = f.monthlySaving > 0 ? '#059669' : '#94a3b8';
      doc.font('Courier-Bold').fontSize(12).fillColor(saveColor)
         .text(saveText, startX + contentWidth - 16 - doc.widthOfString(saveText), currentY + 3);

      // 3. Reason Text
      currentY += 26; // Move down below badge
      doc.font('Helvetica').fontSize(11).fillColor('#334155').lineGap(4);
      doc.text(f.reason, startX + 16, currentY, { width: contentWidth - 32 });
      
      const reasonHeight = doc.heightOfString(f.reason, { width: contentWidth - 32 });
      currentY += reasonHeight + 16; // Move below text

      // 4. Draw dotted divider if not the last item
      if (idx < findings.length - 1) {
        doc.moveTo(startX + 16, currentY).lineTo(startX + contentWidth - 16, currentY)
           .lineWidth(0.5).strokeColor('#e2e8f0').dash(2, {space: 2}).stroke().undash();
        currentY += 17; // padding after line
      }
    });

    doc.y = cardY + cardHeight + 16; // Set cursor position properly for next card
  });

  // --- 5. VALUE BREAKDOWN ---
  const breakdownItems = Object.entries(data.maxSavingPerTool)
    .filter(([_, saving]) => saving > 0)
    .sort((a, b) => b[1] - a[1]);

  // Calculate box height dynamically based on active items
  const bdHeight = 16 + 12 + 20 + (breakdownItems.length * 48) + 1 + 16 + 14 + 16;
  checkPageBreak(bdHeight + 20);
  const bdY = doc.y;

  doc.lineWidth(1).strokeColor('#e2e8f0').roundedRect(startX, bdY, contentWidth, bdHeight, 8).stroke();
  doc.font('Courier-Bold').fontSize(10).fillColor('#94a3b8').text('VALUE BREAKDOWN', startX + 16, bdY + 16);

  let currentY = bdY + 48;

  breakdownItems.forEach(([name, saving]) => {
    const pct = Math.min(100, Math.round((saving / data.monthlySave) * 100));
    const meta = TOOL_META[name] || { label: name, color: "#6366F1" };

    // Tool Name & Value text
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#334155').text(meta.label, startX + 16, currentY);
    const saveText = `-$${saving}/mo`;
    doc.font('Courier-Bold').fontSize(12).fillColor('#059669')
       .text(saveText, startX + contentWidth - 16 - doc.widthOfString(saveText), currentY);

    currentY += 18;

    // Progress Bar Track
    doc.roundedRect(startX + 16, currentY, contentWidth - 32, 6, 3).fill('#f1f5f9');
    
    // Progress Bar Fill
    const fillWidth = (contentWidth - 32) * (pct / 100);
    if (fillWidth > 0) {
       doc.roundedRect(startX + 16, currentY, fillWidth, 6, 3).fill(meta.color);
    }
    
    currentY += 30; // Spacing for next item
  });

  // Footer Divider Line
  doc.moveTo(startX + 16, currentY).lineTo(startX + contentWidth - 16, currentY)
     .lineWidth(1).strokeColor('#f1f5f9').stroke();
  currentY += 16;

  // Footer Text
  doc.font('Courier').fontSize(11).fillColor('#94a3b8').text('Total Optimization Value', startX + 16, currentY);
  const totalText = `-$${data.monthlySave}/mo`;
  doc.font('Courier-Bold').fontSize(14).fillColor('#059669')
     .text(totalText, startX + contentWidth - 16 - doc.widthOfString(totalText), currentY - 2);

  doc.end();
}
