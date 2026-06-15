import { useState, useEffect, useRef } from "react";

// ── Typing effect hook ────────────────────────────────────────────────────────
function useTypingEffect(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setWordIdx(i => (i + 1) % words.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, label, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [inView, end]);
  return (
    <div ref={ref} style={styles.statCard}>
      <span style={styles.statNum}>{count}{suffix}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Skill bar ─────────────────────────────────────────────────────────────────
function SkillBar({ name, pct, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{name}</span>
        <span style={{ color: "#2563EB", fontWeight: 700, fontSize: 13 }}>{pct}%</span>
      </div>
      <div style={styles.barBg}>
        <div style={{
          ...styles.barFill,
          width: inView ? `${pct}%` : "0%",
          transition: `width 1s ease ${delay}ms`,
        }} />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ id, children, bg = "#fff", style = {} }) {
  const [ref, inView] = useInView(0.1);
  return (
    <section id={id} ref={ref} style={{
      background: bg,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
      ...style,
    }}>
      {children}
    </section>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ title, desc, tech, emoji }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.projCard,
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(37,99,235,0.18)"
          : "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      <div style={styles.projEmoji}>{emoji}</div>
      <h3 style={{ color: "#2563EB", fontWeight: 700, fontSize: 18, margin: "12px 0 8px" }}>{title}</h3>
      <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, flexGrow: 1 }}>{desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "14px 0 18px" }}>
        {tech.map(t => (
          <span key={t} style={styles.techBadge}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={styles.btnOutline}>GitHub</button>
        <button style={styles.btnBlue}>Live Demo</button>
      </div>
    </div>
  );
}

// ── Fitness card ──────────────────────────────────────────────────────────────
function FitnessCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.fitCard,
        background: hovered
          ? "linear-gradient(135deg,#2563EB,#1d4ed8)"
          : "linear-gradient(135deg,#f8faff,#eff6ff)",
        color: hovered ? "#fff" : "#1e293b",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "none",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: hovered ? "#fff" : "#2563EB" }}>{title}</h4>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: hovered ? "rgba(255,255,255,.85)" : "#64748b" }}>{desc}</p>
    </div>
  );
}

// ── Floating orb (decorative) ─────────────────────────────────────────────────
function Orb({ size, top, left, opacity = 0.12, delay = 0 }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      width: size, height: size, top, left,
      background: "radial-gradient(circle,#2563EB,#93c5fd)",
      opacity, filter: "blur(60px)", pointerEvents: "none",
      animation: `float 6s ease-in-out ${delay}s infinite alternate`,
    }} />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Portfolio() {
  const roles = ["Web Developer", "Mobile App Developer", "Engineering Student", "Fitness Enthusiast"];
  const typing = useTypingEffect(roles);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = ["About", "Skills", "Fitness", "Projects", "Education", "Contact"];

  return (
    <div style={styles.root}>
      <style>{globalCSS}</style>

      {/* ── NAV ── */}
      <nav style={{
        ...styles.nav,
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        backdropFilter: "blur(12px)",
      }}>
        <div style={styles.navInner}>
          <span style={styles.logo} onClick={() => scrollTo("hero")}>
            <span style={{ color: "#2563EB" }}>A</span>dil
          </span>
          <div style={styles.navLinks}>
            {navItems.map(n => (
              <button key={n} style={styles.navLink} onClick={() => scrollTo(n.toLowerCase())}>
                {n}
              </button>
            ))}
            <button style={styles.navCta} onClick={() => scrollTo("contact")}>Hire Me</button>
          </div>
          <button style={styles.burger} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div style={styles.mobileMenu}>
            {navItems.map(n => (
              <button key={n} style={styles.mobileLink} onClick={() => scrollTo(n.toLowerCase())}>
                {n}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={styles.hero}>
        <Orb size={400} top="-100px" left="-100px" opacity={0.1} delay={0} />
        <Orb size={300} top="60%" left="70%" opacity={0.09} delay={2} />
        <Orb size={200} top="30%" left="80%" opacity={0.07} delay={1} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={{ color: "#2563EB", marginRight: 6 }}>●</span>
            Available for opportunities
          </div>
          <h1 style={styles.heroH1}>
            Hi, I'm <span style={{ color: "#2563EB" }}>Adil Muhammed N</span>
          </h1>
          <div style={styles.heroSub}>
            <span style={{ color: "#2563EB", fontWeight: 700 }}>{typing}</span>
            <span style={styles.cursor}>|</span>
          </div>
          <p style={styles.heroDesc}>
            3rd-year Engineering student crafting digital experiences — from responsive web apps to cross-platform mobile solutions. Driven by curiosity, discipline, and a passion for clean code.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 36 }}>
            <button style={styles.heroBtnPrimary} onClick={() => scrollTo("projects")}>
              View Projects →
            </button>
            <button style={styles.heroBtnSecondary} onClick={() => scrollTo("contact")}>
              Contact Me
            </button>
          </div>
          <div style={styles.heroScrollHint}>
            <div style={styles.scrollLine} />
            <span style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Scroll</span>
          </div>
        </div>

        <div style={styles.heroIllo}>
          <div style={styles.illoCard}>
            <div style={styles.illoScreen}>
              <div style={styles.illoBar}><span /><span /><span /></div>
              <div style={styles.illoCode}>
                <span style={{ color: "#93c5fd" }}>const</span>
                <span style={{ color: "#fff" }}> adil </span>
                <span style={{ color: "#93c5fd" }}>=</span>
                <span style={{ color: "#fff" }}> {"{"}</span><br />
                <span style={{ color: "#7dd3fc", paddingLeft: 16 }}>role</span>
                <span style={{ color: "#fff" }}>: </span>
                <span style={{ color: "#86efac" }}>"Developer"</span>
                <span style={{ color: "#fff" }}>,</span><br />
                <span style={{ color: "#7dd3fc", paddingLeft: 16 }}>passion</span>
                <span style={{ color: "#fff" }}>: </span>
                <span style={{ color: "#86efac" }}>"Fitness"</span>
                <span style={{ color: "#fff" }}>,</span><br />
                <span style={{ color: "#7dd3fc", paddingLeft: 16 }}>mindset</span>
                <span style={{ color: "#fff" }}>: </span>
                <span style={{ color: "#86efac" }}>"Growth"</span><br />
                <span style={{ color: "#fff" }}>{"}"}</span>
              </div>
            </div>
            <div style={styles.illoFloat1}>⚛️</div>
            <div style={styles.illoFloat2}>📱</div>
            <div style={styles.illoFloat3}>💪</div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <Section id="about" bg="#f8faff" style={{ padding: "100px 0" }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>Who I Am</p>
          <h2 style={styles.sectionH2}>About Me</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div style={styles.avatarPlaceholder}>
                <div style={styles.avatarInner}>
                  <span style={{ fontSize: 64 }}>👨‍💻</span>
                  <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Your photo here</p>
                </div>
                <div style={styles.avatarRing} />
                <div style={styles.avatarDot1}>🏋️</div>
                <div style={styles.avatarDot2}>💻</div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
                Engineering student with a builder's mindset
              </h3>
              <p style={{ color: "#64748b", lineHeight: 1.85, marginBottom: 14, fontSize: 15 }}>
                I'm a 3rd-year Engineering student at <strong style={{ color: "#2563EB" }}>UKF College of Engineering and Technology</strong>, pursuing a Bachelor's in Engineering. My academic journey runs in parallel with building real software — web platforms and mobile apps that solve everyday problems.
              </p>
              <p style={{ color: "#64748b", lineHeight: 1.85, marginBottom: 14, fontSize: 15 }}>
                Beyond the screen, I live by the same principles in the gym: <strong>discipline, progressive overload, and showing up consistently</strong>. Bodybuilding taught me that the compound effect of daily effort is what separates good from great — a lesson I apply to every line of code I write.
              </p>
              <p style={{ color: "#64748b", lineHeight: 1.85, fontSize: 15 }}>
                I believe in continuous self-improvement — whether it's mastering a new framework, optimising a workout plan, or picking up a new skill outside my comfort zone.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 36 }}>
                <Counter end={3} label="Years of Learning" suffix="+" />
                <Counter end={10} label="Technologies Explored" suffix="+" />
                <Counter end={8} label="Projects Completed" suffix="+" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SKILLS ── */}
      <Section id="skills" style={{ padding: "100px 0" }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>What I Know</p>
          <h2 style={styles.sectionH2}>Technical Skills</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
            <div style={styles.skillPanel}>
              <h3 style={styles.skillPanelTitle}>🌐 Web Development</h3>
              <SkillBar name="HTML & CSS" pct={92} delay={0} />
              <SkillBar name="JavaScript" pct={80} delay={100} />
              <SkillBar name="React" pct={75} delay={200} />
              <SkillBar name="Node.js" pct={65} delay={300} />
            </div>
            <div style={styles.skillPanel}>
              <h3 style={styles.skillPanelTitle}>📱 Mobile Development</h3>
              <SkillBar name="Flutter" pct={78} delay={0} />
              <SkillBar name="React Native" pct={70} delay={100} />
              <SkillBar name="Android Development" pct={60} delay={200} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 48, justifyContent: "center" }}>
            {["HTML","CSS","JavaScript","React","Node.js","Flutter","React Native","Android","Git","Tailwind"].map(t => (
              <span key={t} style={styles.techChip}>{t}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FITNESS ── */}
      <Section id="fitness" bg="linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1e40af 100%)" style={{ padding: "100px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%,rgba(37,99,235,0.3) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(29,78,216,0.2) 0%,transparent 50%)" }} />
        <div style={{ ...styles.container, position: "relative" }}>
          <p style={{ ...styles.eyebrow, color: "#93c5fd" }}>Beyond the Screen</p>
          <h2 style={{ ...styles.sectionH2, color: "#fff" }}>Fitness & Bodybuilding</h2>
          <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: 580, margin: "0 auto 56px", fontSize: 16, lineHeight: 1.8 }}>
            The gym is my second classroom. Every rep teaches patience, every PR teaches ambition, and every rest day teaches recovery — all principles I carry into software development.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            <FitnessCard icon="🎯" title="Discipline" desc="6 days a week. No excuses. The same consistency that builds muscle builds great software." />
            <FitnessCard icon="🥗" title="Nutrition" desc="Strict diet plan, high protein, clean fuel. What you input determines your output — in life and in code." />
            <FitnessCard icon="🔄" title="Consistency" desc="Progress isn't overnight. Compound interest applies to reps, commits, and learning alike." />
            <FitnessCard icon="💪" title="Strength" desc="Building physical and mental strength simultaneously. Resilience forged under the bar carries over everywhere." />
          </div>
        </div>
      </Section>

      {/* ── PROJECTS ── */}
      <Section id="projects" style={{ padding: "100px 0" }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>What I've Built</p>
          <h2 style={styles.sectionH2}>Projects</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            <ProjectCard
              emoji="🛒"
              title="ShopEase — E-Commerce App"
              desc="A full-stack e-commerce mobile application with product browsing, cart management, and secure checkout flow."
              tech={["Flutter", "Firebase", "Node.js"]}
            />
            <ProjectCard
              emoji="🏋️"
              title="FitTrack — Workout Logger"
              desc="A fitness tracking app that logs workouts, tracks PRs, and visualises progress over time with beautiful charts."
              tech={["React Native", "SQLite", "Chart.js"]}
            />
            <ProjectCard
              emoji="🌐"
              title="DevFolio — Portfolio Builder"
              desc="A web app that lets developers generate a personal portfolio site by filling out a simple form — no coding required."
              tech={["React", "Tailwind", "Node.js"]}
            />
            <ProjectCard
              emoji="💬"
              title="ChatSync — Real-time Chat"
              desc="A real-time messaging platform with rooms, typing indicators, and online presence — built for speed and simplicity."
              tech={["React", "Socket.io", "Express"]}
            />
            <ProjectCard
              emoji="📰"
              title="NewsDigest — News Aggregator"
              desc="A mobile news reader that aggregates headlines from multiple sources with category filtering and offline reading."
              tech={["Flutter", "REST API", "Hive"]}
            />
            <ProjectCard
              emoji="📊"
              title="ExpenseIQ — Budget Tracker"
              desc="A personal finance tracker that categorises spending, sets monthly budgets, and sends smart alerts when thresholds are hit."
              tech={["React", "Firebase", "Recharts"]}
            />
          </div>
        </div>
      </Section>

      {/* ── EDUCATION ── */}
      <Section id="education" bg="#f8faff" style={{ padding: "100px 0" }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>Academic Journey</p>
          <h2 style={styles.sectionH2}>Education</h2>
          <div style={styles.timeline}>
            <div style={styles.timelineLine} />
            {[
              { year: "2022 – Present", title: "Bachelor of Engineering", sub: "UKF College of Engineering and Technology", detail: "Currently in 3rd Year · CGPA on track · Active in tech clubs and hackathons", icon: "🎓", active: true },
              { year: "2022", title: "Higher Secondary (12th Grade)", sub: "Kerala State Board", detail: "Strong foundation in Physics, Chemistry & Mathematics", icon: "📚", active: false },
              { year: "2020", title: "Secondary School (10th Grade)", sub: "Kerala State Board", detail: "Academic excellence with distinction", icon: "🏫", active: false },
            ].map((item, i) => (
              <div key={i} style={styles.timelineItem}>
                <div style={{ ...styles.timelineDot, background: item.active ? "#2563EB" : "#cbd5e1", boxShadow: item.active ? "0 0 0 6px rgba(37,99,235,0.2)" : "none" }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                </div>
                <div style={{ ...styles.timelineCard, borderLeft: item.active ? "3px solid #2563EB" : "3px solid #e2e8f0" }}>
                  <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 700, letterSpacing: 1 }}>{item.year}</span>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: "#1e293b", margin: "4px 0" }}>{item.title}</h3>
                  <p style={{ color: "#2563EB", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{item.sub}</p>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CONTACT ── */}
      <Section id="contact" style={{ padding: "100px 0" }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>Let's Connect</p>
          <h2 style={styles.sectionH2}>Contact Me</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 16, lineHeight: 1.85, marginBottom: 36 }}>
                I'm always open to discussing new projects, creative ideas, internship opportunities, or just talking tech and fitness. Drop me a message!
              </p>
              {[
                { icon: "📧", label: "Email", value: "adilmuhammed@example.com" },
                { icon: "📱", label: "Phone", value: "+91 98765 43210" },
                { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/adilmuhammed" },
                { icon: "🐙", label: "GitHub", value: "github.com/adilmuhammed" },
              ].map(c => (
                <ContactRow key={c.label} {...c} />
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          © 2025 <span style={{ color: "#2563EB", fontWeight: 600 }}>Adil Muhammed N</span> · Built with React & passion
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {["GitHub", "LinkedIn", "Email"].map(s => (
            <button key={s} style={styles.footerLink}>{s}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ── Contact row ───────────────────────────────────────────────────────────────
function ContactRow({ icon, label, value }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 18px", borderRadius: 12, marginBottom: 12,
        background: hov ? "#eff6ff" : "#f8faff",
        cursor: "pointer", transition: "all .2s",
        transform: hov ? "translateX(6px)" : "none",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
        <p style={{ color: "#1e293b", fontWeight: 500, fontSize: 14 }}>{value}</p>
      </div>
    </div>
  );
}

// ── Contact form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (form.name && form.email && form.message) { setSent(true); }
  };
  if (sent) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
      <span style={{ fontSize: 56 }}>✅</span>
      <h3 style={{ color: "#2563EB", fontWeight: 700 }}>Message Sent!</h3>
      <p style={{ color: "#64748b", textAlign: "center" }}>Thanks for reaching out. I'll get back to you soon.</p>
      <button style={styles.btnBlue} onClick={() => { setForm({ name: "", email: "", message: "" }); setSent(false); }}>Send Another</button>
    </div>
  );
  return (
    <div style={styles.formCard}>
      <h3 style={{ fontWeight: 700, fontSize: 20, color: "#1e293b", marginBottom: 24 }}>Send a Message</h3>
      {[
        { key: "name", placeholder: "Your Name", type: "text" },
        { key: "email", placeholder: "Your Email", type: "email" },
      ].map(f => (
        <input
          key={f.key}
          type={f.type}
          placeholder={f.placeholder}
          value={form[f.key]}
          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
          style={styles.input}
        />
      ))}
      <textarea
        placeholder="Your Message"
        rows={5}
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
      />
      <button style={{ ...styles.btnBlue, width: "100%", padding: "14px", fontSize: 15, marginTop: 4 }} onClick={submit}>
        Send Message →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const styles = {
  root: { fontFamily: "'Inter', 'Poppins', system-ui, sans-serif", color: "#1e293b", background: "#fff", overflowX: "hidden" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 24px" },

  // Nav
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all .3s" },
  navInner: { maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 22, fontWeight: 800, cursor: "pointer", letterSpacing: -0.5 },
  navLinks: { display: "flex", alignItems: "center", gap: 4 },
  navLink: { background: "none", border: "none", padding: "8px 14px", color: "#475569", fontWeight: 500, fontSize: 14, cursor: "pointer", borderRadius: 8, transition: "all .2s" },
  navCta: { background: "#2563EB", border: "none", padding: "8px 20px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", borderRadius: 8, marginLeft: 8, transition: "all .2s" },
  burger: { display: "none", background: "none", border: "none", fontSize: 20, cursor: "pointer" },
  mobileMenu: { background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4 },
  mobileLink: { background: "none", border: "none", padding: "12px 0", color: "#475569", fontWeight: 500, fontSize: 15, cursor: "pointer", textAlign: "left", borderBottom: "1px solid #f1f5f9" },

  // Hero
  hero: { minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 24px 60px", maxWidth: 1100, margin: "0 auto", position: "relative", gap: 40 },
  heroContent: { flex: 1 },
  heroBadge: { display: "inline-flex", alignItems: "center", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24 },
  heroH1: { fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: -1, marginBottom: 16 },
  heroSub: { fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 600, color: "#64748b", marginBottom: 20, minHeight: 36, display: "flex", alignItems: "center", gap: 2 },
  cursor: { color: "#2563EB", fontWeight: 300, animation: "blink 1s infinite" },
  heroDesc: { color: "#64748b", fontSize: 16, lineHeight: 1.85, maxWidth: 500 },
  heroBtnPrimary: { background: "#2563EB", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all .2s", fontFamily: "inherit" },
  heroBtnSecondary: { background: "transparent", color: "#2563EB", border: "2px solid #2563EB", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all .2s", fontFamily: "inherit" },
  heroScrollHint: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, marginTop: 56 },
  scrollLine: { width: 1, height: 48, background: "linear-gradient(to bottom,#2563EB,transparent)", marginLeft: 16 },
  heroIllo: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center" },

  // Illustration card
  illoCard: { position: "relative", width: 360, height: 300 },
  illoScreen: { background: "#0f172a", borderRadius: 16, padding: 24, width: "100%", height: "100%", boxSizing: "border-box", boxShadow: "0 32px 80px rgba(37,99,235,0.25)", border: "1px solid rgba(37,99,235,.3)" },
  illoBar: { display: "flex", gap: 6, marginBottom: 20, "& span": {} },
  illoCode: { fontFamily: "monospace", fontSize: 14, lineHeight: 2, color: "#e2e8f0" },
  illoFloat1: { position: "absolute", top: -16, right: -16, fontSize: 32, animation: "float 3s ease-in-out infinite alternate" },
  illoFloat2: { position: "absolute", bottom: -16, right: 40, fontSize: 28, animation: "float 4s ease-in-out 1s infinite alternate" },
  illoFloat3: { position: "absolute", bottom: 40, left: -20, fontSize: 30, animation: "float 3.5s ease-in-out .5s infinite alternate" },

  // Section typography
  eyebrow: { textAlign: "center", fontSize: 13, fontWeight: 700, color: "#2563EB", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 },
  sectionH2: { textAlign: "center", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "#2563EB", marginBottom: 56, letterSpacing: -0.5 },

  // About
  statCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 16px", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" },
  statNum: { display: "block", fontSize: 32, fontWeight: 800, color: "#2563EB" },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  avatarPlaceholder: { position: "relative", width: 320, height: 360, margin: "0 auto" },
  avatarInner: { width: "100%", height: "100%", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "3px dashed #bfdbfe" },
  avatarRing: { position: "absolute", inset: -12, border: "2px solid #bfdbfe", borderRadius: 32, animation: "spin 20s linear infinite" },
  avatarDot1: { position: "absolute", top: -10, right: -10, fontSize: 28, background: "#fff", borderRadius: "50%", padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)" },
  avatarDot2: { position: "absolute", bottom: -10, left: -10, fontSize: 28, background: "#fff", borderRadius: "50%", padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)" },

  // Skills
  skillPanel: { background: "#f8faff", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0" },
  skillPanelTitle: { fontWeight: 700, fontSize: 18, color: "#1e293b", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 },
  barBg: { height: 8, background: "#e2e8f0", borderRadius: 100, overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg,#2563EB,#60a5fa)", borderRadius: 100 },
  techChip: { background: "#eff6ff", color: "#1d4ed8", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, border: "1px solid #bfdbfe" },

  // Fitness
  fitCard: { borderRadius: 16, padding: 28, textAlign: "center", transition: "all .3s", cursor: "default", border: "1px solid rgba(255,255,255,0.1)" },

  // Projects
  projCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", transition: "all .3s", cursor: "default" },
  projEmoji: { fontSize: 40, background: "#eff6ff", width: 68, height: 68, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  techBadge: { background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 },
  btnBlue: { background: "#2563EB", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", flex: 1, fontFamily: "inherit" },
  btnOutline: { background: "transparent", color: "#2563EB", border: "1px solid #2563EB", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", flex: 1, fontFamily: "inherit" },

  // Timeline
  timeline: { position: "relative", maxWidth: 720, margin: "0 auto" },
  timelineLine: { position: "absolute", left: 24, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom,#2563EB,#e2e8f0)" },
  timelineItem: { display: "flex", gap: 32, marginBottom: 40, alignItems: "flex-start" },
  timelineDot: { width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .3s" },
  timelineCard: { flex: 1, background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },

  // Contact
  formCard: { background: "#f8faff", borderRadius: 20, padding: 36, border: "1px solid #e2e8f0" },
  input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: "#1e293b", background: "#fff", transition: "border .2s" },

  // Footer
  footer: { background: "#0f172a", padding: "40px 24px", textAlign: "center" },
  footerLink: { background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
};

// ── Global CSS ────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, sans-serif; }

  @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
  @keyframes float { from { transform: translateY(0) } to { transform: translateY(-16px) } }
  @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

  /* illo bar dots */
  .illo-bar span { display:inline-block; width:10px; height:10px; border-radius:50%; }
  .illo-bar span:nth-child(1) { background:#ff5f57; }
  .illo-bar span:nth-child(2) { background:#febc2e; }
  .illo-bar span:nth-child(3) { background:#28c840; }

  button:hover { opacity:.88; }
  input:focus, textarea:focus { border-color:#2563EB !important; box-shadow:0 0 0 3px rgba(37,99,235,.1); }

  @media (max-width:768px) {
    #hero-flex { flex-direction:column !important; }
    .hero-illo { display:none !important; }
    .grid-2 { grid-template-columns:1fr !important; }
    .grid-3 { grid-template-columns:1fr 1fr !important; }
    .grid-4 { grid-template-columns:1fr 1fr !important; }
    nav .nav-links { display:none !important; }
    nav .burger { display:block !important; }
  }
`;
