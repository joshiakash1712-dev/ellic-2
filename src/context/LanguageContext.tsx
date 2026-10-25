import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import {
  LOCALE_RESOURCES,
  LocaleMessages,
  TranslateOptions,
  getFlattenedKeyMap,
  getLocalePhraseDictionary,
  translateWithKeyOrPhrase
} from '../locales';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: 'Indian' | 'Global';
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Default
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global', dir: 'ltr' },

  // Indian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Indian', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Indian', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Indian', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Indian', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Indian', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Indian', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Indian', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Indian', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Indian', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Indian', dir: 'rtl' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Indian', dir: 'ltr' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Indian', dir: 'ltr' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Indian', dir: 'ltr' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Indian', dir: 'ltr' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', region: 'Indian', dir: 'rtl' },
  { code: 'gom', name: 'Konkani', nativeName: 'कोंकणी', region: 'Indian', dir: 'ltr' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Indian', dir: 'ltr' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'Indian', dir: 'ltr' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'Indian', dir: 'ltr' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', region: 'Indian', dir: 'ltr' },
  { code: 'mni-Mtei', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', region: 'Indian', dir: 'ltr' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Indian', dir: 'ltr' },

  // Global Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Global', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Global', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Global', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Global', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Global', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Global', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Global', dir: 'ltr' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', region: 'Global', dir: 'ltr' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', region: 'Global', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Global', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Global', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Global', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Global', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Global', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Global', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Global', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'Global', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Global', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'Global', dir: 'ltr' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', region: 'Global', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', region: 'Global', dir: 'rtl' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'Global', dir: 'ltr' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', region: 'Global', dir: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'Global', dir: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Global', dir: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'Global', dir: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', region: 'Global', dir: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'Global', dir: 'ltr' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'Global', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'Global', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'Global', dir: 'ltr' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', region: 'Global', dir: 'ltr' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', region: 'Global', dir: 'ltr' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', region: 'Global', dir: 'ltr' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', region: 'Global', dir: 'ltr' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', region: 'Global', dir: 'ltr' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', region: 'Global', dir: 'ltr' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', region: 'Global', dir: 'ltr' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', region: 'Global', dir: 'ltr' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', region: 'Global', dir: 'ltr' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', region: 'Global', dir: 'ltr' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', region: 'Global', dir: 'ltr' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', region: 'Global', dir: 'ltr' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', region: 'Global', dir: 'ltr' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', region: 'Global', dir: 'ltr' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Global', dir: 'ltr' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Global', dir: 'ltr' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', region: 'Global', dir: 'ltr' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', region: 'Global', dir: 'ltr' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', region: 'Global', dir: 'ltr' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', region: 'Global', dir: 'ltr' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'Global', dir: 'ltr' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', region: 'Global', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', region: 'Global', dir: 'ltr' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', region: 'Global', dir: 'ltr' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', region: 'Global', dir: 'ltr' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', region: 'Global', dir: 'ltr' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', region: 'Global', dir: 'ltr' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', region: 'Global', dir: 'ltr' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', region: 'Global', dir: 'ltr' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', region: 'Global', dir: 'ltr' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', region: 'Global', dir: 'ltr' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', region: 'Global', dir: 'ltr' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', region: 'Global', dir: 'ltr' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', region: 'Global', dir: 'ltr' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', region: 'Global', dir: 'ltr' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', region: 'Global', dir: 'ltr' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', region: 'Global', dir: 'rtl' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', region: 'Global', dir: 'ltr' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', region: 'Global', dir: 'ltr' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', region: 'Global', dir: 'ltr' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', region: 'Global', dir: 'ltr' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', region: 'Global', dir: 'ltr' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', region: 'Global', dir: 'ltr' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', region: 'Global', dir: 'ltr' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', region: 'Global', dir: 'ltr' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'Global', dir: 'ltr' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', region: 'Global', dir: 'ltr' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'Global', dir: 'ltr' }
];

// Instant built-in dictionary for high-frequency core UI phrases so primary navigation & POS controls translate in 0ms even offline
const CORE_DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    'Dashboard': 'डैशबोर्ड',
    'Home': 'होम',
    'POS Billing': 'पीओएस बिलिंग',
    'POS': 'पीओएस',
    'POS Bill': 'पीओएस बिल',
    'Inventory & Stock': 'इन्वेंटरी और स्टॉक',
    'Stock': 'स्टॉक',
    'Customers & Khata': 'ग्राहक और खाता',
    'Customers': 'ग्राहक',
    'Store Suppliers': 'स्टोर आपूर्तिकर्ता',
    'Suppliers': 'आपूर्तिकर्ता',
    'Reports & GST': 'रिपोर्ट और जीएसटी',
    'Reports': 'रिपोर्ट',
    'Invoice Templates': 'चालान टेम्पलेट्स',
    'Templates': 'टेम्पलेट्स',
    'Store Crew & Roles': 'स्टोर स्टाफ और भूमिकाएं',
    'Crew': 'स्टाफ',
    'Customer Journey Map': 'ग्राहक यात्रा मानचित्र',
    'Journey': 'यात्रा',
    'My Sales': 'मेरी बिक्री',
    'Shift & Store Summary': 'शिफ्ट और स्टोर सारांश',
    'Shift': 'शिफ्ट',
    'Orders & Quotes': 'ऑर्डर और कोटेशन',
    'Orders': 'ऑर्डर',
    'Bulk Catalog': 'थोक कैटलॉग',
    'Catalog': 'कैटलॉग',
    'Connected Retailers': 'जुड़े हुए खुदरा विक्रेता',
    'Retailers': 'खुदरा विक्रेता',
    'Platform Console': 'प्लेटफ़ॉर्म कंसोल',
    'Platform': 'प्लेटफ़ॉर्म',
    'Console': 'कंसोल',
    'Store': 'स्टोर',
    'Wholesale': 'थोक',
    'Admin': 'एडमिन',
    'Menu': 'मेनू',
    'More': 'अधिक',
    'Sign In': 'साइन इन करें',
    'Sign Out': 'साइन आउट',
    'Get Started': 'शुरू करें',
    'App Demo': 'ऐप डेमो',
    'Open Console': 'कंसोल खोलें',
    'Exit Demo': 'डेमो से बाहर निकलें',
    'Product': 'उत्पाद',
    'Features': 'विशेषताएं',
    'How It Works': 'यह कैसे काम करता है',
    'Guide': 'गाइड',
    'System Settings': 'सिस्टम सेटिंग्स',
    'Preferences': 'प्राथमिकताएं',
    'Appearance & Theme': 'दिखावट और थीम',
    'Subscription & Billing': 'सदस्यता और बिलिंग',
    'Storage & Diagnostics': 'स्टोरेज और डायग्नोस्टिक्स',
    'About System': 'सिस्टम के बारे में',
    'Dark Theme': 'डार्क थीम',
    'High-Contrast Light': 'हाई-कॉन्ट्रास्ट लाइट',
    'Active Store': 'सक्रिय स्टोर',
    'Assigned Store': 'आवंटित स्टोर',
    'Products': 'उत्पाद',
    'Invoices': 'चालान',
    'Language': 'भाषा',
    'Select Language': 'भाषा चुनें',
    'Search any language...': 'कोई भी भाषा खोजें...',
    'Offline': 'ऑफ़लाइन',
    'Online': 'ऑनलाइन',
    'Cancel': 'रद्द करें',
    'Save': 'सहेजें'
  },
  mr: {
    'Dashboard': 'डॅशबोर्ड',
    'Home': 'मुख्यपृष्ठ',
    'POS Billing': 'पीओएस बिलिंग',
    'POS': 'पीओएस',
    'POS Bill': 'पीओएस बिल',
    'Inventory & Stock': 'इन्व्हेंटरी आणि स्टॉक',
    'Stock': 'स्टॉक',
    'Customers & Khata': 'ग्राहक आणि खाते',
    'Customers': 'ग्राहक',
    'Store Suppliers': 'पुरवठादार',
    'Suppliers': 'पुरवठादार',
    'Reports & GST': 'अहवाल आणि जीएसटी',
    'Reports': 'अहवाल',
    'Invoice Templates': 'इनव्हॉइस टेम्पलेट्स',
    'Templates': 'टेम्पलेट्स',
    'Store Crew & Roles': 'स्टोअर कर्मचारी आणि भूमिका',
    'Crew': 'कर्मचारी',
    'My Sales': 'माझी विक्री',
    'Store': 'स्टोअर',
    'Wholesale': 'घाऊक',
    'Admin': 'अॅडमिन',
    'Menu': 'मेनू',
    'More': 'अधिक',
    'Sign In': 'साइन इन करा',
    'Sign Out': 'साइन आउट',
    'Get Started': 'सुरू करा',
    'App Demo': 'अॅप डेमो',
    'Exit Demo': 'डेमो बंद करा',
    'System Settings': 'सिस्टम सेटिंग्ज',
    'Language': 'भाषा',
    'Select Language': 'भाषा निवडा'
  },
  gu: {
    'Dashboard': 'ડેશબોર્ડ',
    'Home': 'હોમ',
    'POS Billing': 'પીઓએસ બિલિંગ',
    'POS': 'પીઓએસ',
    'Inventory & Stock': 'ઇન્વેન્ટરી અને સ્ટોક',
    'Stock': 'સ્ટોક',
    'Customers & Khata': 'ગ્રાહકો અને ખાતા',
    'Customers': 'ગ्राहકો',
    'Store Suppliers': 'સપ્લાયર્સ',
    'Suppliers': 'સપ્લાયર્સ',
    'Reports & GST': 'રિપોર્ટ્સ અને જીએસટી',
    'Reports': 'રિપોર્ટ્સ',
    'Invoice Templates': 'ઇન્વોઇસ ટેમ્પલેટ્સ',
    'Store Crew & Roles': 'સ્ટોર સ્ટાફ અને ભૂમિકાઓ',
    'My Sales': 'મારું વેચાણ',
    'Store': 'સ્ટોર',
    'Wholesale': 'જથ્થાબંધ',
    'Admin': 'એડમિન',
    'Sign In': 'સાઇન ઇन કરો',
    'Sign Out': 'સાઇન આઉટ',
    'Get Started': 'શરૂ કરો',
    'App Demo': 'એપ ડેમો',
    'Exit Demo': 'ડેમો બંધ કરો',
    'System Settings': 'સિસ્ટમ સેટિંગ્સ',
    'Language': 'ભાષા'
  },
  ta: {
    'Dashboard': 'டாஷ்போர்டு',
    'Home': 'முகப்பு',
    'POS Billing': 'பிஓஎஸ் பில்லிங்',
    'POS': 'பிஓஎஸ்',
    'Inventory & Stock': 'சரக்கு மற்றும் இருப்பு',
    'Stock': 'இருப்பு',
    'Customers & Khata': 'வாடிக்கையாளர்கள் & கணக்கு',
    'Customers': 'வாடிக்கையாளர்கள்',
    'Store Suppliers': 'சப்ளையர்கள்',
    'Suppliers': 'சப்ளையர்கள்',
    'Reports & GST': 'அறிக்கைகள் & ஜிஎஸ்டி',
    'Reports': 'அறிக்கைகள்',
    'Invoice Templates': 'விலைப்பட்டியல் வார்ப்புருக்கள்',
    'Store Crew & Roles': 'பணியாளர்கள் & பொறுப்புகள்',
    'My Sales': 'எனது விற்பனை',
    'Store': 'கடை',
    'Wholesale': 'மொத்த விற்பனை',
    'Admin': 'நிர்வாகம்',
    'Sign In': 'உள்நுழைய',
    'Sign Out': 'வெளியேறு',
    'Get Started': 'தொடங்குங்கள்',
    'App Demo': 'செயலி டெமோ',
    'Exit Demo': 'டெமோவிலிருந்து வெளியேறு',
    'System Settings': 'கணினி அமைப்புகள்',
    'Language': 'மொழி'
  },
  te: {
    'Dashboard': 'డ్యాష్‌బోర్డ్',
    'Home': 'హోమ్',
    'POS Billing': 'పీఓఎస్ బిల్లింగ్',
    'Inventory & Stock': 'ఇన్వెంటరీ & స్టాక్',
    'Stock': 'స్టాక్',
    'Customers & Khata': 'కస్టమర్లు & ఖాతా',
    'Customers': 'కస్టమర్లు',
    'Store Suppliers': 'సరఫరాదారులు',
    'Reports & GST': 'నివేదికలు & జీఎస్టీ',
    'My Sales': 'నా అమ్మకాలు',
    'Store': 'స్టోర్',
    'Wholesale': 'హోల్‌సేల్',
    'Admin': 'అడ్మిన్',
    'Sign In': 'సైన్ ఇన్',
    'Sign Out': 'సైన్ అవుట్',
    'Get Started': 'ప్రారంభించండి',
    'App Demo': 'యాప్ డెమో',
    'Exit Demo': 'డెమో నుండి నిష్క్రమించు',
    'System Settings': 'సిస్టమ్ సెట్టింగ్‌లు',
    'Language': 'భాష'
  },
  bn: {
    'Dashboard': 'ড্যাশবোর্ড',
    'Home': 'হোম',
    'POS Billing': 'পিওএস বিলিং',
    'Inventory & Stock': 'ইনভেন্টরি ও স্টক',
    'Stock': 'স্টক',
    'Customers & Khata': 'গ্রাহক ও খাতা',
    'Customers': 'গ্রাহক',
    'Store Suppliers': 'সরবরাহকারী',
    'Reports & GST': 'রিপোর্ট ও জিএসটি',
    'My Sales': 'আমার বিক্রয়',
    'Store': 'স্টোর',
    'Wholesale': 'পাইকারি',
    'Admin': 'অ্যাডমিন',
    'Sign In': 'সাইন ইন',
    'Sign Out': 'সাইন আউট',
    'Get Started': 'শুরু করুন',
    'App Demo': 'অ্যাপ ডেমো',
    'Exit Demo': 'ডেমো প্রস্থান',
    'System Settings': 'সিস্টেম সেটিংস',
    'Language': 'ভাষা'
  },
  es: {
    'Dashboard': 'Panel de Control',
    'Home': 'Inicio',
    'POS Billing': 'Facturación POS',
    'Inventory & Stock': 'Inventario y Stock',
    'Stock': 'Inventario',
    'Customers & Khata': 'Clientes y Crédito',
    'Customers': 'Clientes',
    'Store Suppliers': 'Proveedores',
    'Suppliers': 'Proveedores',
    'Reports & GST': 'Informes e Impuestos',
    'Reports': 'Informes',
    'Invoice Templates': 'Plantillas de Factura',
    'Store Crew & Roles': 'Personal y Roles',
    'My Sales': 'Mis Ventas',
    'Store': 'Tienda',
    'Wholesale': 'Mayorista',
    'Admin': 'Admin',
    'Sign In': 'Iniciar Sesión',
    'Sign Out': 'Cerrar Sesión',
    'Get Started': 'Comenzar',
    'App Demo': 'Demo Interactiva',
    'Exit Demo': 'Salir de Demo',
    'System Settings': 'Configuración del Sistema',
    'Language': 'Idioma'
  },
  fr: {
    'Dashboard': 'Tableau de Bord',
    'Home': 'Accueil',
    'POS Billing': 'Facturation PDV',
    'Inventory & Stock': 'Inventaire et Stock',
    'Stock': 'Stock',
    'Customers & Khata': 'Clients et Crédit',
    'Customers': 'Clients',
    'Store Suppliers': 'Fournisseurs',
    'Suppliers': 'Fournisseurs',
    'Reports & GST': 'Rapports et Taxes',
    'Reports': 'Rapports',
    'Invoice Templates': 'Modèles de Facture',
    'Store Crew & Roles': 'Équipe et Rôles',
    'My Sales': 'Mes Ventes',
    'Store': 'Magasin',
    'Wholesale': 'Grossiste',
    'Admin': 'Admin',
    'Sign In': 'Connexion',
    'Sign Out': 'Déconnexion',
    'Get Started': 'Commencer',
    'App Demo': 'Démo App',
    'Exit Demo': 'Quitter la Démo',
    'System Settings': 'Paramètres Système',
    'Language': 'Langue'
  },
  de: {
    'Dashboard': 'Übersicht',
    'Home': 'Start',
    'POS Billing': 'Kassenabrechnung',
    'Inventory & Stock': 'Inventar & Bestand',
    'Stock': 'Bestand',
    'Customers & Khata': 'Kunden & Kredit',
    'Customers': 'Kunden',
    'Store Suppliers': 'Lieferanten',
    'Reports & GST': 'Berichte & Steuern',
    'Invoice Templates': 'Rechnungsvorlagen',
    'Store Crew & Roles': 'Personal & Rollen',
    'My Sales': 'Meine Verkäufe',
    'Store': 'Filiale',
    'Wholesale': 'Großhandel',
    'Admin': 'Admin',
    'Sign In': 'Anmelden',
    'Sign Out': 'Abmelden',
    'Get Started': 'Jetzt starten',
    'App Demo': 'App-Demo',
    'Exit Demo': 'Demo beenden',
    'System Settings': 'Systemeinstellungen',
    'Language': 'Sprache'
  },
  ar: {
    'Dashboard': 'لوحة التحكم',
    'Home': 'الرئيسية',
    'POS Billing': 'فواتير نقاط البيع',
    'Inventory & Stock': 'المخزون والبضائع',
    'Stock': 'المخزون',
    'Customers & Khata': 'العملاء والحسابات',
    'Customers': 'العملاء',
    'Store Suppliers': 'الموردون',
    'Reports & GST': 'التقارير والضرائب',
    'Invoice Templates': 'قوالب الفواتير',
    'Store Crew & Roles': 'الموظفون والأدوار',
    'My Sales': 'مبيعاتي',
    'Store': 'المتجر',
    'Wholesale': 'الجملة',
    'Admin': 'المسؤول',
    'Sign In': 'تسجيل الدخول',
    'Sign Out': 'تسجيل الخروج',
    'Get Started': 'ابدأ الآن',
    'App Demo': 'عرض تجريبي',
    'Exit Demo': 'إنهاء العرض',
    'System Settings': 'إعدادات النظام',
    'Language': 'اللغة'
  }
};

const STORAGE_LANG_KEY = 'ellix_app_language';
const STORAGE_CACHE_PREFIX = 'ellix_i18n_cache_v1_';

// Patterns that should NEVER be translated (numbers, currency, IDs, GSTINs, barcodes, emails, URLs)
const NON_TRANSLATABLE_REGEX =
  /^(\s*|[0-9.,:%+\-₹$€£¥/()•·|→←✓×#]+|INV-[A-Z0-9-]+|ORD-[A-Z0-9-]+|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]|[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/\S+|v[0-9]+\.[0-9]+(\.[0-9]+)?)$/i;

function isTranslatablePhrase(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 600) return false;
  if (NON_TRANSLATABLE_REGEX.test(trimmed)) return false;
  // Must contain at least one letter
  if (!/[a-zA-Z\u00C0-\u024F]/.test(trimmed)) return false;
  return true;
}

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  currentLanguageInfo: LanguageOption;
  languages: LanguageOption[];
  isTranslating: boolean;
  t: (keyOrText: string, optionsOrDefault?: TranslateOptions | string) => string;
  localeMessages: LocaleMessages;
  resetLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved ? saved.trim() : 'en';
    } catch {
      return 'en';
    }
  });
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [cacheVersion, setCacheVersion] = useState<number>(0);

  // Per-language translation cache in memory + localStorage
  const translationCacheRef = useRef<Map<string, Record<string, string>>>(new Map());
  const inFlightPhrasesRef = useRef<Set<string>>(new Set());

  // WeakMaps to track original English text on DOM Text nodes and Element attributes without mutating DOM tree structure
  const textNodeMetaRef = useRef<
    WeakMap<Text, { original: string; lastApplied: string; lang: string }>
  >(new WeakMap());
  const trackedTextNodesRef = useRef<Set<Text>>(new Set());

  const elementAttrMetaRef = useRef<
    WeakMap<Element, { placeholder?: string; title?: string; ariaLabel?: string }>
  >(new WeakMap());
  const trackedElementsRef = useRef<Set<Element>>(new Set());

  const loadLangCache = useCallback((lang: string): Record<string, string> => {
    if (lang === 'en') return {};
    const existing = translationCacheRef.current.get(lang);
    if (existing) return existing;

    const baseLang = lang.split('-')[0].toLowerCase();
    const merged: Record<string, string> = {
      ...(CORE_DICTIONARY[baseLang] || {}),
      ...(CORE_DICTIONARY[lang] || {}),
      ...getLocalePhraseDictionary(lang),
      ...getFlattenedKeyMap(lang)
    };
    try {
      const raw = localStorage.getItem(`${STORAGE_CACHE_PREFIX}${lang}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(merged, parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
    translationCacheRef.current.set(lang, merged);
    return merged;
  }, []);

  const saveLangCache = useCallback((lang: string, cacheObj: Record<string, string>) => {
    if (lang === 'en') return;
    translationCacheRef.current.set(lang, cacheObj);
    try {
      localStorage.setItem(`${STORAGE_CACHE_PREFIX}${lang}`, JSON.stringify(cacheObj));
    } catch {
      // ignore quota errors
    }
  }, []);

  const currentLanguageInfo = useMemo<LanguageOption>(() => {
    const found = SUPPORTED_LANGUAGES.find(
      l => l.code.toLowerCase() === language.toLowerCase()
    );
    if (found) return found;
    return {
      code: language,
      name: language.toUpperCase(),
      nativeName: language.toUpperCase(),
      region: 'Global',
      dir: 'ltr'
    };
  }, [language]);

  const setLanguage = useCallback((code: string) => {
    const clean = (code || 'en').trim();
    setLanguageState(clean);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, clean);
    } catch {
      // ignore
    }
  }, []);

  const resetLanguage = useCallback(() => {
    setLanguage('en');
  }, [setLanguage]);

  const localeMessages = useMemo<LocaleMessages>(() => {
    const baseLang = language.split('-')[0].toLowerCase();
    return LOCALE_RESOURCES[language] || LOCALE_RESOURCES[baseLang] || LOCALE_RESOURCES.en;
  }, [language]);

  const t = useCallback(
    (keyOrText: string, optionsOrDefault?: TranslateOptions | string): string => {
      if (!keyOrText) return '';
      const cache = language === 'en' ? undefined : loadLangCache(language);
      return translateWithKeyOrPhrase(keyOrText, language, cache, optionsOrDefault);
    },
    [language, loadLangCache, cacheVersion]
  );

  // Translate a batch of phrases using Google GTX neural endpoint with automatic caching
  const fetchMissingTranslations = useCallback(
    async (targetLang: string, phrases: string[]) => {
      if (targetLang === 'en' || phrases.length === 0) return;
      const cache = loadLangCache(targetLang);
      const toFetch = phrases.filter(p => {
        const key = `${targetLang}::${p}`;
        return !cache[p] && !inFlightPhrasesRef.current.has(key);
      });
      if (toFetch.length === 0) return;

      toFetch.forEach(p => inFlightPhrasesRef.current.add(`${targetLang}::${p}`));
      setIsTranslating(true);

      try {
        // Process in chunks of 25 phrases separated by newline delimiter for fast single-request batching
        const CHUNK_SIZE = 25;
        let updatedAny = false;

        for (let i = 0; i < toFetch.length; i += CHUNK_SIZE) {
          const chunk = toFetch.slice(i, i + CHUNK_SIZE);
          const joined = chunk.join('\n ||| \n');
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
            targetLang
          )}&dt=t&q=${encodeURIComponent(joined)}`;

          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && Array.isArray(data[0])) {
                const fullTranslated = data[0]
                  .map((part: any) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
                  .join('');
                const splitParts = fullTranslated.split(/\s*\|\|\|\s*/);
                if (splitParts.length === chunk.length) {
                  chunk.forEach((origPhrase, idx) => {
                    const tr = splitParts[idx]?.trim();
                    if (tr) {
                      cache[origPhrase] = tr;
                      updatedAny = true;
                    }
                  });
                } else {
                  // Fallback individual requests if delimiter count mismatched
                  await Promise.all(
                    chunk.map(async origPhrase => {
                      try {
                        const singleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
                          targetLang
                        )}&dt=t&q=${encodeURIComponent(origPhrase)}`;
                        const sRes = await fetch(singleUrl);
                        if (sRes.ok) {
                          const sData = await sRes.json();
                          const sTr = Array.isArray(sData?.[0])
                            ? sData[0].map((p: any) => p?.[0] || '').join('').trim()
                            : '';
                          if (sTr) {
                            cache[origPhrase] = sTr;
                            updatedAny = true;
                          }
                        }
                      } catch {
                        // ignore individual network error
                      }
                    })
                  );
                }
              }
            }
          } catch {
            // ignore offline/network error; built-in dictionary remains active
          }
        }

        if (updatedAny) {
          saveLangCache(targetLang, cache);
          setCacheVersion(v => v + 1);
        }
      } finally {
        toFetch.forEach(p => inFlightPhrasesRef.current.delete(`${targetLang}::${p}`));
        setIsTranslating(false);
      }
    },
    [loadLangCache, saveLangCache]
  );

  // Apply or restore translations across the DOM in-place (preserving React Text node references)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language || 'en';
    document.documentElement.dir = currentLanguageInfo.dir || 'ltr';

    // When switched back to English, restore all tracked Text nodes and attributes immediately
    if (language === 'en') {
      trackedTextNodesRef.current.forEach(node => {
        if (!node.isConnected) {
          trackedTextNodesRef.current.delete(node);
          return;
        }
        const meta = textNodeMetaRef.current.get(node);
        if (meta && node.nodeValue === meta.lastApplied && node.nodeValue !== meta.original) {
          node.nodeValue = meta.original;
        }
      });

      trackedElementsRef.current.forEach(el => {
        if (!el.isConnected) {
          trackedElementsRef.current.delete(el);
          return;
        }
        const attrMeta = elementAttrMetaRef.current.get(el);
        if (attrMeta) {
          if (attrMeta.placeholder !== undefined && el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', attrMeta.placeholder);
          }
          if (attrMeta.title !== undefined && el.hasAttribute('title')) {
            el.setAttribute('title', attrMeta.title);
          }
          if (attrMeta.ariaLabel !== undefined && el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', attrMeta.ariaLabel);
          }
        }
      });
      return;
    }

    const cache = loadLangCache(language);

    const shouldSkipElement = (el: Element | null): boolean => {
      if (!el) return true;
      const tag = el.tagName;
      if (
        tag === 'SCRIPT' ||
        tag === 'STYLE' ||
        tag === 'NOSCRIPT' ||
        tag === 'CODE' ||
        tag === 'PRE' ||
        tag === 'SVG' ||
        tag === 'PATH' ||
        tag === 'TEXTAREA'
      ) {
        return true;
      }
      if (el.closest('[data-no-translate="true"], .notranslate, .font-mono')) {
        return true;
      }
      return false;
    };

    const scanAndTranslateRoot = (root: Node) => {
      const missingPhrases = new Set<string>();

      // 1. Walk Text Nodes
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode() as Text | null;

      while (currentNode) {
        const parent = currentNode.parentElement;
        if (!shouldSkipElement(parent)) {
          const rawVal = currentNode.nodeValue || '';
          let meta = textNodeMetaRef.current.get(currentNode);

          // If React updated the text node to a new value, update original source text
          if (!meta || (rawVal !== meta.lastApplied && rawVal !== meta.original)) {
            meta = {
              original: rawVal,
              lastApplied: rawVal,
              lang: 'en'
            };
            textNodeMetaRef.current.set(currentNode, meta);
            trackedTextNodesRef.current.add(currentNode);
          }

          const origTrimmed = meta.original.trim();
          if (isTranslatablePhrase(origTrimmed)) {
            const translatedTrimmed = cache[origTrimmed];
            if (translatedTrimmed) {
              const leadingSpace = meta.original.match(/^\s*/)?.[0] || '';
              const trailingSpace = meta.original.match(/\s*$/)?.[0] || '';
              const nextVal = `${leadingSpace}${translatedTrimmed}${trailingSpace}`;
              if (currentNode.nodeValue !== nextVal) {
                currentNode.nodeValue = nextVal;
              }
              meta.lastApplied = nextVal;
              meta.lang = language;
            } else {
              missingPhrases.add(origTrimmed);
            }
          }
        }
        currentNode = walker.nextNode() as Text | null;
      }

      // 2. Translate Element Attributes (placeholder, title, aria-label)
      if (root instanceof Element || root instanceof Document) {
        const elements = (root as ParentNode).querySelectorAll
          ? (root as ParentNode).querySelectorAll('[placeholder], [title], [aria-label]')
          : [];
        elements.forEach(el => {
          if (shouldSkipElement(el)) return;
          let attrMeta = elementAttrMetaRef.current.get(el);
          if (!attrMeta) {
            attrMeta = {
              placeholder: el.getAttribute('placeholder') || undefined,
              title: el.getAttribute('title') || undefined,
              ariaLabel: el.getAttribute('aria-label') || undefined
            };
            elementAttrMetaRef.current.set(el, attrMeta);
            trackedElementsRef.current.add(el);
          }

          if (attrMeta.placeholder) {
            const pTrim = attrMeta.placeholder.trim();
            if (isTranslatablePhrase(pTrim)) {
              if (cache[pTrim]) {
                el.setAttribute('placeholder', cache[pTrim]);
              } else {
                missingPhrases.add(pTrim);
              }
            }
          }
          if (attrMeta.title) {
            const tTrim = attrMeta.title.trim();
            if (isTranslatablePhrase(tTrim)) {
              if (cache[tTrim]) {
                el.setAttribute('title', cache[tTrim]);
              } else {
                missingPhrases.add(tTrim);
              }
            }
          }
        });
      }

      if (missingPhrases.size > 0) {
        fetchMissingTranslations(language, Array.from(missingPhrases));
      }
    };

    // Initial scan
    scanAndTranslateRoot(document.body);

    // Observe dynamic React renders & modal openings
    let debounceTimer: number | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        scanAndTranslateRoot(document.body);
      }, 60);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      observer.disconnect();
    };
  }, [language, currentLanguageInfo.dir, loadLangCache, fetchMissingTranslations]);

  // Re-run DOM pass whenever newly fetched translations arrive in cache
  useEffect(() => {
    if (language === 'en' || typeof document === 'undefined') return;
    const cache = loadLangCache(language);
    trackedTextNodesRef.current.forEach(node => {
      if (!node.isConnected) {
        trackedTextNodesRef.current.delete(node);
        return;
      }
      const meta = textNodeMetaRef.current.get(node);
      if (!meta) return;
      const origTrimmed = meta.original.trim();
      const translatedTrimmed = cache[origTrimmed];
      if (translatedTrimmed) {
        const leadingSpace = meta.original.match(/^\s*/)?.[0] || '';
        const trailingSpace = meta.original.match(/\s*$/)?.[0] || '';
        const nextVal = `${leadingSpace}${translatedTrimmed}${trailingSpace}`;
        if (node.nodeValue !== nextVal) {
          node.nodeValue = nextVal;
        }
        meta.lastApplied = nextVal;
        meta.lang = language;
      }
    });

    trackedElementsRef.current.forEach(el => {
      if (!el.isConnected) {
        trackedElementsRef.current.delete(el);
        return;
      }
      const attrMeta = elementAttrMetaRef.current.get(el);
      if (!attrMeta) return;
      if (attrMeta.placeholder) {
        const pTrim = attrMeta.placeholder.trim();
        if (cache[pTrim]) el.setAttribute('placeholder', cache[pTrim]);
      }
      if (attrMeta.title) {
        const tTrim = attrMeta.title.trim();
        if (cache[tTrim]) el.setAttribute('title', cache[tTrim]);
      }
    });
  }, [cacheVersion, language, loadLangCache]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo,
        languages: SUPPORTED_LANGUAGES,
        isTranslating,
        t,
        localeMessages,
        resetLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
