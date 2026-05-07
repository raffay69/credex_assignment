import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';

const SAMPLE_DATA = {
  findings: {
    gemini: [
      { name: 'gemini', type: 'overspend', reason: 'the expected spend for pro/1 should be 20 not 35, check for hidden charges', monthlySaving: 15, annualSaving: 180 },
      { name: 'gemini', type: 'cheaper-plan', reason: 'Cheaper plans available like plus', monthlySaving: 27, annualSaving: 324 },
      { name: 'gemini', type: 'alternatives', reason: 'Cheaper alternative plans available', alternatives: [{ name: 'chatgpt', planName: 'go', price: 8, saving: 27 }, { name: 'claude', planName: 'pro', price: 17, saving: 18 }, { name: 'chatgpt', planName: 'plus', price: 20, saving: 15 }], monthlySaving: 27, annualSaving: 324 }
    ],
    claude: [
      { name: 'claude', type: 'wrong-plan', reason: 'team at $20/seat ($40/mo) is overkill for 2 seat(s) — switch to pro at $17/seat ($34/mo)', monthlySaving: 6, annualSaving: 72 },
      { name: 'claude', type: 'api-to-flat', reason: 'Spending $150/mo on API — flat max_5x plan at $100/mo would be cheaper if usage is consistent', monthlySaving: 50, annualSaving: 600 },
      { name: 'claude', type: 'alternatives', reason: 'Cheaper alternative plans available', alternatives: [{ name: 'chatgpt', planName: 'go', price: 8, saving: 142 }, { name: 'gemini', planName: 'plus', price: 8, saving: 142 }], monthlySaving: 142, annualSaving: 1704 }
    ],
    cursor: [
      { name: 'cursor', type: 'cheaper-plan', reason: 'Cheaper plans available like pro, pro_plus', monthlySaving: 140, annualSaving: 1680 },
    ],
    chatgpt: [
      { name: 'chatgpt', type: 'api-use-credits', reason: 'API spend of $6/mo is low — prepaid credits would be more cost effective than any flat plan', monthlySaving: 0, annualSaving: 0 }
    ]
  },
  maxSavingPerTool: { gemini: 27, claude: 142, cursor: 140, chatgpt: 0 },
  summary : "This team is overpaying across multiple vendors. Consolidating API usage to flat tiers and switching under-utilized Team plans to Pro plans yields significant monthly returns.",
  monthlySave: 309,
  yearlySave: 3708
};

const TOOL_META = {
  gemini: { label: "Google Gemini", color: "#10b981" },
  claude: { label: "Anthropic Claude", color: "#d97757" },
  cursor: { label: "Cursor AI", color: "#3b82f6" },
  chatgpt: { label: "ChatGPT", color: "#10a37f" }
};

function generatePDF() {
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
     .fillColor('#059669').text(`$${SAMPLE_DATA.monthlySave}/mo`, { continued: true })
     .fillColor('#0f172a').text(' in potential savings.');
  
  doc.moveDown(0.5);
  const totalFindings = Object.values(SAMPLE_DATA.findings).reduce((acc, curr) => acc + curr.length, 0);
  doc.font('Courier').fontSize(11).fillColor('#64748b').text(`${Object.keys(SAMPLE_DATA.findings).length} tools audited · identifying details stripped for privacy`);
  doc.moveDown(2);

  // --- 2. STATS GRID ---
  const stats = [
    { label: 'Monthly Savings', val: `$${SAMPLE_DATA.monthlySave}`, sub: 'potential', color: '#059669' },
    { label: 'Annual Savings', val: `$${SAMPLE_DATA.yearlySave}`, sub: 'potential', color: '#0f172a' },
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

  // --- 3. EXECUTIVE SUMMARY ---
  doc.font('Helvetica').fontSize(12).lineGap(6);
  const summaryHeight = doc.heightOfString(SAMPLE_DATA.summary, { width: contentWidth - 40 });
  const sumBoxHeight = 16 + 14 + 10 + summaryHeight + 20; // Exact padded height

  checkPageBreak(sumBoxHeight);
  const sumY = doc.y;

  // Box & left-accent bar
  doc.lineWidth(1).strokeColor('#e2e8f0').roundedRect(startX, sumY, contentWidth, sumBoxHeight, 8).stroke();
  doc.save().roundedRect(startX, sumY, contentWidth, sumBoxHeight, 8).clip().rect(startX, sumY, 4, sumBoxHeight).fill('#e2e8f0').restore(); 
  
  doc.font('Courier-Bold').fontSize(10).fillColor('#94a3b8').text('EXECUTIVE SUMMARY', startX + 20, sumY + 16);
  doc.font('Helvetica').fontSize(12).fillColor('#334155').text(SAMPLE_DATA.summary, startX + 20, sumY + 40, { width: contentWidth - 40 });
  doc.y = sumY + sumBoxHeight + 24;

  // --- 4. DETAILED FINDINGS ---
  doc.font('Courier-Bold').fontSize(10).fillColor('#94a3b8').text('DETAILED FINDINGS', startX, doc.y);
  doc.moveDown(1.5);

  Object.entries(SAMPLE_DATA.findings).forEach(([toolName, findings]) => {
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
  const breakdownItems = Object.entries(SAMPLE_DATA.maxSavingPerTool)
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
    const pct = Math.min(100, Math.round((saving / SAMPLE_DATA.monthlySave) * 100));
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
  const totalText = `-$${SAMPLE_DATA.monthlySave}/mo`;
  doc.font('Courier-Bold').fontSize(14).fillColor('#059669')
     .text(totalText, startX + contentWidth - 16 - doc.widthOfString(totalText), currentY - 2);

  doc.end();
  console.log("Clean PDF generated successfully: audit_report.pdf");
}

generatePDF();