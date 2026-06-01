export interface JobItem {
    id: number | string;
    title: string;
    date: string;
    category: 'results' | 'jobs' | 'answerkey' | 'admitcard' | 'syllabus' | 'notifications';
    isNew: boolean;
    isHot: boolean;
    tags: string[];
    views: number;
    content?: string;
}

export const allData: JobItem[] = [
    // RESULTS
    {id:1,title:"UPSC CSE 2025 Final Result जारी - मेरिट लिस्ट डाउनलोड करें",date:"04 Mar 2025",category:"results",isNew:true,isHot:true,tags:["upsc","cse","result"],views:45200},
    {id:2,title:"SSC CGL 2025 Tier-I Result घोषित - कट ऑफ मार्क्स देखें",date:"28 Feb 2025",category:"results",isNew:true,isHot:true,tags:["ssc","cgl","result"],views:38700},
    {id:3,title:"RRB NTPC CBT-2 Result 2025 जारी - जोन वाइज रिजल्ट",date:"25 Feb 2025",category:"results",isNew:true,isHot:false,tags:["rrb","ntpc","result"],views:31500},
    {id:4,title:"IBPS PO Mains Result 2025 जारी - इंटरव्यू शेड्यूल",date:"22 Feb 2025",category:"results",isNew:true,isHot:true,tags:["ibps","po","result"],views:28900},
    {id:5,title:"UP Police Constable Result 2025 - फाइनल मेरिट लिस्ट",date:"20 Feb 2025",category:"results",isNew:false,isHot:true,tags:["up police","constable","result"],views:52300},
    {id:6,title:"BPSC 70th Combined Exam Result 2025 जारी",date:"18 Feb 2025",category:"results",isNew:false,isHot:false,tags:["bpsc","result"],views:19800},
    {id:7,title:"CTET July 2025 Result जारी - स्कोरकार्ड डाउनलोड",date:"15 Feb 2025",category:"results",isNew:false,isHot:false,tags:["ctet","result"],views:35600},
    {id:8,title:"NEET UG 2025 Result जारी - टॉपर्स लिस्ट देखें",date:"12 Feb 2025",category:"results",isNew:true,isHot:true,tags:["neet","result","medical"],views:89100},
    {id:9,title:"SSC CHSL 2025 Tier-I Result - कट ऑफ व मेरिट लिस्ट",date:"10 Feb 2025",category:"results",isNew:false,isHot:false,tags:["ssc","chsl","result"],views:22100},
    {id:10,title:"RRB Group D Result 2025 - फाइनल सिलेक्शन लिस्ट",date:"08 Feb 2025",category:"results",isNew:false,isHot:true,tags:["rrb","group d","result"],views:41200},
    {id:11,title:"UP TET 2025 Result जारी - अंक व मेरिट देखें",date:"05 Feb 2025",category:"results",isNew:false,isHot:false,tags:["up tet","result","teacher"],views:27400},
    {id:12,title:"IBPS Clerk 2025 Prelims Result - मेन्स कॉल लेटर",date:"02 Feb 2025",category:"results",isNew:false,isHot:false,tags:["ibps","clerk","result"],views:18700},

    // LATEST JOBS
    {id:13,title:"SSC CGL 2025 ऑनलाइन फॉर्म - 15,000+ पदों की भर्ती",date:"03 Mar 2025",category:"jobs",isNew:true,isHot:true,tags:["ssc","cgl","recruitment"],views:67500},
    {id:14,title:"UPSC NDA/NA (II) 2025 भर्ती - 400+ पद",date:"01 Mar 2025",category:"jobs",isNew:true,isHot:true,tags:["upsc","nda","recruitment"],views:34500},
    {id:15,title:"RPF Constable & Sub-Inspector 2025 - 9,000+ पद",date:"28 Feb 2025",category:"jobs",isNew:true,isHot:true,tags:["rpf","constable","recruitment"],views:41200},
    {id:16,title:"IBPS Clerk 2025 भर्ती अधिसूचना - 6,000+ पद",date:"26 Feb 2025",category:"jobs",isNew:true,isHot:false,tags:["ibps","clerk","recruitment"],views:29800},
    {id:17,title:"Indian Army Agniveer 2025 भर्ती - रजिस्ट्रेशन शुरू",date:"24 Feb 2025",category:"jobs",isNew:true,isHot:true,tags:["army","agniveer","recruitment"],views:53400},
    {id:18,title:"SBI PO 2025 भर्ती - 2,000+ पद, अप्लाई करें",date:"22 Feb 2025",category:"jobs",isNew:false,isHot:true,tags:["sbi","po","recruitment"],views:37600},
    {id:19,title:"Delhi Police Head Constable 2025 - 5,500+ पद",date:"20 Feb 2025",category:"jobs",isNew:false,isHot:false,tags:["delhi police","head constable","recruitment"],views:24100},
    {id:20,title:"UP TGT/PGT Teacher 2025 भर्ती - 12,000+ पद",date:"18 Feb 2025",category:"jobs",isNew:false,isHot:true,tags:["up","teacher","recruitment"],views:42800},
    {id:21,title:"RBI Grade B 2025 भर्ती अधिसूचना जारी",date:"15 Feb 2025",category:"jobs",isNew:false,isHot:false,tags:["rbi","grade b","recruitment"],views:19300},
    {id:22,title:"SSC MTS 2025 भर्ती - 10,000+ पद, फॉर्म भरें",date:"12 Feb 2025",category:"jobs",isNew:false,isHot:false,tags:["ssc","mts","recruitment"],views:31500},
    {id:23,title:"BSF Constable 2025 भर्ती - 3,500 पदों के लिए आवेदन",date:"10 Feb 2025",category:"jobs",isNew:false,isHot:false,tags:["bsf","constable","recruitment"],views:16700},
    {id:24,title:"RRB ALP 2025 भर्ती - 18,000+ पद, नोटिफिकेशन जारी",date:"08 Feb 2025",category:"jobs",isNew:false,isHot:true,tags:["rrb","alp","recruitment"],views:47200},

    // ANSWER KEY
    {id:25,title:"UPSC CSE Prelims 2025 Answer Key जारी - पेपर I & II",date:"03 Mar 2025",category:"answerkey",isNew:true,isHot:true,tags:["upsc","prelims","answer key"],views:39200},
    {id:26,title:"SSC CHSL Tier-I 2025 Answer Key - आपत्ति दर्ज करें",date:"27 Feb 2025",category:"answerkey",isNew:true,isHot:false,tags:["ssc","chsl","answer key"],views:24500},
    {id:27,title:"RRB Group D 2025 Answer Key जारी - रिस्पॉन्स शीट",date:"24 Feb 2025",category:"answerkey",isNew:true,isHot:false,tags:["rrb","group d","answer key"],views:31800},
    {id:28,title:"CTET July 2025 Answer Key - पेपर I & II",date:"20 Feb 2025",category:"answerkey",isNew:false,isHot:false,tags:["ctet","answer key"],views:28400},
    {id:29,title:"SSC CGL 2025 Tier-I Answer Key - लिंक एक्टिव",date:"17 Feb 2025",category:"answerkey",isNew:false,isHot:true,tags:["ssc","cgl","answer key"],views:35700},
    {id:30,title:"UP TET 2025 Answer Key - आपत्ति की अंतिम तिथि",date:"14 Feb 2025",category:"answerkey",isNew:false,isHot:false,tags:["up tet","answer key"],views:19600},
    {id:31,title:"IBPS PO Prelims 2025 Answer Key - मेमोरी बेस्ड",date:"11 Feb 2025",category:"answerkey",isNew:false,isHot:false,tags:["ibps","po","answer key"],views:15300},
    {id:32,title:"RRB NTPC CBT-2 2025 Answer Key जारी",date:"08 Feb 2025",category:"answerkey",isNew:false,isHot:false,tags:["rrb","ntpc","answer key"],views:22100},
    {id:33,title:"NEET UG 2025 Answer Key & रिस्पॉन्स शीट जारी",date:"05 Feb 2025",category:"answerkey",isNew:false,isHot:true,tags:["neet","answer key"],views:72400},
    {id:34,title:"SSC GD Constable 2025 Answer Key - आपत्ति लिंक",date:"02 Feb 2025",category:"answerkey",isNew:false,isHot:false,tags:["ssc","gd","answer key"],views:26900},

    // ADMIT CARD
    {id:35,title:"SSC CGL 2025 Tier-I Admit Card डाउनलोड - जोन वाइज",date:"04 Mar 2025",category:"admitcard",isNew:true,isHot:true,tags:["ssc","cgl","admit card"],views:42100},
    {id:36,title:"UPSC NDA (II) 2025 Admit Card जारी - हॉल टिकट",date:"01 Mar 2025",category:"admitcard",isNew:true,isHot:false,tags:["upsc","nda","admit card"],views:22800},
    {id:37,title:"IBPS PO Prelims 2025 Admit Card डाउनलोड करें",date:"26 Feb 2025",category:"admitcard",isNew:true,isHot:false,tags:["ibps","po","admit card"],views:26500},
    {id:38,title:"RRB ALP 2025 CBT Admit Card - रजिस्ट्रेशन नंबर से",date:"23 Feb 2025",category:"admitcard",isNew:false,isHot:true,tags:["rrb","alp","admit card"],views:33700},
    {id:39,title:"SSC CHSL 2025 Tier-I Admit Card जारी",date:"20 Feb 2025",category:"admitcard",isNew:false,isHot:false,tags:["ssc","chsl","admit card"],views:19400},
    {id:40,title:"UP Police Constable 2025 Admit Card - एग्जाम डेट",date:"17 Feb 2025",category:"admitcard",isNew:false,isHot:true,tags:["up police","admit card"],views:38900},
    {id:41,title:"CTET July 2025 Admit Card डाउनलोड",date:"14 Feb 2025",category:"admitcard",isNew:false,isHot:false,tags:["ctet","admit card"],views:25600},
    {id:42,title:"Indian Army Agniveer 2025 Admit Card - CEE एग्जाम",date:"11 Feb 2025",category:"admitcard",isNew:false,isHot:false,tags:["army","agniveer","admit card"],views:31200},
    {id:43,title:"SBI PO 2025 Prelims Admit Card जारी",date:"08 Feb 2025",category:"admitcard",isNew:false,isHot:false,tags:["sbi","po","admit card"],views:20800},
    {id:44,title:"Delhi Police HC 2025 Admit Card - कंप्यूटर एग्जाम",date:"05 Feb 2025",category:"admitcard",isNew:false,isHot:false,tags:["delhi police","admit card"],views:16200},

    // SYLLABUS
    {id:45,title:"SSC CGL 2025 सिलेबस - Tier-I & Tier-II पूरा सिलेबस",date:"04 Mar 2025",category:"syllabus",isNew:true,isHot:true,tags:["ssc","cgl","syllabus"],views:54300},
    {id:46,title:"UPSC CSE 2025 सिलेबस - प्रारंभिक & मुख्य परीक्षा",date:"02 Mar 2025",category:"syllabus",isNew:false,isHot:true,tags:["upsc","cse","syllabus"],views:48700},
    {id:47,title:"IBPS PO 2025 सिलेबस - प्रिलिम्स & मेन्स",date:"28 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["ibps","po","syllabus"],views:31200},
    {id:48,title:"RRB NTPC 2025 सिलेबस - CBT-1 & CBT-2",date:"25 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["rrb","ntpc","syllabus"],views:27500},
    {id:49,title:"SSC CHSL 2025 सिलेबस - Tier-I पूरा सिलेबस",date:"22 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["ssc","chsl","syllabus"],views:22800},
    {id:50,title:"CTET 2025 सिलेबस - पेपर I & II विस्तृत",date:"19 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["ctet","syllabus"],views:25600},
    {id:51,title:"NEET UG 2025 सिलेबस - फिजिक्स, केमिस्ट्री, बायोलॉजी",date:"16 Feb 2025",category:"syllabus",isNew:false,isHot:true,tags:["neet","syllabus"],views:61200},
    {id:52,title:"RRB ALP 2025 सिलेबस - CBT & साइकोलॉजी टेस्ट",date:"13 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["rrb","alp","syllabus"],views:19400},
    {id:53,title:"SSC MTS 2025 सिलेबस - पेपर I पूरा सिलेबस",date:"10 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["ssc","mts","syllabus"],views:16700},
    {id:54,title:"UP TET 2025 सिलेबस - पेपर I & II विस्तृत",date:"07 Feb 2025",category:"syllabus",isNew:false,isHot:false,tags:["up tet","syllabus"],views:18300},

    // NOTIFICATIONS
    {id:55,title:"UPSC CSE 2026 नोटिफिकेशन जारी - अहम तिथियां देखें",date:"04 Mar 2025",category:"notifications",isNew:true,isHot:true,tags:["upsc","cse","notification"],views:56800},
    {id:56,title:"SSC Calendar 2025-26 जारी - सभी परीक्षा तिथियां",date:"02 Mar 2025",category:"notifications",isNew:true,isHot:true,tags:["ssc","calendar","notification"],views:43200},
    {id:57,title:"7th Pay Commission: DA बढ़ोतरी 4% की संभावना",date:"28 Feb 2025",category:"notifications",isNew:true,isHot:true,tags:["pay commission","da","notification"],views:71300},
    {id:58,title:"NEET UG 2026 रजिस्ट्रेशन शुरू - अंतिम तिथि 15 Apr",date:"25 Feb 2025",category:"notifications",isNew:true,isHot:false,tags:["neet","registration","notification"],views:38500},
    {id:59,title:"SSC CGL 2025 आवेदन की अंतिम तिथि बढ़ी - नई तारीख",date:"22 Feb 2025",category:"notifications",isNew:false,isHot:true,tags:["ssc","cgl","notification"],views:29700},
    {id:60,title:"IBPS PO 2025 आवेदन शुरू - पात्रता व अंतिम तिथि",date:"20 Feb 2025",category:"notifications",isNew:false,isHot:false,tags:["ibps","po","notification"],views:22100},
    {id:61,title:"CTET Dec 2025 परीक्षा तिथि घोषित - रजिस्ट्रेशन शुरू",date:"17 Feb 2025",category:"notifications",isNew:false,isHot:false,tags:["ctet","notification"],views:18900},
    {id:62,title:"Railway भर्ती 2025-26: 1 लाख+ पदों की भर्ती प्रक्रिया शुरू",date:"14 Feb 2025",category:"notifications",isNew:false,isHot:true,tags:["railway","recruitment","notification"],views:84500},
    {id:63,title:"UP Police नई भर्ती 2025 - 15,000 कांस्टेबल पद",date:"11 Feb 2025",category:"notifications",isNew:false,isHot:false,tags:["up police","notification"],views:33600},
    {id:64,title:"UGC NET June 2025 नोटिफिकेशन जारी - पात्रता व तिथि",date:"08 Feb 2025",category:"notifications",isNew:false,isHot:false,tags:["ugc net","notification"],views:21500},
];

export const tickerItems = [
    "UPSC CSE 2025 Final Result जारी - मेरिट लिस्ट डाउनलोड करें",
    "SSC CGL 2025 Tier-I Result घोषित - कट ऑफ मार्क्स देखें",
    "NEET UG 2025 Result जारी - टॉपर्स लिस्ट",
    "7th Pay Commission: DA बढ़ोतरी 4% की संभावना",
    "SSC Calendar 2025-26 जारी - सभी परीक्षा तिथियां",
    "Railway भर्ती 2025: 1 लाख+ पदों की प्रक्रिया शुरू",
    "UPSC NDA/NA (II) 2025 भर्ती - 400+ पद",
    "RPF Constable 2025 - 9,000+ पदों की भर्ती",
    "Indian Army Agniveer 2025 भर्ती शुरू",
    "SBI PO 2025 भर्ती अधिसूचना - 2,000+ पद",
];

export const quickLinks = [
    {name:"SSC Official",url:"https://ssc.nic.in"},
    {name:"UPSC Official",url:"https://upsc.gov.in"},
    {name:"RRB Official",url:"https://indianrailways.gov.in"},
    {name:"IBPS Official",url:"https://ibps.in"},
    {name:"CTET Official",url:"https://ctet.nic.in"},
    {name:"NEET Official",url:"https://neet.nta.nic.in"},
    {name:"NDA Official",url:"https://upsc.gov.in"},
    {name:"SBI Careers",url:"https://sbi.co.in/careers"},
];

export const categoryMap = {
    results:{icon:"🏆",label:"Results",hindi:"रिजल्ट", color: "from-red-600 to-red-800"},
    jobs:{icon:"💼",label:"Latest Jobs",hindi:"नवीनतम नौकरियां", color: "from-red-600 to-red-800"},
    answerkey:{icon:"🔑",label:"Answer Key",hindi:"आंसर की", color: "from-red-600 to-red-800"},
    admitcard:{icon:"🎫",label:"Admit Card",hindi:"एडमिट कार्ड", color: "from-red-600 to-red-800"},
    syllabus:{icon:"📖",label:"Syllabus",hindi:"सिलेबस", color: "from-red-600 to-red-800"},
    notifications:{icon:"🔔",label:"Notifications",hindi:"नोटिफिकेशन", color: "from-red-600 to-red-800"}
};
