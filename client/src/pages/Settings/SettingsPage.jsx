import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Mail,
  Cake,
  CreditCard,
  Languages,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const [googleStatus, setGoogleStatus] = useState({ connected: false, gmailSendAuthorized: false });
  const [contacts, setContacts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Contact / Birthday State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cBirthday, setCBirthday] = useState('');
  const [cRelationship, setCRelationship] = useState('friend');
  const [cLanguage, setCLanguage] = useState('en');
  const [cStyle, setCStyle] = useState('heartfelt');
  const [cNotes, setCNotes] = useState('');
  const [cAutoSend, setCAutoSend] = useState(true);
  const [cSendTime, setCSendTime] = useState('09:00');

  // Wish Preview
  const [previewContactId, setPreviewContactId] = useState(null);
  const [generatedWish, setGeneratedWish] = useState('');
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);

  // New Subscription State
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subDate, setSubDate] = useState('');
  const [subCycle, setSubCycle] = useState('monthly');

  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    try {
      setLoading(true);
      const [gData, cData, sData, hData] = await Promise.all([
        api.getGoogleStatus().catch(() => ({ connected: false })),
        api.getContacts().catch(() => []),
        api.getSubscriptions().catch(() => []),
        api.getBirthdayHistory().catch(() => []),
      ]);
      setGoogleStatus(gData);
      setContacts(cData);
      setSubscriptions(sData);
      setHistory(hData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectGoogle() {
    try {
      const { url } = await api.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      alert(`Google Auth Error: ${err.message}`);
    }
  }

  async function handleDisconnectGoogle() {
    if (!window.confirm('Disconnect Google account? Automated birthday sending will be disabled.')) return;
    try {
      await api.disconnectGoogle();
      setGoogleStatus({ connected: false, gmailSendAuthorized: false });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCreateContact(e) {
    e.preventDefault();
    if (!cName.trim() || !cEmail.trim() || !cBirthday) return;

    try {
      const created = await api.createContact({
        name: cName,
        email: cEmail,
        birthday: cBirthday,
        relationship: cRelationship,
        preferredLanguage: cLanguage,
        messageStyle: cStyle,
        personalNotes: cNotes,
        autoBirthdayEmail: cAutoSend,
        birthdaySendTime: cSendTime,
      });
      setContacts(prev => [created, ...prev]);
      setIsAddingContact(false);
      setCName('');
      setCEmail('');
      setCBirthday('');
      setCNotes('');
    } catch (err) {
      alert(`Error adding contact: ${err.message}`);
    }
  }

  async function handlePreviewWish(contact) {
    setPreviewContactId(contact._id);
    setIsGeneratingWish(true);
    try {
      const res = await api.generateBirthdayWish(contact._id, {
        language: contact.preferredLanguage,
        style: contact.messageStyle,
      });
      setGeneratedWish(res.wish);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGeneratingWish(false);
    }
  }

  async function handleCreateSub(e) {
    e.preventDefault();
    if (!subName.trim() || !subAmount) return;

    try {
      const created = await api.createSubscription({
        name: subName,
        amount: Number(subAmount),
        nextBillingDate: subDate || new Date().toISOString(),
        billingCycle: subCycle,
      });
      setSubscriptions(prev => [created, ...prev]);
      setIsAddingSub(false);
      setSubName('');
      setSubAmount('');
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteContact(id) {
    try {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSub(id) {
    try {
      await api.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={styles.container}>
      {/* 1. Google OAuth & Gmail Integration Card */}
      <div className="card">
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.gmailIconWrap}>
              <Mail size={18} color="#ea4335" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>
                Google Workspace & Gmail Connection
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Powers automatic birthday email dispatches and calendar sync via official Google OAuth 2.0
              </p>
            </div>
          </div>

          <div>
            {googleStatus.connected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-success">Gmail Connected</span>
                <button
                  onClick={handleDisconnectGoogle}
                  style={styles.disconnectBtn}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                style={styles.connectGoogleBtn}
              >
                <ExternalLink size={14} />
                <span>Connect Google Account</span>
              </button>
            )}
          </div>
        </div>

        <div style={styles.securityNotice}>
          <ShieldCheck size={16} color="#10b981" />
          <span>
            Security guarantee: Requires minimal <code>gmail.send</code> scope. Tokens are encrypted at rest with AES-256-GCM. We never request passwords.
          </span>
        </div>
      </div>

      {/* 2. Mandatory Automatic Birthday Email System */}
      <div className="card">
        <div style={styles.cardHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cake size={20} color="#ec4899" />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>
                Automatic Birthday Email System
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Scheduled recurring background worker sends personalized wishes in English, हिन्दी, or తెలుగు via your Gmail at the selected time.
            </p>
          </div>

          <button
            onClick={() => setIsAddingContact(!isAddingContact)}
            style={styles.addContactBtn}
          >
            <Plus size={15} />
            <span>Add Birthday Contact</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {isAddingContact && (
          <form onSubmit={handleCreateContact} style={styles.contactForm}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1.5, minWidth: '200px' }}>
                <label style={styles.label}>Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ flex: 1.5, minWidth: '220px' }}>
                <label style={styles.label}>Email Address (Recipient):</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={styles.label}>Birthday Date:</label>
                <input
                  type="date"
                  value={cBirthday}
                  onChange={(e) => setCBirthday(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={styles.label}>Relationship:</label>
                <select
                  value={cRelationship}
                  onChange={(e) => setCRelationship(e.target.value)}
                  style={styles.input}
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="classmate">Classmate</option>
                  <option value="colleague">Colleague</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={styles.label}>Preferred Language:</label>
                <select
                  value={cLanguage}
                  onChange={(e) => setCLanguage(e.target.value)}
                  style={styles.input}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={styles.label}>Message Style:</label>
                <select
                  value={cStyle}
                  onChange={(e) => setCStyle(e.target.value)}
                  style={styles.input}
                >
                  <option value="heartfelt">Heartfelt</option>
                  <option value="friendly">Friendly</option>
                  <option value="emotional">Emotional</option>
                  <option value="funny">Funny</option>
                  <option value="simple">Simple</option>
                  <option value="personalized">Personalized</option>
                </select>
              </div>

              <div style={{ width: '130px' }}>
                <label style={styles.label}>Dispatch Time:</label>
                <input
                  type="time"
                  value={cSendTime}
                  onChange={(e) => setCSendTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Personal Notes (for tailoring the greeting):</label>
              <input
                type="text"
                placeholder="e.g. Loves coding, studied together at NIT..."
                value={cNotes}
                onChange={(e) => setCNotes(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cAutoSend}
                  onChange={(e) => setCAutoSend(e.target.checked)}
                />
                Enable automated Gmail dispatch on their birthday without manual click
              </label>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  Save & Schedule
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Contacts Table */}
        <div style={styles.contactList}>
          {contacts.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
              No birthday contacts added yet. Add family, friends, or classmates above!
            </p>
          ) : (
            contacts.map((c) => (
              <div key={c._id} style={styles.contactRow}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({c.relationship})</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {c.email} • Birthday: {new Date(c.birthday).toLocaleDateString()} • {c.preferredLanguage.toUpperCase()} ({c.messageStyle})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {c.autoBirthdayEmail && (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      Auto Send: {c.birthdaySendTime}
                    </span>
                  )}

                  <button
                    onClick={() => handlePreviewWish(c)}
                    style={styles.previewWishBtn}
                  >
                    <Sparkles size={13} />
                    <span>Preview Wish</span>
                  </button>

                  <button
                    onClick={() => handleDeleteContact(c._id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={14} color="#64748b" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Generated Wish Preview Modal/Box */}
        {previewContactId && (
          <div style={styles.wishPreviewBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#818cf8', fontSize: '0.9rem' }}>
                Personalized Birthday Message Preview:
              </strong>
              <button
                onClick={() => setPreviewContactId(null)}
                style={{ color: '#64748b', fontSize: '0.8rem' }}
              >
                Close Preview
              </button>
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              {isGeneratingWish ? 'Generating personalized greeting...' : `"${generatedWish}"`}
            </p>
          </div>
        )}
      </div>

      {/* 3. Subscriptions & Bills */}
      <div className="card">
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="#06b6d4" />
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>
              Subscriptions & Recurring Bills
            </h3>
          </div>

          <button
            onClick={() => setIsAddingSub(!isAddingSub)}
            style={styles.addContactBtn}
          >
            <Plus size={15} />
            <span>Add Subscription</span>
          </button>
        </div>

        {isAddingSub && (
          <form onSubmit={handleCreateSub} style={styles.contactForm}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1.5 }}>
                <label style={styles.label}>Service / Bill Name:</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub Copilot, Spotify, WiFi"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Amount (₹):</label>
                <input
                  type="number"
                  placeholder="699"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Next Billing Date:</label>
                <input
                  type="date"
                  value={subDate}
                  onChange={(e) => setSubDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Cycle:</label>
                <select
                  value={subCycle}
                  onChange={(e) => setSubCycle(e.target.value)}
                  style={styles.input}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsAddingSub(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" style={styles.saveBtn}>
                Save Bill
              </button>
            </div>
          </form>
        )}

        <div style={styles.contactList}>
          {subscriptions.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
              No subscriptions tracked. Add renewals to receive automated reminder alerts!
            </p>
          ) : (
            subscriptions.map((s) => (
              <div key={s._id} style={styles.contactRow}>
                <div>
                  <strong style={{ color: '#f8fafc' }}>{s.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                    Next renewal: {new Date(s.nextBillingDate).toLocaleDateString()} • {s.billingCycle}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                    ₹{s.amount}
                  </span>
                  <button onClick={() => handleDeleteSub(s._id)} style={styles.deleteBtn}>
                    <Trash2 size={14} color="#64748b" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  gmailIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(234, 67, 53, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectGoogleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 1.15rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(234, 67, 53, 0.15)',
    border: '1px solid rgba(234, 67, 53, 0.35)',
    color: '#f87171',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  disconnectBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  securityNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    background: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    fontSize: '0.8rem',
    color: '#34d399',
  },
  addContactBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    background: 'var(--bg-surface)',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.55rem 0.75rem',
    color: '#f8fafc',
    fontSize: '0.85rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)',
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  saveBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
  },
  previewWishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.65rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  wishPreviewBox: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: 'var(--radius-md)',
  },
  deleteBtn: {
    padding: '0.3rem',
  },
};
