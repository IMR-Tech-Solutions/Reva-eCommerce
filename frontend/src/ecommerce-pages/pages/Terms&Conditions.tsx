import { useState } from "react";

/* ── Sections Data ── */
const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    content: [
      "By accessing or using the Equipo Tools website and services, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.",
      "If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
      "These terms apply to all visitors, users, and others who access or use our services.",
      "We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the site following any changes constitutes your acceptance of the new Terms.",
    ],
  },
  {
    id: "use",
    title: "Use of the Website",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    content: [
      "You may use our website for lawful purposes only. You must not use the site in any way that breaches any applicable local, national, or international law or regulation.",
      "You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the service without express written permission from Equipo Tools.",
      "We reserve the right to refuse service to anyone for any reason at any time.",
      "You are prohibited from using the site to transmit any unsolicited commercial communications or to engage in any conduct that restricts or inhibits anyone's use of the website.",
    ],
  },
  {
    id: "orders",
    title: "Orders & Purchases",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    content: [
      "All orders placed through our website are subject to acceptance and availability. We reserve the right to refuse any order you place with us.",
      "Prices for products are subject to change without notice. We reserve the right to modify or discontinue the service at any time.",
      "We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of service.",
      "Upon placing an order, you warrant that you are legally capable of entering into binding contracts and are at least 18 years of age.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    content: [
      "Equipo Tools ships to addresses within the United States. Shipping times and rates vary based on location and selected shipping method.",
      "We are not responsible for delays caused by customs, incorrect addresses provided by the customer, or circumstances beyond our control.",
      "Risk of loss and title for items purchased from Equipo Tools pass to you upon delivery of the items to the carrier.",
      "If a product is lost or damaged during shipping, please contact our support team within 7 days of the expected delivery date.",
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
      </svg>
    ),
    content: [
      "We offer a 30-day return policy for most items. Products must be returned in their original condition and packaging.",
      "To initiate a return, please contact our support team. Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.",
      "Refunds will be processed within 5–10 business days after we receive and inspect the returned item.",
      "Certain items such as consumables, custom orders, and clearance products are non-returnable. These will be clearly marked on the product page.",
    ],
  },
  {
    id: "intellectual",
    title: "Intellectual Property",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
      </svg>
    ),
    content: [
      "All content on this website, including text, graphics, logos, images, and software, is the property of Equipo Tools and is protected by applicable intellectual property laws.",
      "You may not use any of our trademarks or trade names without our prior written consent.",
      "You are granted a limited, non-exclusive license to access and use the website for personal, non-commercial purposes only.",
      "Any unauthorized use of the content may violate copyright laws, trademark laws, and other regulations.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    content: [
      "Your use of our website is also governed by our Privacy Policy, which is incorporated into these Terms by reference.",
      "We collect and process your personal data in accordance with applicable data protection laws.",
      "By using our services, you consent to the collection and use of your information as outlined in our Privacy Policy.",
      "We implement industry-standard security measures to protect your personal information, but cannot guarantee absolute security of data transmitted over the internet.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    content: [
      "Equipo Tools shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
      "Our total liability to you for any claim arising out of or relating to these terms or our services shall not exceed the amount you paid us in the 12 months preceding the claim.",
      "We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.",
      "Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.",
    ],
  },
  {
    id: "governing",
    title: "Governing Law",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
      </svg>
    ),
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.",
      "Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New York County, New York.",
      "You agree to waive any objection to the laying of venue of any such proceeding in New York County, New York.",
      "If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.",
    ],
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    content: [
      "If you have any questions about these Terms and Conditions, please contact us at legal@equipo.com.",
      "You may also reach our support team by phone at 855-214-1992, Monday through Friday, 8am – 6pm ET.",
      "Written correspondence can be sent to: Equipo Tools Legal Department, 2750 Rosewood Lane, New York, NY 10036.",
      "We aim to respond to all legal inquiries within 5 business days.",
    ],
  },
];

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1C1C1E" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,183,0,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,183,0,0.8) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(255,183,0,0.1) 0%, transparent 60%)",
          }}
        />
        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg,#FFB700,#FFC933,#CC9200)",
          }}
        />
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:px-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* ── LEFT: Sticky Table of Contents ── */}
        <aside className="lg:sticky lg:top-6 w-full lg:w-72 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
            {/* TOC Header */}
            <div
              className="px-5 py-4 border-b border-gray-100"
              style={{ backgroundColor: "#1C1C1E" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <span className="text-sm font-extrabold text-white tracking-tight">
                  Table of Contents
                </span>
              </div>
            </div>
            {/* TOC Items */}
            <div className="p-2">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
                  style={{
                    backgroundColor:
                      activeSection === section.id
                        ? "rgba(255,183,0,0.08)"
                        : "transparent",
                    borderLeft:
                      activeSection === section.id
                        ? "3px solid #FFB700"
                        : "3px solid transparent",
                  }}
                >
                  <span
                    className="text-xs font-extrabold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{
                      backgroundColor:
                        activeSection === section.id ? "#FFB700" : "#F3F4F6",
                      color:
                        activeSection === section.id ? "#1C1C1E" : "#9CA3AF",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="text-xs font-bold leading-tight transition-colors duration-200"
                    style={{
                      color:
                        activeSection === section.id ? "#1C1C1E" : "#6B7280",
                    }}
                  >
                    {section.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Contact strip */}
            <div
              className="mx-3 mb-3 rounded-xl p-3 border"
              style={{
                backgroundColor: "rgba(255,183,0,0.05)",
                borderColor: "rgba(255,183,0,0.2)",
              }}
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Questions? Email us at{" "}
                <a
                  href="mailto:legal@equipo.com"
                  className="font-bold hover:underline"
                  style={{ color: "#CC9200" }}
                >
                  legal@equipo.com
                </a>
              </p>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: Content ── */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Intro notice */}
          <div
            className="rounded-2xl p-5 border-l-4 shadow-sm"
            style={{ backgroundColor: "#1C1C1E", borderLeftColor: "#FFB700" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255,183,0,0.15)",
                  color: "#FFB700",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-white mb-1">
                  Important Notice
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#9CA3AF" }}
                >
                  These Terms &amp; Conditions govern your use of the Equipo
                  Tools platform. By continuing to browse or purchase, you
                  confirm you have read, understood, and agreed to all terms
                  listed below.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, index) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              onMouseEnter={() => setActiveSection(section.id)}
            >
              {/* Section header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-extrabold uppercase tracking-widest"
                      style={{ color: "#FFB700" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className="text-base font-black tracking-tight"
                      style={{ color: "#1C1C1E" }}
                    >
                      {section.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Section content */}
              <div className="px-6 py-5 flex flex-col gap-3">
                {section.content.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: "rgba(255,183,0,0.12)",
                        color: "#CC9200",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Agreement footer */}
          <div
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ backgroundColor: "#1C1C1E" }}
          >
            <div
              className="h-1"
              style={{
                background: "linear-gradient(90deg,#FFB700,#FFC933,#CC9200)",
              }}
            />
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-white mb-1">
                  You agree to these Terms
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#6B7280" }}
                >
                  By using Equipo Tools, you acknowledge that you have read and
                  understood these Terms &amp; Conditions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <a
                  href="mailto:legal@equipo.com"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: "rgba(255,183,0,0.3)",
                    color: "#FFB700",
                    backgroundColor: "rgba(255,183,0,0.08)",
                  }}
                >
                  Questions?
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
      </div>
    </div>
  );
};

export default TermsAndConditions;
