
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import './App.css';

const WHATSAPP_NUMBER = '254748310771';

type Region = 'kenya' | 'international';

const menu = [
  'Dashboard',
  'AI Chat',
  'Conversations',
  'AI Agents',
  'AI Call Centre',
  'Automations',
  'Website Builder',
  'WhatsApp',
  'Analytics',
  'Subscriptions',
  'Call Credits',
  'Settings',
];

const icons: Record<string, string> = {
  Dashboard: '⌂',
  'AI Chat': '✦',
  Conversations: '▤',
  'AI Agents': '◈',
  'AI Call Centre': '☎',
  Automations: '⚡',
  'Website Builder': '▣',
  WhatsApp: '◉',
  Analytics: '▥',
  Subscriptions: '◇',
  'Call Credits': '◷',
  Settings: '⚙',
};

const plans = [
  {
    name: 'Starter',
    kenya: '499',
    international: '4.99',
    agents: '1 AI agent',
    replies: '100 AI text replies/month',
    automations: '1 automation',
    websites: '1 website',
  },
  {
    name: 'Professional',
    kenya: '999',
    international: '9.99',
    agents: '3 AI agents',
    replies: '400 AI text replies/month',
    automations: '5 automations',
    websites: '3 websites',
    popular: true,
  },
  {
    name: 'Enterprise',
    kenya: '2,999',
    international: '29.99',
    agents: '10 AI agents',
    replies: '1,500 AI text replies/month',
    automations: '20 automations',
    websites: '10 websites',
  },
];

type ChatMessage = {
  from: 'ai' | 'user';
  text: string;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [page, setPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [region, setRegion] = useState<Region>('kenya');
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'ai',
      text: "Hello! I'm LUNA AGENT. How can I help your business today?",
    },
  ]);

  const [businessName, setBusinessName] = useState('');
  const [websiteType, setWebsiteType] = useState('Business website');
  const [agentName, setAgentName] = useState('');
  const [agents, setAgents] = useState<string[]>([]);
  const [automationName, setAutomationName] = useState('');
  const [automations, setAutomations] = useState<string[]>([]);
  const [callCredits] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) setAuthError(error.message);

      setSession(data.session);
      setAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (!email.trim() || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }

    if (authMode === 'signup' && !fullName.trim()) {
      setAuthError('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Your password must have at least 6 characters.');
      return;
    }

    setAuthBusy(true);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          setAuthMessage('Your account has been created successfully.');
        } else {
          setAuthMessage(
            'Account created. Check your email to confirm your address before signing in.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setPage('Dashboard');
    setPassword('');
    setSidebarOpen(false);
    setAuthMessage('');
  }

  function openPage(target: string) {
    setPage(target);
    setSidebarOpen(false);
  }

  const currency = region === 'kenya' ? 'KSh' : '$';
  const displayName =
    session?.user.user_metadata?.full_name ||
    session?.user.email ||
    'Workspace owner';

  function whatsappLink(text: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function sendMessage() {
    if (!message.trim()) return;

    const newMessage = message.trim();

    setMessages((old) => [
      ...old,
      { from: 'user', text: newMessage },
      {
        from: 'ai',
        text: 'Thank you! This is a demo response. Connect an AI provider to enable real AI conversations.',
      },
    ]);

    setMessage('');
  }

  function addAgent() {
    if (!agentName.trim()) return;
    setAgents((old) => [...old, agentName.trim()]);
    setAgentName('');
  }

  function addAutomation() {
    if (!automationName.trim()) return;
    setAutomations((old) => [...old, automationName.trim()]);
    setAutomationName('');
  }

  function selectPlan(name: string) {
    alert(
      `${name} plan selected. Payment checkout and subscription activation still need to be connected.`
    );
  }

  function chooseCredits(amount: number) {
    alert(
      `You selected ${currency}${amount} in call credits. Payment must be connected before credits can be purchased.`
    );
  }

  if (authLoading) {
    return (
      <div className="luna-auth-screen">
        <div className="luna-auth-card">
          <img className="auth-eagle" src="/luna-eagle.png" alt="LUNA eagle" />
          <h1>LUNA AGENT</h1>
          <p className="luna-auth-tagline">INTELLIGENCE REDEFINED</p>
          <p>Loading your secure workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="luna-auth-screen">
        <div className="luna-auth-card">
          <img className="auth-eagle" src="/luna-eagle.png" alt="LUNA eagle" />
          <h1>LUNA AGENT</h1>
          <p className="luna-auth-tagline">INTELLIGENCE REDEFINED</p>

          <h2>
            {authMode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>

          <p>
            {authMode === 'login'
              ? 'Sign in to access your business workspace.'
              : 'Create your secure LUNA AGENT account.'}
          </p>

          <form onSubmit={handleAuth} className="luna-auth-form">
            {authMode === 'signup' && (
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              autoComplete="email"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (at least 6 characters)"
              autoComplete={
                authMode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={6}
              required
            />

            {authError && <div className="luna-auth-error">{authError}</div>}

            {authMessage && (
              <div className="luna-auth-message">{authMessage}</div>
            )}

            <button
              type="submit"
              className="primary-btn luna-auth-submit"
              disabled={authBusy}
            >
              {authBusy
                ? 'Please wait...'
                : authMode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <p className="luna-auth-switch">
            {authMode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
                setAuthMessage('');
              }}
            >
              {authMode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="luna-app">
      {sidebarOpen && (
        <button
          className="mobile-menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <img src="/luna-eagle.png" alt="LUNA AGENT eagle" />
          <div>
            <h1>LUNA AGENT</h1>
            <span>INTELLIGENCE REDEFINED</span>
          </div>
        </div>

        <button
          className="mobile-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>

        <div className="nav-label">WORKSPACE</div>

        <nav className="main-navigation">
          {menu.map((item) => (
            <button
              key={item}
              className={`nav-item ${page === item ? 'active' : ''}`}
              onClick={() => openPage(item)}
            >
              <span className="nav-icon">{icons[item]}</span>
              <span className="nav-text">{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          Workspace ready
          <small>Version 1.0</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <div>
              <span className="topbar-caption">
                YOUR BUSINESS. YOUR AI AGENT.
              </span>
              <h2>{page}</h2>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <strong>{displayName}</strong>
              <small>Signed in</small>
            </div>
          </div>
        </header>

        <section className="content">
          {page === 'Dashboard' && (
            <>
              <div className="welcome-card">
                <div>
                  <span className="purple-label">WELCOME TO THE FUTURE</span>
                  <h1>Welcome to LUNA AGENT</h1>
                  <p>
                    Manage customer conversations, AI agents, calls, automations
                    and websites in one workspace.
                  </p>
                  <button
                    className="primary-btn"
                    onClick={() => openPage('AI Chat')}
                  >
                    Open AI Chat →
                  </button>
                </div>
              </div>

              <h3 className="section-title">YOUR WORKSPACE</h3>
              <div className="stats-grid">
                <Stat
                  title="AI Agents"
                  value={agents.length.toString()}
                  icon="◈"
                />
                <Stat
                  title="Automations"
                  value={automations.length.toString()}
                  icon="⚡"
                />
                <Stat
                  title="Chat Messages"
                  value={messages.length.toString()}
                  icon="▤"
                />
                <Stat
                  title="Call Credits"
                  value={callCredits.toString()}
                  icon="☎"
                />
              </div>

              <h3 className="section-title">QUICK ACCESS</h3>
              <div className="quick-grid">
                {[
                  ['✦', 'Talk to LUNA', 'AI Chat'],
                  ['◈', 'Create AI agent', 'AI Agents'],
                  ['☎', 'AI Call Centre', 'AI Call Centre'],
                  ['▣', 'Build a website', 'Website Builder'],
                ].map(([icon, title, target]) => (
                  <button
                    className="quick-card"
                    key={target}
                    onClick={() => openPage(target)}
                  >
                    <span>{icon}</span>
                    <strong>{title}</strong>
                    <small>Open workspace →</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {page === 'AI Chat' && (
            <div className="chat-panel">
              <div className="chat-heading">
                <div className="feature-icon">✦</div>
                <div>
                  <h3>LUNA AGENT Assistant</h3>
                  <span>
                    <i className="online-dot" /> Demo conversation
                  </span>
                </div>
              </div>

              <div className="messages">
                {messages.map((item, index) => (
                  <div className={`message-row ${item.from}`} key={index}>
                    <div className="message">
                      <small>{item.from === 'ai' ? 'LUNA AGENT' : 'YOU'}</small>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendMessage();
                  }}
                  placeholder="Message LUNA AGENT..."
                />
                <button onClick={sendMessage}>Send ↑</button>
              </div>
              <p className="chat-note">
                Demo replies only. Real AI requires an AI provider connection.
              </p>
            </div>
          )}

          {page === 'Conversations' && (
            <FeatureCard
              icon="▤"
              title="Customer conversations"
              description="Customer messages from your connected channels will appear here after messaging integrations are configured."
            />
          )}

          {page === 'AI Agents' && (
            <div className="feature-card">
              <FeatureHeader icon="◈" title="Build your AI agents" />
              <p>Create and manage assistants for your business.</p>
              <div className="form-row">
                <input
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  placeholder="Enter agent name"
                />
                <button className="primary-btn" onClick={addAgent}>
                  Create agent
                </button>
              </div>
              {agents.map((agent, index) => (
                <div className="saved-item" key={`${agent}-${index}`}>
                  <span>◈</span>
                  {agent}
                  <small>Local draft</small>
                </div>
              ))}
            </div>
          )}

          {page === 'AI Call Centre' && (
            <div className="feature-card">
              <FeatureHeader icon="☎" title="LUNA AGENT Call Centre" />
              <p>
                Manage incoming and outgoing customer calls with AI. Call-centre
                access is included in all subscription packages.
              </p>
              <div className="call-credit-panel">
                <span className="purple-label">YOUR CALL CREDIT BALANCE</span>
                <h2>
                  {currency}
                  {callCredits}
                </h2>
                <p>Calls require prepaid credits. No unlimited free calls.</p>
                <button
                  className="primary-btn"
                  onClick={() => openPage('Call Credits')}
                >
                  Buy call credits →
                </button>
              </div>
              <p className="chat-note">
                Actual calling requires a voice provider and payment system.
              </p>
            </div>
          )}

          {page === 'Automations' && (
            <div className="feature-card">
              <FeatureHeader icon="⚡" title="Business automations" />
              <p>Create automation drafts for your workspace.</p>
              <div className="form-row">
                <input
                  value={automationName}
                  onChange={(event) => setAutomationName(event.target.value)}
                  placeholder="e.g. Welcome new customers"
                />
                <button className="primary-btn" onClick={addAutomation}>
                  Add automation
                </button>
              </div>
              {automations.map((item, index) => (
                <div className="saved-item" key={`${item}-${index}`}>
                  <span>⚡</span>
                  {item}
                  <small>Draft</small>
                </div>
              ))}
            </div>
          )}

          {page === 'Website Builder' && (
            <div className="feature-card">
              <FeatureHeader icon="▣" title="Website Builder" />
              <p>Start a website project for your business.</p>

              <label>Business name</label>
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Enter your business name"
              />

              <label>Website type</label>
              <select
                value={websiteType}
                onChange={(event) => setWebsiteType(event.target.value)}
              >
                <option>Business website</option>
                <option>Online shop</option>
                <option>Portfolio</option>
                <option>Restaurant website</option>
                <option>Personal website</option>
              </select>

              <div className="website-offer">
                <span className="purple-label">NEED A WEBSITE?</span>
                <h3>Let's build your online presence.</h3>
                <p>
                  Contact us to discuss the cheapest available website package.
                </p>
                <a
                  className="whatsapp-btn"
                  href={whatsappLink(
                    `Hello! I want to build a website at your cheapest available price. Please send me your offer. My business name is ${
                      businessName || 'Not provided'
                    } and I need a ${websiteType}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp us for the cheapest price ↗
                </a>
              </div>
            </div>
          )}

          {page === 'WhatsApp' && (
            <div className="feature-card">
              <FeatureHeader icon="◉" title="WhatsApp connection" />
              <p>Let customers contact your business directly.</p>
              <a
                className="whatsapp-btn"
                href={whatsappLink(
                  'Hello! I would like to know more about LUNA AGENT.'
                )}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp DM ↗
              </a>
            </div>
          )}

          {page === 'Analytics' && (
            <div className="feature-card">
              <FeatureHeader icon="▥" title="Business analytics" />
              <p>
                Real customer, message, call and performance statistics will
                appear here after connecting the database and service providers.
              </p>
              <div className="stats-grid">
                <Stat
                  title="AI Agents"
                  value={agents.length.toString()}
                  icon="◈"
                />
                <Stat
                  title="Automations"
                  value={automations.length.toString()}
                  icon="⚡"
                />
                <Stat
                  title="Chat Messages"
                  value={messages.length.toString()}
                  icon="▤"
                />
                <Stat
                  title="Call Credits"
                  value={callCredits.toString()}
                  icon="☎"
                />
              </div>
            </div>
          )}

          {page === 'Subscriptions' && (
            <>
              <div className="feature-heading">
                <span className="purple-label">LUNA AGENT MEMBERSHIP</span>
                <h2>Choose your subscription</h2>
                <p>All packages include a 7-day free trial.</p>
              </div>

              <div className="region-selector">
                <div>
                  <strong>Choose your market</strong>
                  <small>
                    Prices change according to your selected region.
                  </small>
                </div>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value as Region)}
                >
                  <option value="kenya">Kenya — KSh</option>
                  <option value="international">Rest of the world — USD</option>
                </select>
              </div>

              <div className="plans">
                {plans.map((plan) => (
                  <div
                    className={`plan-card ${plan.popular ? 'featured' : ''}`}
                    key={plan.name}
                  >
                    {plan.popular && (
                      <span className="purple-label">MOST POPULAR</span>
                    )}
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      {currency}
                      {region === 'kenya' ? plan.kenya : plan.international}
                      <small>/month</small>
                    </div>
                    <p>7-day free trial</p>
                    <ul>
                      <li>{plan.agents}</li>
                      <li>{plan.replies}</li>
                      <li>{plan.automations}</li>
                      <li>{plan.websites}</li>
                      <li>AI Call Centre access</li>
                      <li>Incoming and outgoing calls</li>
                      <li>Prepaid call credits required</li>
                      <li>Business analytics</li>
                    </ul>
                    <button
                      className="primary-btn"
                      onClick={() => selectPlan(plan.name)}
                    >
                      Choose {plan.name}
                    </button>
                  </div>
                ))}
              </div>

              <p className="chat-note">
                Prices and limits are proposed. Payment, trial activation,
                subscription enforcement and billing still need backend setup.
                Provider-billed calls and messaging are charged separately.
              </p>
            </>
          )}

          {page === 'Call Credits' && (
            <div className="feature-card">
              <FeatureHeader icon="◷" title="Prepaid AI call credits" />
              <p>
                Buy credits before using AI calls. Your balance will be used for
                call charges according to the connected provider's rates.
              </p>

              <div className="call-credit-panel">
                <span className="purple-label">CURRENT DEMO BALANCE</span>
                <h2>
                  {currency}
                  {callCredits}
                </h2>
                <p>This is a local demo balance, not real purchased credit.</p>
              </div>

              <h3 className="section-title">CHOOSE A TOP-UP</h3>
              <div className="credit-options">
                {(region === 'kenya' ? [200, 500, 1000] : [2, 5, 10]).map(
                  (amount) => (
                    <button
                      className="credit-option"
                      key={amount}
                      onClick={() => chooseCredits(amount)}
                    >
                      <strong>
                        {currency}
                        {amount}
                      </strong>
                      <small>Call credit top-up</small>
                    </button>
                  )
                )}
              </div>

              <p className="chat-note">
                Top-ups are not active until a payment gateway and voice
                provider are connected. Actual call rates may vary.
              </p>
            </div>
          )}

          {page === 'Settings' && (
            <div className="feature-card">
              <FeatureHeader icon="⚙" title="Workspace settings" />

              <p>
                <strong>Workspace:</strong> LUNA AGENT
              </p>
              <p>
                <strong>Signed-in email:</strong> {session.user.email}
              </p>
              <p>
                <strong>WhatsApp:</strong> +{WHATSAPP_NUMBER}
              </p>
              <p>
                <strong>Free trial:</strong> 7 days
              </p>

              <p>
                <strong>Selected market:</strong>{' '}
                {region === 'kenya' ? 'Kenya (KSh)' : 'International (USD)'}
              </p>

              <div className="settings-logout">
                <h3>Account security</h3>
                <p>Sign out of your LUNA AGENT workspace.</p>
                <button className="logout-settings-btn" onClick={handleLogout}>
                  Log out of LUNA AGENT
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );
}

function FeatureHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="feature-header">
      <div className="feature-icon">{icon}</div>
      <h2>{title}</h2>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="feature-card">
      <FeatureHeader icon={icon} title={title} />
      <p>{description}</p>
    </div>
  );
}

export default App;
