import { exportAllData } from './db';

export async function shareProgress() {
  const allData = await exportAllData();
  const dailyPages = allData.dailyPages || [];

  let totalPrayers = 0;
  let totalOnTime = 0;
  let totalPages = 0;
  let totalDeeds = 0;
  let totalWater = 0;
  let daysTracked = 0;
  let totalKhushu = 0;
  let khushuCount = 0;

  for (const page of dailyPages) {
    const salah = page.salahTracker || {};
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const done = prayers.filter(p => salah[p]?.done).length;
    const onTime = prayers.filter(p => salah[p]?.onTime === 'Y').length;
    totalPrayers += done;
    totalOnTime += onTime;

    const pagesRead = parseInt(page.quranProgress?.pages) || 0;
    totalPages += pagesRead;

    const deeds = page.goodDeeds || {};
    totalDeeds += Object.values(deeds).filter(v => v === true).length;

    totalWater += page.mealPlanner?.waterIntake || 0;

    if (page.khushuRating) {
      totalKhushu += page.khushuRating;
      khushuCount++;
    }

    const hasData = done > 0 || pagesRead > 0 || page.todaysNiyyah;
    if (hasData) daysTracked++;
  }

  const avgKhushu = khushuCount > 0 ? (totalKhushu / khushuCount).toFixed(1) : '—';

  const quranTracker = allData.quranTracker || [];
  const juzData = quranTracker[0]?.juz || [];
  const juzCompleted = juzData.filter(j => j.completed).length;

  const text = [
    '\u2728 My Ramadan Progress \u2728',
    '',
    `\uD83D\uDCC5 Days tracked: ${daysTracked}/30`,
    `\uD83D\uDD4C Prayers completed: ${totalPrayers}/${daysTracked * 5 || 0}`,
    `\u23F0 Prayers on time: ${totalOnTime}`,
    `\uD83D\uDE4F Avg khushu\': ${avgKhushu}/5`,
    `\uD83D\uDCD6 Quran pages read: ${totalPages}`,
    `\uD83D\uDCD7 Juz completed: ${juzCompleted}/30`,
    `\u2764\uFE0F Good deeds: ${totalDeeds}`,
    `\uD83D\uDCA7 Water intake: ${totalWater} glasses`,
    '',
    'Tracked with The Ramadan Reset Planner by GuidedBarakah',
  ].join('\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Ramadan Progress',
        text,
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        throw e;
      }
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      // Final fallback: prompt with text
      prompt('Copy your progress summary:', text);
      return 'prompt';
    }
  }
}
