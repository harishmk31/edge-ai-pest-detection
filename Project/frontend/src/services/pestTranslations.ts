/**
 * Dynamic Localization Service for AgriVision AI
 * Translates IP102 pest common names, taxonomic groups, and host crops into Tamil and Hindi
 * while preserving canonical Latin binomial scientific names (*Nilaparvata lugens*, etc.) and class IDs.
 */

export interface PestTranslation {
  ta: string; // Tamil common name with English transliteration in parens for clarity
  hi: string; // Hindi common name with English transliteration in parens
}

// Curated dictionary for primary IP102 agricultural pests
export const PEST_NAME_TRANSLATIONS: Record<string, PestTranslation> = {
  // Rice Pests
  'Rice Leaf Roller': {
    ta: 'இலைச்சுருட்டுப் புழு (Rice Leaf Roller)',
    hi: 'पत्ती लपेटक सूंडी (Rice Leaf Roller)',
  },
  'Brown Planthopper': {
    ta: 'புகையான் / பழுப்பு தத்துப்பூச்சி (Brown Planthopper)',
    hi: 'भूरा फुदका (Brown Planthopper)',
  },
  'Rice Stemfly': {
    ta: 'தண்டு ஈ (Rice Stemfly)',
    hi: 'तना मक्खी (Rice Stemfly)',
  },
  'Yellow Rice Borer': {
    ta: 'மஞ்சள் தண்டு துளைப்பான் (Yellow Rice Borer)',
    hi: 'पीला तना छेदक (Yellow Rice Borer)',
  },
  'White Backed Planthopper': {
    ta: 'வெண் முதுகு தத்துப்பூச்சி (White Backed Planthopper)',
    hi: 'सफेद पीठ वाला फुदका (White Backed Planthopper)',
  },
  'Rice Gall Midge': {
    ta: 'ஆனைக்கொம்பன் (Rice Gall Midge)',
    hi: 'गाल मिज (Rice Gall Midge)',
  },
  'Rice Water Weevil': {
    ta: 'நெல் நீர் வண்டு (Rice Water Weevil)',
    hi: 'धान का जल वीविल (Rice Water Weevil)',
  },
  'Rice Leafhopper': {
    ta: 'பச்சை தத்துப்பூச்சி (Rice Leafhopper)',
    hi: 'हरा फुदका (Rice Leafhopper)',
  },
  'Rice Hispa': {
    ta: 'நெல் முள் வண்டு (Rice Hispa)',
    hi: 'राइस हिस्पा (Rice Hispa)',
  },
  'Paddy Stem Borer': {
    ta: 'நெல் தண்டு துளைப்பான் (Paddy Stem Borer)',
    hi: 'धान का तना छेदक (Paddy Stem Borer)',
  },

  // Armyworms & Caterpillars
  'Fall Armyworm': {
    ta: 'படைப்புழு (Fall Armyworm)',
    hi: 'फॉल आर्मीवर्म / सैनिक कीट (Fall Armyworm)',
  },
  'Armyworm': {
    ta: 'படைப்புழு (Armyworm)',
    hi: 'सैनिक कीट / आर्मीवर्म (Armyworm)',
  },
  'Beet Armyworm': {
    ta: 'பீட் படைப்புழு (Beet Armyworm)',
    hi: 'चुकंदर सैनिक कीट (Beet Armyworm)',
  },
  'Cutworm': {
    ta: 'வெட்டுப்புழு (Cutworm)',
    hi: 'कटुआ सूंडी / कटवर्म (Cutworm)',
  },
  'Black Cutworm': {
    ta: 'கருப்பு வெட்டுப்புழு (Black Cutworm)',
    hi: 'काला कटवर्म (Black Cutworm)',
  },
  'Cabbage Caterpillar': {
    ta: 'முட்டைக்கோஸ் புழு (Cabbage Caterpillar)',
    hi: 'पत्तागोभी की इल्ली (Cabbage Caterpillar)',
  },
  'Diamondback Moth': {
    ta: 'வைரமுதுகு அந்துப்பூச்சி (Diamondback Moth)',
    hi: 'डायमंडबैक मोथ (Diamondback Moth)',
  },

  // Bollworms & Borers
  'Cotton Bollworm': {
    ta: 'பருத்தி காய்ப்புழு (Cotton Bollworm)',
    hi: 'कपास की गुलाबी / अमेरिकन सुंडी (Cotton Bollworm)',
  },
  'Corn Borer': {
    ta: 'மக்காச்சோள தண்டு துளைப்பான் (Corn Borer)',
    hi: 'मक्का तना छेदक (Corn Borer)',
  },
  'Asian Corn Borer': {
    ta: 'ஆசிய மக்காச்சோள துளைப்பான் (Asian Corn Borer)',
    hi: 'एशियाई मक्का छेदक (Asian Corn Borer)',
  },
  'Fruit Borer': {
    ta: 'காய் துளைப்பான் / பழப்புழு (Fruit Borer)',
    hi: 'फल छेदक कीट (Fruit Borer)',
  },
  'Stem Borer': {
    ta: 'தண்டு துளைப்பான் (Stem Borer)',
    hi: 'तना छेदक (Stem Borer)',
  },
  'Legume Pod Borer': {
    ta: 'பயறு காய் துளைப்பான் (Legume Pod Borer)',
    hi: 'दलहन फली छेदक (Legume Pod Borer)',
  },
  'Shoot Borer': {
    ta: 'குருத்து துளைப்பான் (Shoot Borer)',
    hi: 'प्ररोह छेदक (Shoot Borer)',
  },

  // Sucking Pests & Mites
  'Aphids': {
    ta: 'அசுவினி / இலைப்பேன் (Aphids)',
    hi: 'माहू / एफिड (Aphids)',
  },
  'Field Aphid Colony': {
    ta: 'அசுவினி கூட்டம் (Field Aphid Colony)',
    hi: 'माहू का समूह (Field Aphid Colony)',
  },
  'Whitefly': {
    ta: 'வெள்ளை ஈ (Whitefly)',
    hi: 'सफेद मक्खी (Whitefly)',
  },
  'Thrips': {
    ta: 'இலைப்பேன் (Thrips)',
    hi: 'थ्रिप्स / चुरड़ा (Thrips)',
  },
  'Spider Mites': {
    ta: 'செம்பேன் / சிலந்தி பேன் (Spider Mites)',
    hi: 'मकड़ी कीट / माइट्स (Spider Mites)',
  },
  'Red Spider Mite': {
    ta: 'சிவப்பு சிலந்தி பேன் (Red Spider Mite)',
    hi: 'लाल मकड़ी (Red Spider Mite)',
  },
  'Yellow Tea Mite': {
    ta: 'மஞ்சள் சிலந்தி பேன் (Yellow Tea Mite)',
    hi: 'पीली चाय माइट (Yellow Tea Mite)',
  },
  'Mealybug': {
    ta: 'மாவுப்பூச்சி (Mealybug)',
    hi: 'मिलीबग / चिपचिपा कीट (Mealybug)',
  },

  // Beetles & Weevils
  'Flea Beetle': {
    ta: 'பாய்ச்சல் வண்டு (Flea Beetle)',
    hi: 'फ्ली बीटल / पिस्सू भृंग (Flea Beetle)',
  },
  'Blister Beetle': {
    ta: 'கொப்புள வண்டு (Blister Beetle)',
    hi: 'फफोला भृंग / ब्लिस्टर बीटल (Blister Beetle)',
  },
  'White Grub': {
    ta: 'வெள்ளை வேர்ப்புழு (White Grub)',
    hi: 'सफेद लट / ग्रब (White Grub)',
  },
  'Weevil': {
    ta: 'வண்டு / மூக்கு வண்டு (Weevil)',
    hi: 'घुन / वीविल (Weevil)',
  },
  'Beetle': {
    ta: 'வண்டு (Beetle)',
    hi: 'भृंग / बीटल (Beetle)',
  },

  // Grasshoppers & Soil Pests
  'Grasshopper': {
    ta: 'வெட்டுக்கிளி (Grasshopper)',
    hi: 'टिड्डा (Grasshopper)',
  },
  'Locust': {
    ta: 'வெட்டுக்கிளி கூட்டம் (Locust)',
    hi: 'टिड्डी (Locust)',
  },
  'Mole Cricket': {
    ta: 'நிலக்குடையான் / கூழ் வெட்டுக்கிளி (Mole Cricket)',
    hi: 'झुरझुरी / तिलचट्टा (Mole Cricket)',
  },
  'Wireworm': {
    ta: 'கம்பி புழு (Wireworm)',
    hi: 'वायरवर्म (Wireworm)',
  },
};

// Host Crops Localization
export const CROP_TRANSLATIONS: Record<string, { ta: string; hi: string }> = {
  'Rice': { ta: 'நெல்', hi: 'धान / चावल' },
  'Paddy': { ta: 'நெல்', hi: 'धान' },
  'Wheat': { ta: 'கோதுமை', hi: 'गेहूं' },
  'Corn': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'Maize': { ta: 'மக்காச்சோளம்', hi: 'मक्का' },
  'Cotton': { ta: 'பருத்தி', hi: 'कपास' },
  'Sugarcane': { ta: 'கரும்பு', hi: 'गन्ना' },
  'Tomato': { ta: 'தக்காளி', hi: 'टमाटर' },
  'Potato': { ta: 'உருளைக்கிழங்கு', hi: 'आलू' },
  'Soybean': { ta: 'சோயாபீன்', hi: 'सोयाबीन' },
  'Mustard': { ta: 'கடுகு', hi: 'सरसों' },
  'Groundnut': { ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  'Cabbage': { ta: 'முட்டைக்கோஸ்', hi: 'पत्तागोभी' },
  'Cauliflower': { ta: 'காலிஃபிளவர்', hi: 'फूलगोभी' },
  'Eggplant': { ta: 'கத்தரிக்காய்', hi: 'बैंगन' },
  'Brinjal': { ta: 'கத்தரிக்காய்', hi: 'बैंगन' },
  'Chilli': { ta: 'மிளகாய்', hi: 'मिर्च' },
  'Pepper': { ta: 'மிளகு / மிளகாய்', hi: 'मिर्च' },
  'Citrus': { ta: 'எலுமிச்சை / நாரத்தை', hi: 'नींबू वर्गीय फल' },
  'Mango': { ta: 'மாம்பழம்', hi: 'आम' },
  'Apple': { ta: 'ஆப்பிள்', hi: 'सेब' },
  'Tea': { ta: 'தேயிலை', hi: 'चाय' },
  'Coffee': { ta: 'காபி', hi: 'कॉफी' },
  'Legumes': { ta: 'பருப்பு வகைகள்', hi: 'दलहन फसलें' },
  'Vegetables': { ta: 'காய்கறிகள்', hi: 'सब्जियां' },
  'Sorghum': { ta: 'சோளம்', hi: 'ज्वार' },
  'Millet': { ta: 'கம்பு / திணை', hi: 'बाजरा / मोटे अनाज' },
};

// Taxonomic Group Localization
export const GROUP_TRANSLATIONS: Record<string, { ta: string; hi: string }> = {
  'Lepidoptera': { ta: 'வண்ணத்துப்பூச்சி/அந்துப்பூச்சி இனம் (Lepidoptera)', hi: 'लेपिडोप्टेरा कीट (Lepidoptera)' },
  'Hemiptera': { ta: 'சாறு உறிஞ்சும் பூச்சியினம் (Hemiptera)', hi: 'रस चूसक कीट (Hemiptera)' },
  'Coleoptera': { ta: 'வண்டு வகை (Coleoptera)', hi: 'भृंग वर्ग (Coleoptera)' },
  'Diptera': { ta: 'ஈ வகை (Diptera)', hi: 'मक्खी वर्ग (Diptera)' },
  'Orthoptera': { ta: 'வெட்டுக்கிளி இனம் (Orthoptera)', hi: 'टिड्डा वर्ग (Orthoptera)' },
  'Thysanoptera': { ta: 'இலைப்பேன் வகை (Thysanoptera)', hi: 'थ्रिप्स कीट (Thysanoptera)' },
  'Acari': { ta: 'சிலந்தி பேன் வகை (Acari)', hi: 'माइट्स वर्ग (Acari)' },
  'Homoptera': { ta: 'தத்துப்பூச்சி இனம் (Homoptera)', hi: 'फुदका कीट (Homoptera)' },
};

/**
 * Returns localized pest name in current language if available,
 * otherwise falls back to the original English name.
 */
export function getLocalizedPestName(name: string | null | undefined, lang: string): string {
  if (!name || lang === 'en') return name || '';

  // Direct match
  if (PEST_NAME_TRANSLATIONS[name]) {
    const translation = PEST_NAME_TRANSLATIONS[name];
    if (lang === 'ta') return translation.ta;
    if (lang === 'hi') return translation.hi;
  }

  // Partial match for common terms
  for (const [key, val] of Object.entries(PEST_NAME_TRANSLATIONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      if (lang === 'ta') return `${val.ta.split('(')[0].trim()} (${name})`;
      if (lang === 'hi') return `${val.hi.split('(')[0].trim()} (${name})`;
    }
  }

  return name;
}

/**
 * Returns localized crop name in current language if available.
 */
export function getLocalizedCropName(crop: string, lang: string): string {
  if (!crop || lang === 'en') return crop;

  const trimmed = crop.trim();
  if (CROP_TRANSLATIONS[trimmed]) {
    const val = CROP_TRANSLATIONS[trimmed];
    return lang === 'ta' ? val.ta : lang === 'hi' ? val.hi : crop;
  }

  for (const [key, val] of Object.entries(CROP_TRANSLATIONS)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase())) {
      return lang === 'ta' ? val.ta : lang === 'hi' ? val.hi : crop;
    }
  }

  return crop;
}

/**
 * Returns localized group name in current language if available.
 */
export function getLocalizedGroupName(group: string, lang: string): string {
  if (!group || lang === 'en') return group;

  const trimmed = group.trim();
  if (GROUP_TRANSLATIONS[trimmed]) {
    const val = GROUP_TRANSLATIONS[trimmed];
    return lang === 'ta' ? val.ta : lang === 'hi' ? val.hi : group;
  }

  return group;
}
