const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    content: [
      "Equipo Tools ('we', 'us', or 'our') is committed to protecting your personal information and your right to privacy.",
      "This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.",
      "Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.",
      "We reserve the right to make changes to this Privacy Policy at any time. We will notify you by updating the date at the top of this page.",
    ],
  },
  {
    id: "collect",
    title: "2. Information We Collect",
    content: [
      "Personal identification information: name, email address, phone number, billing and shipping address when you register or place an order.",
      "Payment information: credit/debit card numbers and billing details. We do not store full card numbers — payments are processed through secure third-party providers.",
      "Device and usage data: IP address, browser type, operating system, referring URLs, and pages visited on our site.",
      "Communications: any messages, feedback, or support requests you send us via email, phone, or our contact forms.",
    ],
  },
  {
    id: "use",
    title: "3. How We Use Your Information",
    content: [
      "To process and fulfill your orders, including sending confirmations, invoices, and shipping notifications.",
      "To communicate with you about your account, respond to inquiries, and provide customer support.",
      "To send promotional emails and marketing communications — you may opt out at any time via the unsubscribe link.",
      "To analyze site usage, improve our website, and personalize your shopping experience.",
    ],
  },
  {
    id: "sharing",
    title: "4. Sharing Your Information",
    content: [
      "We do not sell, trade, or rent your personal information to third parties for marketing purposes.",
      "We may share your data with trusted service providers such as shipping carriers, payment processors, and analytics tools.",
      "We may disclose your information when required by law or to protect the rights and safety of Equipo Tools and its users.",
      "In the event of a business merger or acquisition, your information may be transferred as part of that transaction.",
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies & Tracking",
    content: [
      "We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze traffic.",
      "Essential cookies are required for the site to function properly and cannot be disabled.",
      "Analytics cookies help us understand how visitors use our site. You may opt out through your browser settings.",
      "You can instruct your browser to refuse all cookies. However, some features may not work correctly without them.",
    ],
  },
  {
    id: "security",
    title: "6. Data Security",
    content: [
      "We implement SSL/TLS encryption, firewalls, and secure server infrastructure to protect your data.",
      "Access to your personal information is restricted to authorized employees and service providers only.",
      "No method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.",
      "In the event of a data breach, we will notify affected users in accordance with applicable law.",
    ],
  },
  {
    id: "retention",
    title: "7. Data Retention",
    content: [
      "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy.",
      "Order and transaction data is typically retained for 7 years to comply with tax and accounting regulations.",
      "You may request deletion of your account and associated data at any time by contacting privacy@equipo.com.",
      "Some residual data may remain in backup copies for a limited period even after deletion requests are processed.",
    ],
  },
  {
    id: "rights",
    title: "8. Your Rights",
    content: [
      "Right to Access: You may request a copy of the personal data we hold about you at any time.",
      "Right to Correction: You may ask us to correct inaccurate or incomplete personal information.",
      "Right to Deletion: You may request that we delete your personal data, subject to certain legal obligations.",
      "Right to Opt-Out: You may opt out of marketing communications at any time by clicking 'unsubscribe' in any email.",
    ],
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    content: [
      "Our website is not directed to children under the age of 13 and we do not knowingly collect their personal data.",
      "If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.",
      "If we become aware that we have collected data from a child under 13, we will delete that information promptly.",
      "Users between 13 and 18 should have parental consent before using our services.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: [
      "For any privacy-related questions, please email our Data Privacy Officer at privacy@equipo.com.",
      "You may also reach us by phone at 855-214-1992, Monday through Friday, 8am – 6pm ET.",
      "Written requests: Equipo Tools Privacy Team, 2750 Rosewood Lane, New York, NY 10036.",
      "We will respond to all privacy inquiries within 10 business days.",
    ],
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gray-50 font-sans">
    {/* ── Header ── */}
    <div className="bg-white border-b border-gray-200"></div>

    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      {/* ── Intro notice ── */}
      <div
        className="rounded-xl p-4 flex items-start gap-3 border-l-4"
        style={{ backgroundColor: "#1C1C1E", borderLeftColor: "#FFB700" }}
      >
        <svg
          className="flex-shrink-0 mt-0.5"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffb700"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
          Your privacy matters to us. This policy explains how Equipo Tools
          handles your personal data. By using our website, you agree to the
          practices described below.
        </p>
      </div>

      {/* ── Sections ── */}
      {SECTIONS.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Title */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div
              className="w-1.5 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#FFB700" }}
            />
            <h2
              className="text-sm font-extrabold tracking-tight"
              style={{ color: "#1C1C1E" }}
            >
              {section.title}
            </h2>
          </div>

          {/* Bullet points */}
          <ul className="px-6 py-5 flex flex-col gap-3">
            {section.content.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#FFB700" }}
                />
                <p className="text-sm text-gray-600 leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ── Footer card ── */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: "#1C1C1E" }}
      >
        <div>
          <p className="text-sm font-extrabold text-white mb-1">
            Questions about your privacy?
          </p>
          <p className="text-xs text-gray-500">
            Reach out to our Privacy Team — we're happy to help.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <a
            href="mailto:privacy@equipo.com"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest border transition-all duration-200 hover:-translate-y-0.5"
            style={{ borderColor: "rgba(255,183,0,0.3)", color: "#FFB700" }}
          >
            Email Us
          </a>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
