import { useState } from "react";

/* ── Data ── */
const PHONE_LINES = [
  {
    label: "Sales",
    phone: "833-474-8531",
    hours: ["Mon – Sat: 8am – 11PM ET", "Sunday: 9am – 10pm ET"],
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        <path d="M14.05 2a9 9 0 0 1 0 12.01" strokeOpacity="0.5" />
        <path d="M17.5 2a13 13 0 0 1 0 18" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    label: "Support",
    phone: "855-214-1992",
    hours: ["Mon – Fri: 8am – 6pm ET", "Sat / Sun: Closed"],
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const LOCATIONS = [
  {
    city: "New York Office",
    tel: "833-798-745-1616",
    fax: "833-315-735-4682",
    email: "newyork_inbox@equipo.com",
    address: "2750 Rosewood Lane, New York, 10036",
    mapQuery: "2750+Rosewood+Lane,+New+York,+NY+10036",
    tag: "HQ",
  },
  {
    city: "Fargo, North Dakota",
    tel: "933-192-917-3612",
    fax: "934-515-136-1488",
    email: "dakota_inbox@equipo.com",
    address: "1895 Hidden Meadow Drive, Fargo, 58020",
    mapQuery: "1895+Hidden+Meadow+Drive,+Fargo,+ND+58020",
    tag: "Regional",
  },
];

/* ── Icons ── */
const PhoneIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MapPinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const MailIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const FaxIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ══════════════════════════════
   IMPORTANT MESSAGE BANNER
══════════════════════════════ */
const ImportantMessage = () => (
  <div
    className="relative rounded-2xl overflow-hidden shadow-xl"
    style={{ backgroundColor: "#1C1C1E" }}
  >
    {/* diagonal stripe texture */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg,#FFB700 0px,#FFB700 1px,transparent 1px,transparent 14px)",
      }}
    />
    {/* top accent */}
    <div
      className="absolute top-0 left-0 right-0 h-1"
      style={{ background: "linear-gradient(90deg,#FFB700,#FFC933,#CC9200)" }}
    />

    <div className="relative p-5 sm:p-6">
      {/* badge */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4"
        style={{
          backgroundColor: "rgba(255,183,0,0.12)",
          color: "#FFB700",
          border: "1px solid rgba(255,183,0,0.2)",
        }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        Important Notice
      </span>

      <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-2 tracking-tight">
        An Important Message to our Valued Customers
      </h2>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "#9CA3AF" }}>
        We're working diligently to reach any customer who has requested
        contact. We're tools enthusiasts who understand how eager our customers
        are to get their equipment.
      </p>

      {/* Phone cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PHONE_LINES.map((item) => (
          <a
            key={item.label}
            href={`tel:${item.phone.replace(/-/g, "")}`}
            className="group flex items-center gap-4 rounded-xl p-4 border transition-all duration-200"
            style={{
              backgroundColor: "#2C2C2E",
              borderColor: "rgba(255,183,0,0.1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,183,0,0.45)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "#333";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,183,0,0.1)";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#2C2C2E";
            }}
          >
            <div
              className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-md"
              style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-extrabold uppercase tracking-widest mb-0.5"
                  style={{ color: "#FFB700" }}
                >
                  {item.label}
                </p>
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#FFB700" }}
                >
                  <ArrowIcon />
                </span>
              </div>
              <p className="text-base font-black text-white tracking-tight leading-tight">
                {item.phone}
              </p>
              {item.hours.map((h, i) => (
                <p
                  key={i}
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: "#6B7280" }}
                >
                  {h}
                </p>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════
   LOCATION CARD
══════════════════════════════ */
const LocationCard = ({ loc }: { loc: (typeof LOCATIONS)[0] }) => (
  <div className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
    {/* Header */}
    <div
      className="relative flex items-center justify-between px-5 py-4"
      style={{ backgroundColor: "#1C1C1E" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(110deg, transparent 45%, rgba(255,183,0,0.07) 100%)",
        }}
      />
      <div className="flex items-center gap-2.5 relative z-10">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
        >
          <MapPinIcon />
        </div>
        <h3 className="text-white text-sm font-bold tracking-wide">
          {loc.city}
        </h3>
      </div>
      <span
        className="relative z-10 text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full"
        style={{
          backgroundColor: "rgba(255,183,0,0.15)",
          color: "#FFB700",
          border: "1px solid rgba(255,183,0,0.25)",
        }}
      >
        {loc.tag}
      </span>
    </div>
    {/* Yellow accent line */}
    <div
      className="h-0.5"
      style={{ background: "linear-gradient(90deg,#FFB700,#CC9200)" }}
    />

    {/* Map */}
    <div className="w-full h-44 overflow-hidden">
      <iframe
        title={loc.city}
        src={`https://maps.google.com/maps?q=${loc.mapQuery}&output=embed&z=14`}
        width="100%"
        height="100%"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>

    {/* Info rows */}
    <div className="p-4 divide-y divide-gray-50">
      {[
        {
          icon: <PhoneIcon />,
          value: loc.tel,
          href: `tel:${loc.tel.replace(/-/g, "")}`,
        },
        { icon: <FaxIcon />, value: loc.fax, href: null },
        { icon: <MailIcon />, value: loc.email, href: `mailto:${loc.email}` },
        { icon: <MapPinIcon />, value: loc.address, href: null },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <span
            className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,183,0,0.1)", color: "#CC9200" }}
          >
            {row.icon}
          </span>
          {row.href ? (
            <a
              href={row.href}
              className="text-sm font-semibold text-gray-700 hover:text-yellow-600 transition-colors truncate"
            >
              {row.value}
            </a>
          ) : (
            <span className="text-sm text-gray-500 leading-relaxed">
              {row.value}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════
   CONTACT FORM
══════════════════════════════ */
interface FormState {
  name: string;
  email: string;
  phone: string;
  option: string;
  message: string;
}

const ContactFormWidget = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    option: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.option) e.option = "Please choose an option";
    return e;
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitted(true);
  };

  const fieldClass = (name: string, extra = "") =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm font-medium text-gray-800 bg-gray-50 outline-none transition-all duration-200 ${extra} ${
      errors[name as keyof FormState]
        ? "border-red-400 ring-2 ring-red-100 bg-white"
        : focused === name
          ? "border-yellow-400 ring-2 ring-yellow-100 bg-white"
          : "border-gray-200 hover:border-gray-300"
    }`;

  if (submitted)
    return (
      <div className="flex flex-col items-center text-center py-14 px-6 rounded-2xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg"
          style={{ backgroundColor: "#22C55E" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-black mb-2 text-gray-900 tracking-tight">
          Message Sent!
        </h3>
        <p className="text-sm text-gray-400 mb-7 max-w-xs leading-relaxed">
          Thank you for reaching out. Our team will be in touch within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              option: "",
              message: "",
            });
          }}
          className="px-7 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
        >
          Send Another
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
          Full Name <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          className={fieldClass("name")}
          name="name"
          value={form.name}
          onChange={handleChange}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          placeholder="Jane Smith"
        />
        {errors.name && (
          <span className="text-xs font-semibold" style={{ color: "#EF4444" }}>
            ⚠ {errors.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
            Email <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            className={fieldClass("email")}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            placeholder="jane@example.com"
          />
          {errors.email && (
            <span
              className="text-xs font-semibold"
              style={{ color: "#EF4444" }}
            >
              ⚠ {errors.email}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
            Phone
          </label>
          <input
            className={fieldClass("phone")}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            placeholder="555-000-0000"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
          How can we help? <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <select
          className={fieldClass("option")}
          name="option"
          value={form.option}
          onChange={handleChange}
          onFocus={() => setFocused("option")}
          onBlur={() => setFocused(null)}
        >
          <option value="">— Please choose an option —</option>
          <option value="product">Question about a product</option>
          <option value="order">Question about an existing order</option>
        </select>
        {errors.option && (
          <span className="text-xs font-semibold" style={{ color: "#EF4444" }}>
            ⚠ {errors.option}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
          Message
        </label>
        <textarea
          className={`${fieldClass("message", "resize-y")} min-h-32`}
          name="message"
          value={form.message}
          onChange={handleChange}
          onFocus={() => setFocused("message")}
          onBlur={() => setFocused(null)}
          rows={5}
          placeholder="Tell us how we can help..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="group relative overflow-hidden self-start flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#FFC933")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#FFB700")
        }
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.22) 55%, transparent 70%)",
          }}
        />
        <span className="relative">Send Message</span>
        <span className="relative transition-transform duration-200 group-hover:translate-x-1">
          <ArrowIcon />
        </span>
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const EcommerceContactus = () => (
  <div
    className="min-h-screen font-sans"
    style={{ backgroundColor: "#F3F4F6" }}
  >
    {/* ── Body ── */}
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* LEFT */}
      <div className="flex flex-col gap-6">
        <ImportantMessage />

        {/* Locations divider heading */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "#E5E7EB" }} />
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#FFB700" }}
            />
            <span
              className="text-xs font-extrabold uppercase tracking-widest"
              style={{ color: "#9CA3AF" }}
            >
              Our Locations
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#FFB700" }}
            />
          </div>
          <div className="h-px flex-1" style={{ backgroundColor: "#E5E7EB" }} />
        </div>

        {LOCATIONS.map((loc) => (
          <LocationCard key={loc.city} loc={loc} />
        ))}
      </div>

      {/* RIGHT */}
      <div className="lg:sticky lg:top-6 flex flex-col gap-4">
        {/* Form card */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          {/* Gradient top bar */}
          <div
            className="h-1.5"
            style={{
              background:
                "linear-gradient(90deg,#FFB700 0%,#FFC933 50%,#CC9200 100%)",
            }}
          />

          <div className="p-6 md:p-8">
            {/* Heading */}
            <div className="flex items-start gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "#FFB700", color: "#1C1C1E" }}
              >
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
              </div>
              <div>
                <h2
                  className="text-xl font-black tracking-tight"
                  style={{ color: "#1C1C1E" }}
                >
                  Need Some Help?
                </h2>
                <p
                  className="text-sm leading-relaxed mt-1"
                  style={{ color: "#9CA3AF" }}
                >
                  Select an option below. Our team will reach out shortly.
                </p>
              </div>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["Fast Response", "Expert Team", "No Spam"].map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
                  style={{
                    color: "#9CA3AF",
                    borderColor: "#E5E7EB",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <span style={{ color: "#FFB700" }}>✦</span>
                  {b}
                </span>
              ))}
            </div>

            <ContactFormWidget />
          </div>
        </div>

        {/* Call-us strip */}
        <div className="rounded-2xl p-4 flex items-center gap-3 border border-gray-200 bg-white shadow-sm">
          <div
            className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,183,0,0.1)", color: "#CC9200" }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Prefer to call? Sales:{" "}
            <a
              href="tel:8334748531"
              className="font-bold text-gray-700 hover:text-yellow-600 transition-colors"
            >
              833-474-8531
            </a>{" "}
            &nbsp;·&nbsp; Support:{" "}
            <a
              href="tel:8552141992"
              className="font-bold text-gray-700 hover:text-yellow-600 transition-colors"
            >
              855-214-1992
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default EcommerceContactus;
