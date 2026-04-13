import React, { useEffect, useMemo, useState } from "react";
import { getVoteCounts, saveEarlyAccessEmail, saveVote } from "./supabaseClient.js";

const features = [
  ["AI wording", "Stronger resume language", "Turn weak bullets into clear, role-specific achievement statements."],
  ["JD analysis", "Know what the job wants", "Extract responsibilities, skills, keywords, and hidden fit signals."],
  ["Score tracking", "Measure every change", "Compare resume score movement before and after suggested edits."],
  ["Recruiter mode", "Rank resumes against one JD", "Upload multiple resumes and see which candidates match best."],
];

const roadmap = [
  ["Now", "AI resume suggestions", "Suggested words, stronger phrasing, JD keywords, and score tracking for job seekers."],
  ["Next", "Recruiter ranking mode", "Recruiters upload resumes, attach one job description, and rank candidate fit."],
  ["Future", "Jobs and email alerts", "Recruiters post openings while users receive personalized job emails."],
];

function App() {
  const [votes, setVotes] = useState({ yes: 0, maybe: 0, no: 0 });
  const [selectedVote, setSelectedVote] = useState("");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [voteStatus, setVoteStatus] = useState("");

  useEffect(() => {
    localStorage.removeItem("resumeAtsVoteV2");
    localStorage.removeItem("resumeAtsVoteCountsV2");

    getVoteCounts()
      .then(setVotes)
      .catch(() => setVoteStatus("Vote counts are loading soon."));
  }, []);

  useEffect(() => {
    const animatedItems = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    animatedItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const totalVotes = useMemo(() => Object.values(votes).reduce((total, count) => total + count, 0), [votes]);

  async function submitEmail(event) {
    event.preventDefault();
    setEmailStatus("Saving...");

    try {
      await saveEarlyAccessEmail(email);
      setEmail("");
      setEmailStatus("You're on the list.");
    } catch {
      setEmailStatus("Could not save your email. Try again.");
    }
  }

  async function submitVote(type) {
    if (selectedVote) return;

    setSelectedVote(type);
    setVotes((currentVotes) => ({ ...currentVotes, [type]: currentVotes[type] + 1 }));
    setVoteStatus("Saving vote...");

    try {
      await saveVote(type);
      const latestVotes = await getVoteCounts();
      setVotes(latestVotes);
      setVoteStatus("Vote saved.");
    } catch {
      setVotes((currentVotes) => ({ ...currentVotes, [type]: Math.max(currentVotes[type] - 1, 0) }));
      setSelectedVote("");
      setVoteStatus("Could not save your vote. Try again.");
    }
  }

  return (
    <main className="v2-page">
      <header className="v2-nav">
        <a className="v2-brand" href="#top" aria-label="ApplyWise home">
          <span className="v2-brand-mark">AW</span>
          <span className="v2-brand-name">ApplyWise</span>
        </a>
        <nav aria-label="Version two navigation">
          <a href="#product">Product</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#recruiters">Recruiters</a>
          <a href="#vote">Vote</a>
        </nav>
        <a className="v2-login" href="#vote">Join waitlist</a>
      </header>

      <section className="v2-hero" id="top" data-animate>
        <p className="v2-kicker">Resume intelligence for modern job search</p>
        <h1>Build better resumes,<span> faster.</span></h1>
        <p>
          ApplyWise helps users understand what a job is asking for, improve resume
          wording with AI, and track how every change affects their score.
        </p>
        <div className="v2-actions">
          <a href="#product">See the workflow</a>
          <a href="#vote">Vote for this product</a>
        </div>
      </section>

      <section className="v2-showcase" aria-label="Product preview" data-animate>
        <div className="v2-window">
          <div className="v2-window-top"><span /><span /><span /><p>Resume intelligence workspace</p></div>
          <div className="v2-product-grid">
            <div className="v2-score-card">
              <p>Resume score</p>
              <strong>74</strong>
              <span>+22 after suggested changes</span>
            </div>
            <div className="v2-command-card">
              <p>AI suggestion</p>
              <h2>Replace passive wording with measurable impact.</h2>
              <div><span>Before</span><p>Worked on dashboard and fixed bugs.</p></div>
              <div><span>After</span><p>Built analytics dashboard and reduced reporting time by 38%.</p></div>
            </div>
            <div className="v2-jd-card">
              <p>Job signals</p>
              <ul>
                <li><span>React</span><b>High</b></li>
                <li><span>API integration</span><b>High</b></li>
                <li><span>Ownership</span><b>Medium</b></li>
                <li><span>Testing</span><b>Missing</b></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-strip" id="product" data-animate>
        {features.map(([label, title, text]) => (
          <article key={title}><span>{label}</span><h3>{title}</h3><p>{text}</p></article>
        ))}
      </section>

      <section className="v2-split" id="recruiters" data-animate>
        <div>
          <p className="v2-kicker">Future recruiter mode</p>
          <h2>One job description. Many resumes. A ranked shortlist.</h2>
        </div>
        <div className="v2-rank-list">
          {[["01", "Aarav Sharma", "91%"], ["02", "Maya Patel", "84%"], ["03", "Rohan Mehta", "78%"]].map(([rank, name, score]) => (
            <div className="v2-rank" key={name}><span>{rank}</span><p>{name}</p><strong>{score}</strong></div>
          ))}
        </div>
      </section>

      <section className="v2-roadmap" id="roadmap" data-animate>
        <div className="v2-section-title">
          <p className="v2-kicker">Roadmap</p>
          <h2>Built for job seekers now. Expanding into hiring workflows next.</h2>
        </div>
        <div className="v2-roadmap-grid">
          {roadmap.map(([phase, title, text]) => (
            <article key={phase}><span>{phase}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="v2-early" aria-labelledby="join-early-title" data-animate>
        <div>
          <p className="v2-kicker">Join early</p>
          <h2 id="join-early-title">Be first to test the resume intelligence workspace.</h2>
        </div>
        <form className="v2-early-form" onSubmit={submitEmail}>
          <label htmlFor="early-email">Email input</label>
          <div>
            <input
              id="early-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit">Notify me</button>
          </div>
          {emailStatus && <p>{emailStatus}</p>}
        </form>
      </section>

      <section className="v2-vote" id="vote" data-animate>
        <div>
          <p className="v2-kicker">Vote on the idea</p>
          <h2>Would you use this platform for resume and job matching?</h2>
          <p>Your vote helps decide whether the next build should focus more on job seekers, recruiters, or both.</p>
        </div>
        <div className="v2-vote-options">
          {[["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]].map(([key, label]) => (
            <button className={selectedVote === key ? "selected" : ""} type="button" onClick={() => submitVote(key)} key={key}>
              <span>{label}</span><strong>{votes[key]}</strong><small>{totalVotes ? Math.round((votes[key] / totalVotes) * 100) : 0}%</small>
            </button>
          ))}
          {voteStatus && <p>{voteStatus}</p>}
        </div>
      </section>
    </main>
  );
}

export default App;
