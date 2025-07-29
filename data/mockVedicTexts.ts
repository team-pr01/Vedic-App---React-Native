import { VedicText } from '../types';

export const MOCK_VEDIC_TEXTS: VedicText[] = [
  {
    id: 'rigveda',
    title: 'Rigveda',
    subtitle: 'ঋগ্বেদ',
    description: 'The oldest of the four Vedas, containing hymns to various deities',
    sectionLevelName: 'Mandala',
    subsectionLevelName: 'Sukta',
    verseLevelName: 'Mantra',
    imageUrl: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'mandala-1',
        title: 'Mandala 1',
        subsections: [
          {
            id: 'sukta-1',
            title: 'Sukta 1 - Agni',
            verses: [
              {
                id: '1.1.1',
                sanskritLines: [
                  'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्।',
                  'होतारं रत्नधातमम्॥'
                ],
                devanagariLines: [
                  'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्।',
                  'होतारं रत्नधातमम्॥'
                ],
                englishTranslation: 'I praise Agni, the chosen priest, god, minister of sacrifice, the hotar, lavishest of wealth.',
                bengaliTranslation: 'আমি অগ্নিকে স্তুতি করি, যিনি পুরোহিত, যজ্ঞের দেব, ঋত্বিক, হোতা এবং সর্বশ্রেষ্ঠ ধনদাতা।',
                humanVerifiedLanguages: ['en', 'bn']
              },
              {
                id: '1.1.2',
                sanskritLines: [
                  'अग्निः पूर्वेभिरृषिभिरीड्यो नूतनैरुत।',
                  'स देवाँ एह वक्षति॥'
                ],
                devanagariLines: [
                  'अग्निः पूर्वेभिरृषिभिरीड्यो नूतनैरुत।',
                  'स देवाँ एह वक्षति॥'
                ],
                englishTranslation: 'Agni, worthy of praise by former and by present seers, may he conduct the gods here.',
                bengaliTranslation: 'অগ্নি পূর্ববর্তী ও বর্তমান ঋষিদের দ্বারা স্তুত্য, তিনি দেবগণকে এখানে আনয়ন করুন।'
              },
              {
                id: '1.1.3',
                sanskritLines: [
                  'अग्निना रयिमश्नवत्पोषमेव दिवेदिवे।',
                  'यशसं वीरवत्तमम्॥'
                ],
                devanagariLines: [
                  'अग्निना रयिमश्नवत्पोषमेव दिवेदिवे।',
                  'यशसं वीरवत्तमम्॥'
                ],
                englishTranslation: 'Through Agni may one gain wealth and prosperity day by day, glorious and most heroic.',
                bengaliTranslation: 'অগ্নির মাধ্যমে প্রতিদিন ধন ও সমৃদ্ধি, গৌরব এবং বীরত্ব লাভ করুন।'
              }
            ]
          },
          {
            id: 'sukta-2',
            title: 'Sukta 2 - Vayu',
            verses: [
              {
                id: '1.2.1',
                sanskritLines: [
                  'वायवा याहि दर्शतेमे सोमा अरंकृताः।',
                  'तेषां पाहि श्रुधी हवम्॥'
                ],
                devanagariLines: [
                  'वायवा याहि दर्शतेमे सोमा अरंकृताः।',
                  'तेषां पाहि श्रुधी हवम्॥'
                ],
                englishTranslation: 'Come, Vayu, to the beautiful soma juices that have been prepared. Drink of them and hear our call.',
                bengaliTranslation: 'এসো বায়ু, সুন্দর সোমরসে যা প্রস্তুত করা হয়েছে। তা পান করো এবং আমাদের আহ্বান শোনো।'
              }
            ]
          }
        ]
      },
      {
        id: 'mandala-2',
        title: 'Mandala 2',
        subsections: [
          {
            id: 'sukta-1',
            title: 'Sukta 1 - Agni',
            verses: [
              {
                id: '2.1.1',
                sanskritLines: [
                  'त्वमग्ने द्युभिस्त्वमाशुशुक्षणिस्त्वमद्भ्यस्त्वमश्मनस्परि।',
                  'त्वं वनेभ्यस्त्वमोषधीभ्यस्त्वं नृणां नृपते जायसे शुचिः॥'
                ],
                devanagariLines: [
                  'त्वमग्ने द्युभिस्त्वमाशुशुक्षणिस्त्वमद्भ्यस्त्वमश्मनस्परि।',
                  'त्वं वनेभ्यस्त्वमोषधीभ्यस्त्वं नृणां नृपते जायसे शुचिः॥'
                ],
                englishTranslation: 'You, Agni, are born from the heavens, from the waters, from the stone, from the forests, from the plants. You are born pure, O lord of men.',
                bengaliTranslation: 'তুমি অগ্নি, স্বর্গ থেকে, জল থেকে, পাথর থেকে, বন থেকে, উদ্ভিদ থেকে জন্মগ্রহণ করো। হে মানুষের অধিপতি, তুমি পবিত্র হয়ে জন্মগ্রহণ করো।'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'samaveda',
    title: 'Samaveda',
    subtitle: 'সামবেদ',
    description: 'The Veda of melodies and chants, containing musical hymns',
    sectionLevelName: 'Archika',
    subsectionLevelName: 'Prapathaka',
    verseLevelName: 'Saman',
    imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'archika-1',
        title: 'Archika 1',
        subsections: [
          {
            id: 'prapathaka-1',
            title: 'Prapathaka 1',
            verses: [
              {
                id: 'saman-1',
                sanskritLines: [
                  'अग्न आ याहि वीतये गृणानो हव्यदातये।',
                  'नि होता सत्सि बर्हिषि॥'
                ],
                devanagariLines: [
                  'अग्न आ याहि वीतये गृणानो हव्यदातये।',
                  'नि होता सत्सि बर्हिषि॥'
                ],
                englishTranslation: 'Come, Agni, to the feast, being praised, to receive the oblation. Sit down as the hotar on the sacred grass.',
                bengaliTranslation: 'এসো অগ্নি, উৎসবে, স্তুতি পেয়ে, আহুতি গ্রহণ করতে। পবিত্র কুশের উপর হোতা হিসেবে বসো।'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'yajurveda',
    title: 'Yajurveda',
    subtitle: 'যজুর্বেদ',
    description: 'The Veda of sacrificial formulas and rituals',
    sectionLevelName: 'Kanda',
    subsectionLevelName: 'Adhyaya',
    verseLevelName: 'Mantra',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'kanda-1',
        title: 'Kanda 1',
        subsections: [
          {
            id: 'adhyaya-1',
            title: 'Adhyaya 1',
            verses: [
              {
                id: '1.1.1',
                sanskritLines: [
                  'इषे त्वोर्जे त्वा वायवस्स्थोपायवस्स्थ देवो वः सविता प्रार्पयतु',
                  'श्रेष्ठतमाय कर्मणे आप्यायध्वमघ्निया इन्द्राय भागं प्रजावतीरनमीवा अयक्ष्मा मा व'
                ],
                devanagariLines: [
                  'इषे त्वोर्जे त्वा वायवस्स्थोपायवस्स्थ देवो वः सविता प्रार्पयतु',
                  'श्रेष्ठतमाय कर्मणे आप्यायध्वमघ्निया इन्द्राय भागं प्रजावतीरनमीवा अयक्ष्मा मा व'
                ],
                englishTranslation: 'For food thee, for strength thee! Ye are winds, ye are approachers. Let the god Savita impel you to the most excellent sacrifice.',
                bengaliTranslation: 'তোমাকে খাদ্যের জন্য, তোমাকে শক্তির জন্য! তোমরা বায়ু, তোমরা উপস্থিত। দেবতা সবিতা তোমাদের সর্বোত্তম যজ্ঞে প্রেরণ করুন।'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'atharvaveda',
    title: 'Atharvaveda',
    subtitle: 'অথর্ববেদ',
    description: 'The Veda of magical formulas and practical wisdom',
    sectionLevelName: 'Kanda',
    subsectionLevelName: 'Sukta',
    verseLevelName: 'Mantra',
    imageUrl: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'kanda-1',
        title: 'Kanda 1',
        subsections: [
          {
            id: 'sukta-1',
            title: 'Sukta 1',
            verses: [
              {
                id: '1.1.1',
                sanskritLines: [
                  'ये त्रिषप्ताः परियन्ति विश्वा रूपाणि बिभ्रतः।',
                  'वाचस्पतिर्बला तेषां तन्वो अद्य दधातु मे॥'
                ],
                devanagariLines: [
                  'ये त्रिषप्ताः परियन्ति विश्वा रूपाणि बिभ्रतः।',
                  'वाचस्पतिर्बला तेषां तन्वो अद्य दधातु मे॥'
                ],
                englishTranslation: 'The thrice-seven that go around, bearing all forms—let Vachaspati assign to me today their powers, their bodies.',
                bengaliTranslation: 'যারা তিনবার সাত হয়ে চারিদিকে ঘুরে বেড়ায়, সমস্ত রূপ ধারণ করে—বাচস্পতি আজ আমাকে তাদের শক্তি, তাদের দেহ প্রদান করুন।'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita',
    subtitle: 'ভগবদ্ গীতা',
    description: 'The divine song of spiritual wisdom',
    sectionLevelName: 'Chapter',
    subsectionLevelName: 'Section',
    verseLevelName: 'Verse',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'chapter-1',
        title: 'Chapter 1 - Arjuna Visada Yoga',
        subsections: [
          {
            id: 'section-1',
            title: 'Section 1',
            verses: [
              {
                id: '1.1',
                sanskritLines: [
                  'धृतराष्ट्र उवाच',
                  'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।',
                  'मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥'
                ],
                devanagariLines: [
                  'धृतराष्ट्र उवाच',
                  'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।',
                  'मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥'
                ],
                englishTranslation: 'Dhritarashtra said: O Sanjaya, what did my sons and the sons of Pandu do when they assembled on the holy field of Kurukshetra, eager for battle?',
                bengaliTranslation: 'ধৃতরাষ্ট্র বললেন: হে সঞ্জয়, যুদ্ধের জন্য উদ্যত হয়ে ধর্মক্ষেত্র কুরুক্ষেত্রে সমবেত আমার পুত্রগণ এবং পাণ্ডুর পুত্রগণ কী করেছিল?'
              },
              {
                id: '1.2',
                sanskritLines: [
                  'सञ्जय उवाच',
                  'दृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा।',
                  'आचार्यमुपसङ्गम्य राजा वचनमब्रवीत्॥'
                ],
                devanagariLines: [
                  'सञ्जय उवाच',
                  'दृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा।',
                  'आचार्यमुपसङ्गम्य राजा वचनमब्रवीत्॥'
                ],
                englishTranslation: 'Sanjaya said: Having seen the army of the Pandavas arrayed in military formation, King Duryodhana approached his teacher (Drona) and spoke these words.',
                bengaliTranslation: 'সঞ্জয় বললেন: পাণ্ডবদের সেনাবাহিনীকে যুদ্ধের জন্য সজ্জিত দেখে, রাজা দুর্যোধন তখন আচার্যের (দ্রোণের) কাছে গিয়ে এই কথাগুলি বললেন।'
              }
            ]
          }
        ]
      },
      {
        id: 'chapter-2',
        title: 'Chapter 2 - Sankhya Yoga',
        subsections: [
          {
            id: 'section-1',
            title: 'Section 1',
            verses: [
              {
                id: '2.47',
                sanskritLines: [
                  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
                  'मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥'
                ],
                devanagariLines: [
                  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
                  'मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥'
                ],
                englishTranslation: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.',
                bengaliTranslation: 'তোমার কর্ম করার অধিকার আছে, কিন্তু তার ফলের উপর তোমার অধিকার নেই। কর্মফলের কারণ হয়ো না, আবার অকর্মে আসক্ত হয়ো না।',
                humanVerifiedLanguages: ['en', 'bn']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'manusmriti',
    title: 'Manusmriti',
    subtitle: 'মনুস্মৃতি',
    description: 'The laws of Manu',
    sectionLevelName: 'Chapter',
    subsectionLevelName: 'Section',
    verseLevelName: 'Verse',
    imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    sections: [
      {
        id: 'chapter-1',
        title: 'Chapter 1 - Creation',
        subsections: [
          {
            id: 'section-1',
            title: 'Section 1',
            verses: [
              {
                id: '1.1',
                sanskritLines: [
                  'मनुमेकाग्रमासीनमभिगम्य महर्षयः।',
                  'प्रतिपूज्य यथान्यायमिदं वचनमब्रुवन्॥'
                ],
                devanagariLines: [
                  'मनुमेकाग्रमासीनमभिगम्य महर्षयः।',
                  'प्रतिपूज्य यथान्यायमिदं वचनमब्रुवन्॥'
                ],
                englishTranslation: 'The great sages approached Manu, who was seated with a collected mind, and, having duly worshipped him, spoke as follows.',
                bengaliTranslation: 'মহর্ষিগণ একাগ্রচিত্তে উপবিষ্ট মনুর কাছে গিয়ে, যথাযথভাবে তাঁকে সম্মান জানিয়ে, এইরূপ বললেন।'
              },
              {
                id: '1.2',
                sanskritLines: [
                  'भगवन् सर्ववर्णानां यथावदनुपूर्वशः।',
                  'अन्तरप्रभवानाञ्च धर्मान्नो वक्तुमर्हसि॥'
                ],
                devanagariLines: [
                  'भगवन् सर्ववर्णानां यथावदनुपूर्वशः।',
                  'अन्तरप्रभवानाञ्च धर्मान्नो वक्तुमर्हसि॥'
                ],
                englishTranslation: 'O divine one, deign to declare to us precisely and in due order the sacred laws of each of the (four chief) castes and of the intermediate ones.',
                bengaliTranslation: 'হে ভগবান, সমস্ত বর্ণের এবং তাদের মধ্যবর্তী বর্ণের ধর্ম যথাযথভাবে ক্রমানুসারে আমাদের বলুন।'
              }
            ]
          }
        ]
      },
      {
        id: 'chapter-2',
        title: 'Chapter 2 - Sources of the Law',
        subsections: [
          {
            id: 'section-1',
            title: 'Section 1',
            verses: [
              {
                id: '2.1',
                sanskritLines: [
                  'विद्वद्भिः सेवितः सद्भिर्नित्यमद्वेषरागिभिः।',
                  'हृदयेनाभ्यनुज्ञातो यो धर्मस्तं निबोधत॥'
                ],
                devanagariLines: [
                  'विद्वद्भिः सेवितः सद्भिर्नित्यमद्वेषरागिभिः।',
                  'हृदयेनाभ्यनुज्ञातो यो धर्मस्तं निबोधत॥'
                ],
                englishTranslation: 'Learn that sacred law which is followed by men learned (in the Veda) and assented to in their hearts by the virtuous, who are ever exempt from hatred and inordinate affection.',
                bengaliTranslation: 'সেই ধর্ম জেনে নাও যা বিদ্বান ব্যক্তিরা অনুসরণ করেন এবং সৎ ব্যক্তিরা, যারা সর্বদা ঘৃণা ও অতিরিক্ত আসক্তি থেকে মুক্ত, তাদের হৃদয়ে অনুমোদিত।'
              }
            ]
          }
        ]
      }
    ]
  }
];