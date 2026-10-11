import { FaBook, FaInstagram, FaLinkedin, FaMedium, FaWhatsapp, FaYoutube } from 'react-icons/fa6'

export const siteOwner = {
  name: 'Manohar Batra',
  tagline: 'College to Corporate',
  photo: '/images/creators/manohar_batra.png',
}

// Scrolling messages in the announcement bar at the top of every site page.
export const announcements = [
  '🚀 Know your Worth by comparing with other IT Professionals',
  '📢 Added 800+ companies which are hiring - Buy it now.',
  '✨ Buy any Course (React or Java or Corporate/College Coaching) and Get Real Resumes for FREE as reference.',
  '✨ Make use of course members whatsapp group for referrals',
]

// Hero copy that rotates every few seconds.
export const heroSlides = [
  { headline: 'Master Corporate Skills', detail: 'Learn Corporate Growth, Salary Negotiation and more' },
  { headline: 'Listen Real Experiences', detail: 'Stay updated with corporate news and salary insights' },
  { headline: 'Crack Interviews', detail: 'Learn AI, React, System Design and more' },
  { headline: 'Listen to Podcasts', detail: 'Stay updated with Tech and Career' },
]

// Primary calls to action in the hero. `to` is an in-app route; `href` opens externally.
export const heroActions = [
  { href: 'https://www.topmate.io/manohar', image: '/images/topmate.jpg', value: 'Talk to Me', label: '3k+ 1:1 Calls', highlight: true },
  { to: '/courses', icon: FaBook, value: 'Explore Courses', label: 'Live Cohorts & Courses', tone: 'purple' },
  { href: 'https://whatsapp.com/channel/0029VbDCGHK9xVJiLdicBf0S', icon: FaWhatsapp, value: 'Job Market', label: '100+ Followers', tone: 'green' },
]

export const heroBadges = {
  role: 'Technical Lead',
  experience: '12 yrs exp',
  companies: [
    { name: 'TCS', logo: '/images/companyLogos/tcs.jpg' },
    { name: 'QAD', logo: '/images/companyLogos/qad.jpg' },
    { name: 'IBM', logo: '/images/companyLogos/ibm.jpg' },
  ],
}

export const communityLinks = [
  { href: 'https://www.youtube.com/@ManoharBatra', icon: FaYoutube, value: '99k+ Subscribers', label: 'Job & Corporate Knowledge', tone: 'red' },
  { href: 'https://www.youtube.com/@CodeAndTechWithMB', icon: FaYoutube, value: '2k+', label: 'Code & Tech', tone: 'red' },
  { href: 'https://www.linkedin.com/in/manoharbatra/', icon: FaLinkedin, value: '40k+', label: 'Followers', tone: 'blue' },
  { href: 'https://www.instagram.com/career.manoharbatrayt/', icon: FaInstagram, value: '5K+', label: 'Followers', tone: 'pink' },
  { href: 'https://medium.com/@contactmanoharbatra', icon: FaMedium, value: '120+', label: 'Followers', tone: 'neutral' },
]

// Creators and industry leaders, shown as sliding cards under the "Trusted by" headline.
export const peopleMet = [
  { image: '/images/creators/ajay_suneja.jpeg', name: 'Ajay Suneja', description: '6 Lakhs YouTube subscribers' },
  { image: '/images/creators/anmol_garg.jpeg', name: 'Anmol Garg', description: 'Corporate Standup Comedian' },
  { image: '/images/creators/piyush.jpeg', name: 'Piyush - Roadside Coder', description: '2 Lakhs YouTube subscribers' },
  { image: '/images/corporate/prasanna.jpeg', name: 'Prasanna M Sridhara', description: 'Associate Partner Digital & iX PAL - Distribution Sector', logo: '/images/companyLogos/ibm.jpg', company: 'IBM' },
  { image: '/images/corporate/sufiya_khan.PNG', name: 'Sufiya Khan', description: 'Associate Partner - Front End Exp', logo: '/images/companyLogos/ibm.jpg', company: 'IBM' },
  { image: '/images/corporate/amit_prashant.jpeg', name: 'Prashant + Amit', description: 'Director', logo: '/images/companyLogos/qad.jpg', company: 'QAD' },
  { image: '/images/creators/striver.jpeg', name: 'Raj Vikramaditya', description: '10 Lakhs YouTube subscribers' },
]

export const collegeVisits = [
  { image: '/images/collegeVisits/rkgit1.jpeg', title: 'RKGIT, Ghaziabad' },
  { image: '/images/collegeVisits/iiest1.jpeg', title: 'IIEST, Shibpur, Kolkata' },
  { image: '/images/collegeVisits/IILM.jpg', title: 'IILM, Greater Noida' },
]

export const corporateAppreciations = [
  { image: '/images/corporate/awards/shubha_holla_1.jpeg', title: 'Shubha Holla', subtitle: 'Senior Project Manager', group: 'IBM', logo: '/images/companyLogos/ibm.jpg' },
  { image: '/images/corporate/awards/rob_wood.jpeg', title: 'Rob Wood', subtitle: 'SWE & App Arch Director', group: 'PepsiCo', logo: '/images/companyLogos/pepsico.jpg' },
  { image: '/images/corporate/awards/tarun1.jpeg', title: 'Tarun Kapoor', subtitle: 'Project Manager', group: 'IBM', logo: '/images/companyLogos/ibm.jpg' },
  { image: '/images/corporate/awards/matt_brown.jpeg', title: 'Matt Brown', subtitle: 'Client Partner | Delivery Executive', group: 'IBM', logo: '/images/companyLogos/ibm.jpg' },
  { image: '/images/corporate/awards/shoaib_iqbal.jpeg', title: 'Shoiab Iqbal', subtitle: 'Associate Partner | Enterprise Architect', group: 'IBM', logo: '/images/companyLogos/ibm.jpg' },
]

export const certifications = [
  { image: '/images/certifications/TS-1.jpeg', title: 'IBM: Technical Specialist', group: 'IBM' },
  { image: '/images/certifications/TC_Exp.jpeg', title: 'IBM: Application Specialist', group: 'IBM' },
  { image: '/images/certifications/GH-300.png', title: 'GH-300: Github Copilot', group: 'Microsoft' },
  { image: '/images/certifications/AI-900.png', title: 'AI-900: Azure AI Fundamentals', group: 'Microsoft' },
  { image: '/images/certifications/AZ-900.png', title: 'AZ-900: Azure Fundamentals', group: 'Microsoft' },
  { image: '/images/certifications/IBM_genAI.jpeg', title: 'IBM Agentic AI Developer', group: 'IBM' },
]

// Screenshots of messages from learners, laid out in three columns.
export const learnerFeedback = [
  [
    { image: '/images/fansMessages/msg1.jpeg', source: 'WhatsApp' },
    { image: '/images/testimonials/pic18.jpeg', source: 'WhatsApp' },
  ],
  [
    { image: '/images/fansMessages/msg2.png', source: 'YouTube' },
    { image: '/images/fansMessages/msg3.png', source: 'YouTube' },
    { image: '/images/fansMessages/msg4.png', source: 'YouTube' },
    { image: '/images/fansMessages/msg5.png', source: 'YouTube' },
  ],
  [
    { image: '/images/fansMessages/savinder.png', source: 'YouTube' },
    { image: '/images/testimonials/pic2.png', source: 'YouTube' },
    { image: '/images/testimonials/pic3.png', source: 'YouTube' },
  ],
]

export const aboutParagraphs = [
  'a Senior Software Engineer who has grown my career through strategic job switches, strong technical foundations, and real-world problem solving. Over the years, I’ve worked across backend, full-stack, distributed systems, cloud infrastructure, CI/CD, system design, and AI-assisted engineering.',
  'I help software engineers and aspiring developers with career guidance, resume reviews, mock interviews, salary negotiation, job-switch strategy, and building the right skillset for growth. Whether you are trying to land your first job, switch into a better role, crack backend/full-stack interviews, or understand what skills actually matter in the industry, I can help you with practical, honest, and experience-based advice.',
  'If you’re feeling stuck, underconfident, or unsure what to focus on next, this call will give you clarity, direction, and an actionable plan.',
]

export const courseCategories = [
  {
    courses: [
      {
        image: '/images/course_banner/corporate_course.png',
        title: 'Switch Job in 3 months + Whatsapp Peer Support',
        description: 'Career growth, salary insights, referrals - Whatsapp group',
        meta: '200+ Members',
        href: 'https://topmate.io/manohar/1964588',
      },
      {
        image: '/images/course_banner/companiess_list.png',
        title: '200+ Companies Hiring now!!',
        description: '800+ Companies List (including Remote) where my subscribers are placed at 50+ LPA packages too',
        meta: '4k+ Bookings',
        href: 'https://topmate.io/manohar_batra/1627184',
      },
      {
        image: '/images/course_banner/AI_projects.png',
        title: 'AI 10+ Hands On Projects',
        description: 'Learn AI with 10+ Hands On Projects and get your AI Portfolio ready for interviews',
        meta: '50+ Bookings',
        href: 'https://topmate.io/manohar/1973775',
      },
      {
        image: '/images/course_banner/microfrontend.png',
        title: 'Microfrontend with React',
        description: 'Microfrontend with React',
        meta: '50+ Bookings',
        href: 'https://topmate.io/manohar/1965102',
      },
      {
        image: '/images/course_banner/frontend.png',
        title: 'Combo - JS/React/DSA/System Design 100% Interview Ready',
        description: 'Important Topics with detailed explanation',
        meta: '200+ Bookings',
        href: 'https://topmate.io/manohar/1989104',
      },
      {
        image: '/images/course_banner/backend.png',
        title: '100% Interview Ready',
        description: '1:1 Guidance or Mock Interview on Java, Springboot, Kafka, System Design, and career.',
        meta: '100+ Bookings',
        href: 'https://topmate.io/manohar_batra/1751070',
      },
    ],
  }
]
