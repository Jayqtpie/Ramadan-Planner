import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportAllData } from './db';
import { HADITHS, MUHASABAH, EID_BEFORE, EID_DAY } from './data';

const COLORS = {
  primary: [27, 67, 50],
  secondary: [45, 106, 79],
  accent: [200, 169, 110],
  body: [45, 52, 54],
  muted: [99, 110, 114],
  white: [255, 255, 255],
  cream: [250, 248, 243],
  lightBorder: [226, 232, 240],
};

function addPageFooter(doc, pageNum) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('GuidedBarakah  |  The Ramadan Reset Planner', w / 2, h - 8, { align: 'center' });
  doc.text(`${pageNum}`, w - 15, h - 8);
}

function sectionHeading(doc, y, text, color = COLORS.primary) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...color);
  doc.roundedRect(15, y, w - 30, 8, 1, 1, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(text, 19, y + 5.5);
  return y + 12;
}

function checkNewPage(doc, y, needed, pageNum) {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 20) {
    addPageFooter(doc, pageNum.val);
    doc.addPage();
    pageNum.val++;
    return 20;
  }
  return y;
}

function bodyText(doc, y, text, x = 19) {
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.body);
  const w = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(text || '-', w - x - 19);
  doc.text(lines, x, y);
  return y + lines.length * 4;
}

function labelValue(doc, y, label, value, pageNum) {
  y = checkNewPage(doc, y, 8, pageNum);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.muted);
  doc.text(label, 19, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.body);
  const w = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(value || '-', w - 70);
  doc.text(lines, 60, y);
  return y + Math.max(6, lines.length * 4);
}

export async function generatePdf() {
  const allData = await exportAllData();
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const w = doc.internal.pageSize.getWidth();
  const pageNum = { val: 1 };

  // Pre-compute summary stats for the cover page
  const allDailyPages = allData.dailyPages || [];
  let coverDaysTracked = 0, coverTotalPrayers = 0, coverTotalPages = 0, coverTotalDeeds = 0;
  for (let d = 1; d <= 30; d++) {
    const page = allDailyPages.find(p => p.id === `day-${d}`);
    if (!page) continue;
    const salah = page.salahTracker || {};
    const fard = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const done = fard.filter(p => salah[p]?.done).length;
    const pagesRead = parseInt(page.quranProgress?.pages) || 0;
    const deeds = Object.values(page.goodDeeds || {}).filter(v => v === true).length;
    if (done > 0 || pagesRead > 0 || page.todaysNiyyah || page.muhasabahResponse) {
      coverDaysTracked++;
      coverTotalPrayers += done;
      coverTotalPages += pagesRead;
      coverTotalDeeds += deeds;
    }
  }

  // ========== COVER PAGE ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, w, 88, 'F');

  doc.setFillColor(...COLORS.accent);
  doc.rect(w / 2 - 25, 28, 50, 0.8, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.accent);
  doc.text('GUIDEDBARAKAH', w / 2, 38, { align: 'center' });

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text('My Ramadan Journey', w / 2, 53, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.accent);
  doc.text('The Ramadan Reset Planner', w / 2, 63, { align: 'center' });

  doc.setFillColor(...COLORS.accent);
  doc.rect(w / 2 - 25, 70, 50, 0.8, 'F');

  // Export date
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Exported: ${dateStr}`, w / 2, 100, { align: 'center' });

  // Hadith
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.body);
  const coverHadith = '"Whoever fasts Ramadan out of sincere faith and hoping for reward from Allah, all his previous sins will be forgiven."';
  const coverLines = doc.splitTextToSize(coverHadith, w - 60);
  doc.text(coverLines, w / 2, 113, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text('- Prophet Muhammad (peace be upon him) (Bukhari & Muslim)', w / 2, 113 + coverLines.length * 4 + 3, { align: 'center' });

  // Stats grid
  const statsY = 148;
  doc.setFillColor(...COLORS.cream);
  doc.roundedRect(15, statsY, w - 30, 58, 2, 2, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.roundedRect(15, statsY, w - 30, 58, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Your Ramadan at a Glance', w / 2, statsY + 9, { align: 'center' });

  const coverStats = [
    { label: 'Days Tracked', value: `${coverDaysTracked}/30` },
    { label: 'Prayers Done', value: `${coverTotalPrayers}` },
    { label: 'Quran Pages', value: `${coverTotalPages}` },
    { label: 'Good Deeds', value: `${coverTotalDeeds}` },
  ];
  const statColW = (w - 34) / coverStats.length;
  coverStats.forEach((s, i) => {
    const cx = 17 + i * statColW + statColW / 2;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(s.value, cx, statsY + 32, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(s.label, cx, statsY + 40, { align: 'center' });
  });

  // Closing message
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.muted);
  doc.text('May Allah accept your fasting, prayers, and duas. Ameen.', w / 2, statsY + 54, { align: 'center' });

  addPageFooter(doc, pageNum.val);

  // ========== NIYYAH PAGE ==========
  doc.addPage();
  pageNum.val++;
  let y = 20;

  const niyyahArr = allData.niyyah || [];
  const niyyah = niyyahArr[0] || {};

  y = sectionHeading(doc, y, 'MY NIYYAH (Intention)', COLORS.accent);

  y = labelValue(doc, y, 'Why I fast:', niyyah.whyFasting, pageNum);
  y += 2;
  y = labelValue(doc, y, 'Leave behind:', niyyah.leaveBehind, pageNum);
  y += 2;
  y = labelValue(doc, y, 'Personal dua:', niyyah.personalDua, pageNum);
  y += 2;

  if (niyyah.habitsToBuild?.some(h => h.text)) {
    y = checkNewPage(doc, y, 20, pageNum);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.muted);
    doc.text('Habits to build:', 19, y);
    y += 5;
    for (const habit of niyyah.habitsToBuild) {
      if (habit.text) {
        y = checkNewPage(doc, y, 6, pageNum);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.body);
        doc.text(`${habit.checked ? '[x]' : '[ ]'}  ${habit.text}`, 23, y);
        y += 5;
      }
    }
  }

  // ========== GOALS PAGE ==========
  y += 6;
  y = checkNewPage(doc, y, 30, pageNum);
  y = sectionHeading(doc, y, 'MY GOALS', COLORS.primary);

  const goalsArr = allData.goals || [];
  const goals = goalsArr[0] || {};
  const goalSections = [
    { label: 'Spiritual', data: goals.spiritual },
    { label: 'Personal Growth', data: goals.personalGrowth },
    { label: 'Charity', data: goals.charity },
    { label: 'Family & Community', data: goals.familyCommunity },
  ];

  for (const sec of goalSections) {
    const items = (sec.data || []).filter(g => g);
    if (items.length === 0) continue;
    y = checkNewPage(doc, y, 15, pageNum);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(sec.label, 19, y);
    y += 5;
    for (const item of items) {
      y = checkNewPage(doc, y, 5, pageNum);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.body);
      doc.text(`-  ${item}`, 23, y);
      y += 4.5;
    }
    y += 2;
  }

  // ========== DAILY PAGES ==========
  doc.addPage();
  pageNum.val++;
  y = 20;

  y = sectionHeading(doc, y, 'DAILY TRACKER - 30 DAYS OF RAMADAN', COLORS.primary);
  y += 2;

  const dailyPages = (allData.dailyPages || []).sort((a, b) => {
    const da = parseInt(a.id?.replace('day-', '') || 0);
    const db = parseInt(b.id?.replace('day-', '') || 0);
    return da - db;
  });

  // Summary table first
  const tableBody = [];
  let totalPrayers = 0;
  let totalOnTime = 0;
  let totalPagesRead = 0;
  let totalDeeds = 0;
  let totalWater = 0;
  let daysTracked = 0;

  for (let d = 1; d <= 30; d++) {
    const page = dailyPages.find(p => p.id === `day-${d}`);
    if (!page) continue;

    const salah = page.salahTracker || {};
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const done = prayers.filter(p => salah[p]?.done).length;
    const onTime = prayers.filter(p => salah[p]?.onTime === 'Y').length;
    totalPrayers += done;
    totalOnTime += onTime;

    const pagesRead = parseInt(page.quranProgress?.pages) || 0;
    totalPagesRead += pagesRead;

    const deeds = page.goodDeeds || {};
    const deedCount = Object.values(deeds).filter(v => v === true).length;
    totalDeeds += deedCount;

    const water = page.mealPlanner?.waterIntake || 0;
    totalWater += water;

    const hasData = done > 0 || pagesRead > 0 || page.todaysNiyyah || page.muhasabahResponse;
    if (hasData) daysTracked++;

    if (hasData) {
      tableBody.push([
        `Day ${d}`,
        `${done}/5`,
        onTime > 0 ? `${onTime}` : '-',
        page.khushuRating ? '*'.repeat(page.khushuRating) : '-',
        pagesRead || '-',
        `${deedCount}`,
        water ? `${water}/8` : '-',
      ]);
    }
  }

  // Stats summary box
  y = checkNewPage(doc, y, 30, pageNum);
  doc.setFillColor(250, 248, 243);
  doc.roundedRect(15, y, w - 30, 22, 2, 2, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.roundedRect(15, y, w - 30, 22, 2, 2, 'S');

  const stats = [
    { label: 'Days Tracked', value: `${daysTracked}/30` },
    { label: 'Prayers Done', value: `${totalPrayers}/${daysTracked * 5 || 1}` },
    { label: 'On Time', value: `${totalOnTime}` },
    { label: 'Quran Pages', value: `${totalPagesRead}` },
    { label: 'Good Deeds', value: `${totalDeeds}` },
    { label: 'Water', value: `${totalWater} glasses` },
  ];

  const colW = (w - 34) / stats.length;
  stats.forEach((s, i) => {
    const cx = 17 + i * colW + colW / 2;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(s.value, cx, y + 10, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(s.label, cx, y + 16, { align: 'center' });
  });
  y += 28;

  // Daily summary table
  if (tableBody.length > 0) {
    const table = autoTable(doc, {
      startY: y,
      head: [['Day', 'Salah', 'On Time', "Khushu'", 'Quran Pg', 'Deeds', 'Water']],
      body: tableBody,
      theme: 'grid',
      margin: { left: 15, right: 15 },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: COLORS.body,
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [250, 248, 243] },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
      },
    });
    y = (table?.finalY ?? doc.lastAutoTable?.finalY ?? y) + 8;
  }

  // ========== DETAILED DAILY ENTRIES ==========
  for (const page of dailyPages) {
    const dayNum = parseInt(page.id?.replace('day-', '') || 0);
    const hasContent = page.todaysNiyyah || page.muhasabahResponse || page.notes ||
      page.gratitude?.some(g => g) || page.topPriorities?.some(p => p);
    if (!hasContent) continue;

    y = checkNewPage(doc, y, 40, pageNum);
    doc.setFillColor(...COLORS.secondary);
    doc.roundedRect(15, y, w - 30, 7, 1, 1, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(`Day ${dayNum}${page.date ? '  -  ' + page.date : ''}`, 19, y + 5);
    y += 11;

    if (page.todaysNiyyah) {
      y = labelValue(doc, y, 'Niyyah:', page.todaysNiyyah, pageNum);
    }
    if (page.gratitude?.some(g => g)) {
      y = labelValue(doc, y, 'Grateful for:', page.gratitude.filter(g => g).join('; '), pageNum);
    }
    if (page.topPriorities?.some(p => p)) {
      y = labelValue(doc, y, 'Priorities:', page.topPriorities.filter(p => p).join('; '), pageNum);
    }
    if (page.muhasabahResponse) {
      y = checkNewPage(doc, y, 12, pageNum);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.accent);
      const prompt = MUHASABAH[dayNum - 1] || '';
      const promptLines = doc.splitTextToSize(`"${prompt}"`, w - 42);
      doc.text(promptLines, 23, y);
      y += promptLines.length * 3.5 + 1;
      y = bodyText(doc, y, page.muhasabahResponse, 23);
      y += 1;
    }
    if (page.notes) {
      y = labelValue(doc, y, 'Notes:', page.notes, pageNum);
    }
    y += 4;
  }

  // ========== WEEKLY REFLECTIONS ==========
  const weekly = (allData.weeklyReflections || []).sort((a, b) => {
    const wa = parseInt(a.id?.replace('week-', '') || 0);
    const wb = parseInt(b.id?.replace('week-', '') || 0);
    return wa - wb;
  });

  const hasWeekly = weekly.some(w => w.wentWell || w.needsImprovement || w.spiritualHighlight || w.goalsNextWeek);
  if (hasWeekly) {
    doc.addPage();
    pageNum.val++;
    y = 20;
    y = sectionHeading(doc, y, 'WEEKLY REFLECTIONS', COLORS.secondary);
    y += 2;

    for (const ref of weekly) {
      const weekNum = parseInt(ref.id?.replace('week-', '') || 0);
      const hasData = ref.wentWell || ref.needsImprovement || ref.spiritualHighlight || ref.goalsNextWeek || ref.oneWord;
      if (!hasData) continue;

      y = checkNewPage(doc, y, 30, pageNum);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`Week ${weekNum}${ref.weekRating ? '  ' + ref.weekRating + '/5' : ''}`, 19, y);
      y += 6;

      if (ref.wentWell) y = labelValue(doc, y, 'Went well:', ref.wentWell, pageNum);
      if (ref.needsImprovement) y = labelValue(doc, y, 'Improve:', ref.needsImprovement, pageNum);
      if (ref.spiritualHighlight) y = labelValue(doc, y, 'Highlight:', ref.spiritualHighlight, pageNum);
      if (ref.goalsNextWeek) y = labelValue(doc, y, 'Next week:', ref.goalsNextWeek, pageNum);
      if (ref.oneWord) y = labelValue(doc, y, 'One word:', ref.oneWord, pageNum);
      y += 4;
    }
  }

  // ========== LAST 10 NIGHTS ==========
  const lastTen = (allData.lastTenNights || []).sort((a, b) => {
    const na = parseInt(a.id?.replace('night-', '') || 0);
    const nb = parseInt(b.id?.replace('night-', '') || 0);
    return na - nb;
  });

  const hasLastTen = lastTen.some(n => n.personalDuas || n.reflection || n.notes ||
    Object.values(n.worshipChecklist || {}).some(v => v === true));
  if (hasLastTen) {
    doc.addPage();
    pageNum.val++;
    y = 20;
    y = sectionHeading(doc, y, 'LAST 10 NIGHTS', COLORS.accent);
    y += 2;

    for (const night of lastTen) {
      const nightNum = parseInt(night.id?.replace('night-', '') || 0);
      const wc = night.worshipChecklist || {};
      const hasData = night.personalDuas || night.reflection ||
        Object.values(wc).some(v => v === true);
      if (!hasData) continue;

      y = checkNewPage(doc, y, 25, pageNum);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`Night ${nightNum}${night.date ? '  -  ' + night.date : ''}`, 19, y);
      y += 6;

      const worshipItems = [
        ['ishaInCongregation', 'Isha in congregation'],
        ['fullTaraweeh', 'Full Taraweeh'],
        ['tahajjud', 'Tahajjud'],
        ['lengthyDua', 'Lengthy dua'],
        ['readQuran', 'Read Quran'],
        ['gaveCharity', 'Gave charity'],
        ['istighfar100', '100x Istighfar'],
        ['surahAlQadr', 'Surah Al-Qadr'],
      ];
      const completed = worshipItems.filter(([key]) => wc[key] === true).map(([, label]) => label);
      if (completed.length > 0) {
        y = labelValue(doc, y, 'Worship:', completed.join(', '), pageNum);
      }
      if (night.personalDuas) y = labelValue(doc, y, 'Duas:', night.personalDuas, pageNum);
      if (night.reflection) y = labelValue(doc, y, 'Reflection:', night.reflection, pageNum);
      y += 3;
    }
  }

  // ========== POST-RAMADAN ==========
  const postArr = allData.postRamadan || [];
  const post = postArr[0] || {};
  const hasPost = post.finalReflection || post.habitsKeeping?.some(h => h.text) ||
    post.ninetyDayGoals?.spiritual || post.ninetyDayGoals?.health;

  if (hasPost) {
    y = checkNewPage(doc, y, 40, pageNum);
    if (y > 30) {
      doc.addPage();
      pageNum.val++;
      y = 20;
    }
    y = sectionHeading(doc, y, 'POST-RAMADAN PLAN', COLORS.primary);
    y += 2;

    if (post.habitsKeeping?.some(h => h.text)) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.muted);
      doc.text('Habits to keep:', 19, y);
      y += 5;
      for (const habit of post.habitsKeeping) {
        if (habit.text) {
          y = checkNewPage(doc, y, 5, pageNum);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.body);
          doc.text(`${habit.checked ? '[x]' : '[ ]'}  ${habit.text}`, 23, y);
          y += 4.5;
        }
      }
      y += 3;
    }

    const goals90 = post.ninetyDayGoals || {};
    if (goals90.spiritual || goals90.health || goals90.career || goals90.relationships) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.muted);
      doc.text('90-Day Goals:', 19, y);
      y += 5;
      if (goals90.spiritual) y = labelValue(doc, y, '  Spiritual:', goals90.spiritual, pageNum);
      if (goals90.health) y = labelValue(doc, y, '  Health:', goals90.health, pageNum);
      if (goals90.career) y = labelValue(doc, y, '  Career:', goals90.career, pageNum);
      if (goals90.relationships) y = labelValue(doc, y, '  Relationships:', goals90.relationships, pageNum);
      y += 3;
    }

    if (post.finalReflection) {
      y = checkNewPage(doc, y, 15, pageNum);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.muted);
      doc.text('Final Reflection:', 19, y);
      y += 5;
      y = bodyText(doc, y, post.finalReflection, 23);
    }
  }

  // Final page footer
  addPageFooter(doc, pageNum.val);

  // Save — multiple strategies for cross-browser/PWA compatibility
  const filename = `My-Ramadan-Journey-${new Date().toISOString().split('T')[0]}.pdf`;
  const blob = doc.output('blob');

  // Try Web Share API first (works great on iOS PWA — no title to avoid duplicate file issue)
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/pdf' })] })) {
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: 'application/pdf' })],
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
      // Fall through to other methods
    }
  }

  // Try anchor download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
