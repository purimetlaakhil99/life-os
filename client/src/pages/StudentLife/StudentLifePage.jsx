import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  FileText,
  Search,
  BookOpen,
  Briefcase,
  Download,
  Plus,
  AlertTriangle,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { api } from '../../utils/api';

export function StudentLifePage() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [profile, setProfile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Notes Generator State
  const [noteSubject, setNoteSubject] = useState('Database Management Systems');
  const [noteTopic, setNoteTopic] = useState('Normalization (1NF, 2NF, 3NF, BCNF)');
  const [noteStyle, setNoteStyle] = useState('exam_oriented');
  const [generatedNote, setGeneratedNote] = useState(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  // Question Papers State
  const [searchSubject, setSearchSubject] = useState('');
  const [papersList, setPapersList] = useState([]);
  const [paperIntelligence, setPaperIntelligence] = useState(null);
  const [analyzingSubject, setAnalyzingSubject] = useState('');

  // Study Buddy State
  const [studyDoubt, setStudyDoubt] = useState('');
  const [studyAnswer, setStudyAnswer] = useState(null);
  const [isAskingBuddy, setIsAskingBuddy] = useState(false);

  // Performance What-If Simulator State
  const [simCurrentCGPA, setSimCurrentCGPA] = useState(8.2);
  const [simCompletedCredits, setSimCompletedCredits] = useState(70);
  const [simUpcomingCredits, setSimUpcomingCredits] = useState(24);
  const [simTargetCGPA, setSimTargetCGPA] = useState(8.7);
  const [whatIfResult, setWhatIfResult] = useState(null);

  // DSA / Career State
  const [dsaCategory, setDsaCategory] = useState('Binary Search & Trees');
  const [dsaProblemsSolved, setDsaProblemsSolved] = useState(145);

  useEffect(() => {
    loadStudentData();
  }, []);

  async function loadStudentData() {
    try {
      setLoading(true);
      const [profData, attData, assignData, timeData, papersData] = await Promise.all([
        api.getStudentProfile().catch(() => null),
        api.getAttendance().catch(() => []),
        api.getAssignments().catch(() => []),
        api.getTimetable().catch(() => []),
        api.searchQuestionPapers({}).catch(() => []),
      ]);
      setProfile(profData);
      setAttendanceRecords(attData);
      setAssignments(assignData);
      setTimetable(timeData);
      setPapersList(papersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Attendance Logger Handler
  async function handleLogAttendance(subjectName, status) {
    try {
      const res = await api.logAttendance({ subjectName, status });
      setAttendanceRecords(prev =>
        prev.map(r => r.subjectName === subjectName ? { ...r, ...res } : r)
      );
      loadStudentData();
    } catch (err) {
      alert(`Error logging attendance: ${err.message}`);
    }
  }

  // Generate 12-Section Academic Notes
  async function handleGenerateNotes(e) {
    e.preventDefault();
    if (!noteTopic.trim()) return;

    setIsGeneratingNote(true);
    setGeneratedNote(null);
    try {
      const data = await api.generateAcademicNotes({
        subject: noteSubject,
        topic: noteTopic,
        style: noteStyle,
        university: profile?.university || '',
        semester: profile?.semester || 5,
      });
      setGeneratedNote(data);
    } catch (err) {
      alert(`Note generation failed: ${err.message}`);
    } finally {
      setIsGeneratingNote(false);
    }
  }

  // Question Paper Intelligence Analyzer
  async function handleAnalyzePapers(subject) {
    setAnalyzingSubject(subject);
    try {
      const data = await api.analyzePaperIntelligence(subject);
      setPaperIntelligence(data);
    } catch (err) {
      alert(`Paper analysis failed: ${err.message}`);
    } finally {
      setAnalyzingSubject('');
    }
  }

  // Ask Study Buddy
  async function handleAskStudyBuddy(e) {
    e.preventDefault();
    if (!studyDoubt.trim()) return;

    setIsAskingBuddy(true);
    try {
      const res = await api.askStudyBuddy({
        question: studyDoubt,
        subject: noteSubject,
        topic: noteTopic,
      });
      setStudyAnswer(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAskingBuddy(false);
    }
  }

  // Run What-If GPA simulation
  async function runWhatIfSimulator() {
    try {
      const res = await api.calculateWhatIfGPA({
        currentCGPA: simCurrentCGPA,
        completedCredits: simCompletedCredits,
        upcomingCredits: simUpcomingCredits,
        targetCGPA: simTargetCGPA,
      });
      setWhatIfResult(res);
    } catch (err) {
      alert(err.message);
    }
  }

  const tabs = [
    { id: 'attendance', label: 'Attendance Intelligence', icon: CheckCircle },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'notes', label: '12-Section AI Notes', icon: FileText },
    { id: 'papers', label: 'Previous Exam Papers', icon: Search },
    { id: 'assignments', label: 'Assignments & Exams', icon: BookOpen },
    { id: 'performance', label: 'SGPA & CGPA Simulator', icon: Award },
    { id: 'study-buddy', label: 'AI Study Buddy', icon: Sparkles },
    { id: 'career', label: 'DSA & Career Track', icon: Briefcase },
  ];

  return (
    <div style={styles.container}>
      {/* Profile Bar */}
      <div style={styles.profileBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={styles.univIcon}>
            <GraduationCap size={24} color="#06b6d4" />
          </div>
          <div>
            <h2 style={styles.profileTitle}>
              {profile?.university || 'University Student Profile'}
            </h2>
            <p style={styles.profileSubtitle}>
              {profile?.course || 'B.Tech'} in {profile?.branch || 'Computer Science'} • Semester {profile?.semester || 5} • Attendance Target: {profile?.attendanceTarget || 75}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={styles.tabsNav}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tabBtn,
                ...(active ? styles.tabBtnActive : {}),
              }}
            >
              <Icon size={15} color={active ? '#818cf8' : '#94a3b8'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: ATTENDANCE INTELLIGENCE */}
      {activeTab === 'attendance' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionTitleRow}>
            <h3>Subject-wise Attendance Intelligence</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Formula-driven margins: required classes to hit {profile?.attendanceTarget || 75}% target & safe leaves
            </span>
          </div>

          <div style={styles.cardsGrid}>
            {attendanceRecords.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>
                No attendance records yet. Add slots to your timetable or log classes below.
              </div>
            ) : (
              attendanceRecords.map((r) => {
                const isShort = r.isShortage;
                return (
                  <div key={r._id || r.subjectName} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{r.subjectName}</strong>
                      <span className={`badge ${isShort ? 'badge-danger' : 'badge-success'}`}>
                        {r.statusLabel || (isShort ? 'Warning' : 'On Track')}
                      </span>
                    </div>

                    <div style={styles.attStatsRow}>
                      <div style={styles.bigStat}>
                        <span style={{ ...styles.statNum, color: isShort ? '#ef4444' : '#10b981' }}>
                          {r.percentage}%
                        </span>
                        <span style={styles.statLabel}>Current Attendance</span>
                      </div>
                      <div style={styles.subStats}>
                        <span>Attended: <strong>{r.attended}</strong> / {r.total} classes</span>
                        <span>Target: <strong>{r.targetPercentage}%</strong></span>
                      </div>
                    </div>

                    {/* Accurate Mathematical Intelligence Insight */}
                    <div style={{
                      ...styles.marginAlert,
                      background: isShort ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      borderColor: isShort ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                    }}>
                      {isShort ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.8rem' }}>
                          <AlertTriangle size={15} />
                          <span>
                            Attend the next <strong>{r.classesToReachTarget}</strong> consecutive classes without missing to reach {r.targetPercentage}%.
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem' }}>
                          <CheckCircle size={15} />
                          <span>
                            Safe Margin: You can miss up to <strong>{r.safeClassesToMiss}</strong> class(es) and still maintain {r.targetPercentage}%.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Log Buttons */}
                    <div style={styles.logButtons}>
                      <button
                        onClick={() => handleLogAttendance(r.subjectName, 'present')}
                        style={styles.presentBtn}
                      >
                        + Present Today
                      </button>
                      <button
                        onClick={() => handleLogAttendance(r.subjectName, 'absent')}
                        style={styles.absentBtn}
                      >
                        + Absent
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 12-SECTION AI NOTES */}
      {activeTab === 'notes' && (
        <div style={styles.tabContent}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Generate 12-Section Academic Notes</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Produces a complete university curriculum note with definitions, formulas, architecture, comparisons, 16-mark long answers, and exportable PDF.
            </p>

            <form onSubmit={handleGenerateNotes} style={styles.noteForm}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={styles.label}>Subject:</label>
                  <input
                    type="text"
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Operating Systems"
                  />
                </div>
                <div style={{ flex: 1.5, minWidth: '250px' }}>
                  <label style={styles.label}>Topic / Concept:</label>
                  <input
                    type="text"
                    value={noteTopic}
                    onChange={(e) => setNoteTopic(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Bankers Algorithm for Deadlock Avoidance"
                  />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={styles.label}>Style:</label>
                  <select
                    value={noteStyle}
                    onChange={(e) => setNoteStyle(e.target.value)}
                    style={styles.input}
                  >
                    <option value="exam_oriented">Exam-Oriented</option>
                    <option value="detailed">Comprehensive & Detailed</option>
                    <option value="short">Short Revision Notes</option>
                    <option value="beginner_friendly">Beginner Friendly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingNote}
                style={styles.generateBtn}
              >
                <Sparkles size={16} />
                <span>{isGeneratingNote ? 'Generating 12 Sections...' : 'Generate AI Notes'}</span>
              </button>
            </form>
          </div>

          {/* Render 12-Section Structured Notes */}
          {generatedNote && (
            <div className="card" style={styles.notesOutput}>
              <div style={styles.notesOutputHeader}>
                <div>
                  <h3 style={{ color: '#818cf8', fontSize: '1.25rem' }}>
                    {generatedNote.subject}: {generatedNote.topic}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Style: {generatedNote.style.toUpperCase()} • Generated by LIFE OS Academic Engine
                  </span>
                </div>
                <a
                  href={`/api/academic/notes/${generatedNote._id}/pdf`}
                  download={`${generatedNote.subject}_notes.pdf`}
                  style={styles.downloadPdfBtn}
                >
                  <Download size={15} />
                  <span>Download Clean PDF</span>
                </a>
              </div>

              <div style={styles.sectionsAccordion}>
                {Object.entries(generatedNote.sections).map(([secKey, secVal], idx) => (
                  <div key={secKey} style={styles.noteSectionCard}>
                    <h4 style={styles.sectionHeading}>
                      {idx + 1}. {secKey.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </h4>
                    <div style={styles.sectionBody}>
                      {Array.isArray(secVal) ? (
                        <ul style={{ paddingLeft: '1.25rem' }}>
                          {secVal.map((item, i) => (
                            <li key={i} style={{ margin: '0.35rem 0', color: '#cbd5e1' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {secVal}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PREVIOUS EXAM PAPERS & INTELLIGENCE */}
      {activeTab === 'papers' && (
        <div style={styles.tabContent}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>Previous Year Question Papers Repository</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Real archived university exam papers. Run statistical question frequency and high-yield topic analysis.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search subject (e.g. Database Management Systems)..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={() => loadStudentData()}
                style={styles.generateBtn}
              >
                <Search size={15} />
                <span>Search Papers</span>
              </button>
            </div>
          </div>

          {/* Intelligence Analysis Output if Selected */}
          {paperIntelligence && (
            <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ color: '#22d3ee', fontSize: '1.1rem' }}>
                  Intelligence Pattern Analysis: {paperIntelligence.subject}
                </h4>
                <span className="badge badge-info">{paperIntelligence.totalPapersAnalyzed} Papers Analyzed</span>
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'block', marginBottom: '0.5rem' }}>
                    🔥 Top High-Frequency Exam Questions (Repeated &gt;3 Times):
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {paperIntelligence.repeatedQuestions.map((q, i) => (
                      <li key={i} style={{ margin: '0.4rem 0' }}>
                        "{q.questionText}" <strong>({q.appearances} appearances, {q.marks} Marks)</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'block', marginBottom: '0.5rem' }}>
                    📊 Important Units by Weightage:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {paperIntelligence.importantUnits.map((u, i) => (
                      <div key={i} style={styles.unitRow}>
                        <span>{u.unit}</span>
                        <span className="badge badge-primary">{u.marksWeightage} Marks Historical</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                {paperIntelligence.disclaimer}
              </p>
            </div>
          )}

          {/* Papers List */}
          <div style={styles.cardsGrid}>
            {papersList.map((p) => (
              <div key={p._id} className="card">
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Year {p.year}
                </span>
                <strong style={{ fontSize: '1rem', color: '#f8fafc', display: 'block' }}>
                  {p.subject}
                </strong>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0.75rem 0' }}>
                  {p.university} • Semester {p.semester} • {p.branch}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAnalyzePapers(p.subject)}
                    style={styles.analyzeBtn}
                  >
                    <Sparkles size={13} />
                    <span>Analyze Patterns</span>
                  </button>
                  {p.fileUrl && (
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.viewArchiveBtn}
                    >
                      Official Archive
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI STUDY BUDDY */}
      {activeTab === 'study-buddy' && (
        <div style={styles.tabContent}>
          <div className="card">
            <h3>AI Study Buddy — Academic Doubt Solver & Flashcards</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Ask syllabus-specific doubts, get step-by-step derivations, and generate interactive recall flashcards.
            </p>

            <form onSubmit={handleAskStudyBuddy} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Ask any technical doubt (e.g. 'Explain 2-phase locking protocol with an example')..."
                value={studyDoubt}
                onChange={(e) => setStudyDoubt(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="submit"
                disabled={isAskingBuddy}
                style={styles.generateBtn}
              >
                <Sparkles size={15} />
                <span>{isAskingBuddy ? 'Solving...' : 'Ask Buddy'}</span>
              </button>
            </form>

            {studyAnswer && (
              <div style={styles.buddyAnswerBox}>
                <div style={styles.answerText}>
                  {studyAnswer.answer.split('\n').map((par, i) => (
                    <p key={i} style={{ margin: '0.35rem 0', color: '#e2e8f0', lineHeight: 1.6 }}>
                      {par}
                    </p>
                  ))}
                </div>

                {studyAnswer.flashcards && studyAnswer.flashcards.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#818cf8', display: 'block', marginBottom: '0.5rem' }}>
                      Interactive Recall Flashcards:
                    </strong>
                    <div className="grid-2">
                      {studyAnswer.flashcards.map((f, i) => (
                        <div key={i} style={styles.flashcard}>
                          <span style={styles.flashFront}>Q: {f.front}</span>
                          <span style={styles.flashBack}>A: {f.back}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SGPA & CGPA SIMULATOR */}
      {activeTab === 'performance' && (
        <div style={styles.tabContent}>
          <div className="card">
            <h3>Academic Performance & What-If CGPA Simulator</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Simulate required SGPA across upcoming semester credits to achieve target graduation honours.
            </p>

            <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <label style={styles.label}>Current CGPA:</label>
                <input
                  type="number"
                  step="0.01"
                  value={simCurrentCGPA}
                  onChange={(e) => setSimCurrentCGPA(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Completed Credits:</label>
                <input
                  type="number"
                  value={simCompletedCredits}
                  onChange={(e) => setSimCompletedCredits(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Upcoming Credits:</label>
                <input
                  type="number"
                  value={simUpcomingCredits}
                  onChange={(e) => setSimUpcomingCredits(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Target CGPA:</label>
                <input
                  type="number"
                  step="0.01"
                  value={simTargetCGPA}
                  onChange={(e) => setSimTargetCGPA(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button onClick={runWhatIfSimulator} style={styles.generateBtn}>
              Run Simulation
            </button>

            {whatIfResult && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: whatIfResult.possible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${whatIfResult.possible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}>
                <strong style={{ color: whatIfResult.possible ? '#34d399' : '#f87171', display: 'block', marginBottom: '0.35rem' }}>
                  {whatIfResult.possible ? 'Target Achievable' : 'Mathematical Feasibility Warning'}
                </strong>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{whatIfResult.advice}</p>
                {whatIfResult.possible && (
                  <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, display: 'block', marginTop: '0.3rem' }}>
                    Required SGPA in next semester: {whatIfResult.requiredSGPA} / 10.0
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div style={styles.tabContent}>
          <div className="card">
            <h3>Weekly Class Timetable</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {timetable.length === 0 ? (
                <p style={{ color: '#64748b' }}>No class slots in timetable yet.</p>
              ) : (
                timetable.map((slot) => (
                  <div key={slot._id} style={styles.unitRow}>
                    <div>
                      <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{slot.subjectName}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                        Room: {slot.classroom} • Faculty: {slot.faculty}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                        Day {slot.dayOfWeek}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div style={styles.tabContent}>
          <div className="card">
            <h3>Assignments & Examination Tracker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {assignments.length === 0 ? (
                <p style={{ color: '#64748b' }}>No assignments or exams recorded yet.</p>
              ) : (
                assignments.map((a) => (
                  <div key={a._id} style={styles.unitRow}>
                    <div>
                      <strong style={{ color: '#f8fafc' }}>{a.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                        Subject: {a.subjectName} • Due: {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`badge badge-${a.status === 'submitted' ? 'success' : 'warning'}`}>
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAREER & DSA TRACK */}
      {activeTab === 'career' && (
        <div style={styles.tabContent}>
          <div className="card">
            <h3>Student Career, Projects & DSA Practice Progress</h3>
            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div style={styles.careerStatCard}>
                <span style={styles.statLabel}>DSA Problems Solved</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>
                  {dsaProblemsSolved}
                </span>
                <button
                  onClick={() => setDsaProblemsSolved(p => p + 1)}
                  style={styles.miniBtn}
                >
                  + Log 1 Problem Solved
                </button>
              </div>

              <div style={styles.careerStatCard}>
                <span style={styles.statLabel}>Internship Applications</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                  6 Applied
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>2 in technical screening</span>
              </div>

              <div style={styles.careerStatCard}>
                <span style={styles.statLabel}>College Major Projects</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee' }}>
                  LIFE OS
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sprint 1 completed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  profileBar: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem 1.5rem',
  },
  univIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(6, 182, 212, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: '1.15rem',
    color: '#f8fafc',
    margin: 0,
  },
  profileSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '0.2rem',
  },
  tabsNav: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.15rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
  },
  tabBtnActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    color: '#818cf8',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionTitleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  attStatsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNum: {
    fontSize: '1.8rem',
    fontWeight: 800,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  subStats: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8rem',
    color: '#94a3b8',
    textAlign: 'right',
    gap: '0.2rem',
  },
  marginAlert: {
    padding: '0.6rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
  },
  logButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  presentBtn: {
    flex: 1,
    padding: '0.45rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  absentBtn: {
    flex: 1,
    padding: '0.45rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.35rem',
  },
  input: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.65rem 0.85rem',
    color: '#f8fafc',
    fontSize: '0.85rem',
  },
  noteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  generateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    alignSelf: 'flex-start',
  },
  notesOutput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  notesOutputHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-subtle)',
  },
  downloadPdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-gradient)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  sectionsAccordion: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  noteSectionCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
  },
  sectionHeading: {
    fontSize: '0.9rem',
    color: '#818cf8',
    marginBottom: '0.5rem',
  },
  sectionBody: {
    fontSize: '0.85rem',
  },
  analyzeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(6, 182, 212, 0.15)',
    color: '#22d3ee',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  viewArchiveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  unitRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.85rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
  },
  buddyAnswerBox: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    border: '1px solid var(--border-subtle)',
  },
  flashcard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  flashFront: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  flashBack: {
    fontSize: '0.8rem',
    color: '#34d399',
  },
  careerStatCard: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'center',
    alignItems: 'center',
  },
  miniBtn: {
    padding: '0.3rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
};
