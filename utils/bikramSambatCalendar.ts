// Bikram Sambat Calendar Utility
// Converts Gregorian dates to Bikram Sambat (Nepali/Hindu Calendar)

interface BikramSambatDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameBengali: string;
  dayName: string;
  dayNameBengali: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: 'Shukla' | 'Krishna';
  season: string;
  seasonBengali: string;
}

// Bikram Sambat months (starts from Baishakh)
const bikramSambatMonths = [
  { name: 'Baishakh', bengali: 'বৈশাখ', days: 31 },
  { name: 'Jestha', bengali: 'জ্যৈষ্ঠ', days: 31 },
  { name: 'Ashadh', bengali: 'আষাঢ়', days: 31 },
  { name: 'Shrawan', bengali: 'শ্রাবণ', days: 32 },
  { name: 'Bhadra', bengali: 'ভাদ্র', days: 32 },
  { name: 'Ashwin', bengali: 'আশ্বিন', days: 30 },
  { name: 'Kartik', bengali: 'কার্তিক', days: 30 },
  { name: 'Mangsir', bengali: 'অগ্রহায়ণ', days: 30 },
  { name: 'Poush', bengali: 'পৌষ', days: 30 },
  { name: 'Magh', bengali: 'মাঘ', days: 30 },
  { name: 'Falgun', bengali: 'ফাল্গুন', days: 30 },
  { name: 'Chaitra', bengali: 'চৈত্র', days: 30 }
];

// Days of the week
const weekDays = [
  { name: 'Sunday', bengali: 'রবিবার', short: 'রবি' },
  { name: 'Monday', bengali: 'সোমবার', short: 'সোম' },
  { name: 'Tuesday', bengali: 'মঙ্গলবার', short: 'মঙ্গল' },
  { name: 'Wednesday', bengali: 'বুধবার', short: 'বুধ' },
  { name: 'Thursday', bengali: 'বৃহস্পতিবার', short: 'বৃহস্পতি' },
  { name: 'Friday', bengali: 'শুক্রবার', short: 'শুক্র' },
  { name: 'Saturday', bengali: 'শনিবার', short: 'শনি' }
];

// Tithis (Lunar days)
const tithis = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

// Nakshatras (Lunar mansions)
const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

// Yogas
const yogas = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarman', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti'
];

// Karanas
const karanas = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Seasons
const seasons = [
  { name: 'Spring', bengali: 'বসন্ত', months: [0, 1] }, // Baishakh, Jestha
  { name: 'Summer', bengali: 'গ্রীষ্ম', months: [2, 3] }, // Ashadh, Shrawan
  { name: 'Monsoon', bengali: 'বর্ষা', months: [4, 5] }, // Bhadra, Ashwin
  { name: 'Autumn', bengali: 'শরৎ', months: [6, 7] }, // Kartik, Mangsir
  { name: 'Winter', bengali: 'শীত', months: [8, 9] }, // Poush, Magh
  { name: 'Late Winter', bengali: 'শীতান্ত', months: [10, 11] } // Falgun, Chaitra
];

export class BikramSambatCalendar {
  // Convert Gregorian date to Bikram Sambat
  static gregorianToBikramSambat(gregorianDate: Date): BikramSambatDate {
    // Bikram Sambat starts from 57 BC, so add 57 to Gregorian year
    // But the new year starts in mid-April, so we need to adjust
    
    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth(); // 0-11
    const gregorianDay = gregorianDate.getDate();
    const dayOfWeek = gregorianDate.getDay(); // 0-6 (Sunday-Saturday)
    
    // Approximate conversion (simplified)
    // Bikram Sambat new year typically falls around April 13-15
    let bikramYear: number;
    let bikramMonth: number;
    let bikramDay: number;
    
    // If before April 14, it's still the previous Bikram Sambat year
    if (gregorianMonth < 3 || (gregorianMonth === 3 && gregorianDay < 14)) {
      bikramYear = gregorianYear + 56; // 57 - 1 for previous year
      // Calculate month and day for the previous year cycle
      if (gregorianMonth === 0) { // January
        bikramMonth = 9; // Poush
        bikramDay = gregorianDay + 15; // Approximate
      } else if (gregorianMonth === 1) { // February
        bikramMonth = 10; // Magh
        bikramDay = gregorianDay + 15; // Approximate
      } else if (gregorianMonth === 2) { // March
        bikramMonth = 11; // Falgun
        bikramDay = gregorianDay + 15; // Approximate
      } else { // Early April
        bikramMonth = 11; // Chaitra
        bikramDay = gregorianDay + 15; // Approximate
      }
    } else {
      bikramYear = gregorianYear + 57;
      // Calculate month and day for current year cycle
      if (gregorianMonth === 3) { // April
        bikramMonth = 0; // Baishakh
        bikramDay = gregorianDay - 13; // Approximate (April 14 = Baishakh 1)
      } else if (gregorianMonth === 4) { // May
        bikramMonth = 1; // Jestha
        bikramDay = gregorianDay + 17; // Approximate
      } else if (gregorianMonth === 5) { // June
        bikramMonth = 2; // Ashadh
        bikramDay = gregorianDay + 16; // Approximate
      } else if (gregorianMonth === 6) { // July
        bikramMonth = 3; // Shrawan
        bikramDay = gregorianDay + 16; // Approximate
      } else if (gregorianMonth === 7) { // August
        bikramMonth = 4; // Bhadra
        bikramDay = gregorianDay + 15; // Approximate
      } else if (gregorianMonth === 8) { // September
        bikramMonth = 5; // Ashwin
        bikramDay = gregorianDay + 16; // Approximate
      } else if (gregorianMonth === 9) { // October
        bikramMonth = 6; // Kartik
        bikramDay = gregorianDay + 15; // Approximate
      } else if (gregorianMonth === 10) { // November
        bikramMonth = 7; // Mangsir
        bikramDay = gregorianDay + 14; // Approximate
      } else { // December
        bikramMonth = 8; // Poush
        bikramDay = gregorianDay + 15; // Approximate
      }
    }
    
    // Ensure day is within valid range
    const maxDays = bikramSambatMonths[bikramMonth].days;
    if (bikramDay > maxDays) {
      bikramDay = bikramDay - maxDays;
      bikramMonth = (bikramMonth + 1) % 12;
      if (bikramMonth === 0) bikramYear++;
    }
    if (bikramDay < 1) {
      bikramMonth = bikramMonth === 0 ? 11 : bikramMonth - 1;
      if (bikramMonth === 11) bikramYear--;
      bikramDay = bikramSambatMonths[bikramMonth].days + bikramDay;
    }
    
    // Get lunar information (simplified calculation)
    const daysSinceNewMoon = (gregorianDay + gregorianMonth * 30) % 30;
    const tithiIndex = Math.floor(daysSinceNewMoon / 2) % 15;
    const paksha: 'Shukla' | 'Krishna' = daysSinceNewMoon < 15 ? 'Shukla' : 'Krishna';
    
    // Get nakshatra (simplified - cycles through 27 nakshatras)
    const nakshatraIndex = (gregorianDay + gregorianMonth * 30 + gregorianYear) % 27;
    
    // Get yoga (simplified - cycles through 27 yogas)
    const yogaIndex = (gregorianDay + gregorianMonth * 15 + gregorianYear) % 27;
    
    // Get karana (simplified - cycles through 11 karanas)
    const karanaIndex = (gregorianDay + gregorianMonth * 7) % 11;
    
    // Get season
    const currentSeason = seasons.find(season => 
      season.months.includes(bikramMonth)
    ) || seasons[0];
    
    return {
      year: bikramYear,
      month: bikramMonth,
      day: bikramDay,
      monthName: bikramSambatMonths[bikramMonth].name,
      monthNameBengali: bikramSambatMonths[bikramMonth].bengali,
      dayName: weekDays[dayOfWeek].name,
      dayNameBengali: weekDays[dayOfWeek].short,
      tithi: `${paksha} Paksha ${tithis[tithiIndex]}`,
      nakshatra: nakshatras[nakshatraIndex],
      yoga: yogas[yogaIndex],
      karana: karanas[karanaIndex],
      paksha,
      season: currentSeason.name,
      seasonBengali: currentSeason.bengali
    };
  }
  
  // Get current Bikram Sambat date
  static getCurrentBikramSambatDate(): BikramSambatDate {
    return this.gregorianToBikramSambat(new Date());
  }
  
  // Format date for display
  static formatBikramSambatDate(date: BikramSambatDate): string {
    return `${date.dayNameBengali} ${date.day}, ${date.monthNameBengali} ${date.year}`;
  }
  
  // Get detailed panchang information
  static getPanchangInfo(date: BikramSambatDate): string {
    return `তিথি: ${date.tithi} | নক্ষত্র: ${date.nakshatra} | যোগ: ${date.yoga} | করণ: ${date.karana}`;
  }
}