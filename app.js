// LeakGuard SaaS Application Engine

// 1. Initial Mock Threat Intelligence Database
let threats = [
  {
    id: "TR-2026-049",
    date: "2026-06-20",
    actor: "LockBit 3.0",
    victim: "Medix Healthcare Group",
    sector: "Healthcare",
    country: "United States",
    riskScore: 92,
    confidence: 96,
    status: "Critical",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Exposed health records violating HIPAA standards. Potential ransomware extortion amount set to $4.2M. Class-action liability risk and severe reputation damage across 14 hospitals.",
    technicalImpact: "Active Directory domain controller compromised. Extraction of 250GB SQL databases containing patient PII, EHR systems schema, and administrator password hashes (NTLM).",
    actions: {
      immediate: "Isolate AD domain controllers and revoke active Kerberos TGT tickets. Deploy endpoint isolation policies to all hospital servers.",
      hours24: "Force global password reset for all administrative and user credentials. Notify local CISA and HHS cyber defense centers.",
      days7: "Perform comprehensive active directory audit, implement micro-segmentation for EHR networks, and rebuild domain trusts."
    },
    evidence: {
      source: "LockBit Ransomware Disclosure Blog (Tor Onion V3)",
      screenshot: "lockbit_evidence.png",
      extracted: `{"target_id": "MEDIX-HC-09", "dump_size_gb": 248.5, "sample_files": ["patient_billing_details_2025.csv", "admin_hashes.txt", "ehr_database_backup.sql"], "compromise_vector": "VPN exploit (CVE-2024-38472)"}`,
      summary: "AI-generated review: Leak identified on LockBit 3.0 onion repository. Critical matching signatures detected for database structure, medical record IDs, and employee directory records. Verification of file samples confirms active credentials hashes."
    }
  },
  {
    id: "TR-2026-048",
    date: "2026-06-19",
    actor: "Storm-0811",
    victim: "Apex Fintech Services",
    sector: "Finance",
    country: "United Kingdom",
    riskScore: 88,
    confidence: 90,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Risk of direct financial fraud, wire diversion, and regulatory penalty under FCA. Market capitalization could suffer if systemic trading leaks are revealed.",
    technicalImpact: "AWS access keys, API secrets, and financial ledger source code leaked via public GitHub repository containing hardcoded secrets.",
    actions: {
      immediate: "Rotate all AWS IAM credentials and revoke the compromised security access keys immediately.",
      hours24: "Audit cloud-trail logs for unauthorized infrastructure access or anomalous data extraction.",
      days7: "Implement automated secret scanning (TruffleHog) in CI/CD pipeline and transition to IAM Roles / AWS STS temporary tokens."
    },
    evidence: {
      source: "GitHub Public Leak Repository (User: apex-developer-temp)",
      screenshot: "github_leak.png",
      extracted: `AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nAWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\nSTRIPE_API_LIVE_KEY = "sk_live_51Nz..."`,
      summary: "AI-generated review: Source code leak detected containing functional live production API keys and cloud deployment credentials. Keys validated against AWS authorization responses."
    }
  },
  {
    id: "TR-2026-047",
    date: "2026-06-18",
    actor: "ShinyHunters",
    victim: "ShopSphere E-Commerce",
    sector: "Technology",
    country: "Canada",
    riskScore: 78,
    confidence: 85,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Loss of customer trust. Compliance investigations from PIPEDA. Cost of notification and credit monitoring for 1.2 million affected users.",
    technicalImpact: "Database dump containing customer profiles: Names, email addresses, phone numbers, salt-hashed passwords, and last 4 digits of cards.",
    actions: {
      immediate: "Send mandatory password reset notifications to all customers. Revoke database access privileges for the compromised service account.",
      hours24: "Verify if salt algorithms are sufficiently secure (bcrypt/scrypt) against cracking attempts.",
      days7: "Upgrade server infrastructure database protections and deploy web application firewall (WAF) to prevent SQL injections."
    },
    evidence: {
      source: "BreachForums Database Listing",
      screenshot: "breachforums_evidence.png",
      extracted: `{"record_count": 1200000, "fields": ["username", "email", "password_hash_bcrypt", "phone", "zipcode"], "price_credits": 250}`,
      summary: "AI-generated review: Database dump listing uploaded to cybercrime forum. Sample records verified matching valid emails and real geographical distributions."
    }
  },
  {
    id: "TR-2026-046",
    date: "2026-06-17",
    actor: "Volt Typhoon",
    victim: "Pacifica Grid Solutions",
    sector: "Energy",
    country: "United States",
    riskScore: 95,
    confidence: 88,
    status: "Critical",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: false
    },
    businessImpact: "Critical infrastructure disruption risks. Cyber-espionage operations targeting network layout coordinates and OT operational flow configurations.",
    technicalImpact: "Living-off-the-land techniques detected. Exfiltration of SCADA network topology maps, industrial router firmware, and remote maintenance logs.",
    actions: {
      immediate: "Terminate all active VPN connections from remote utility support zones. Enable mandatory multi-factor authentication (MFA).",
      hours24: "Conduct deep host forensics on utility jump servers. Look for unauthorized PowerShell or WMI queries.",
      days7: "Air-gap critical OT control networks from general IT business networks. Redesign operational control segment credentials."
    },
    evidence: {
      source: "CISA OSINT & Encrypted Telegram Channel Exfiltration Feed",
      screenshot: "scada_topology.png",
      extracted: `{"network_segment": "OT-ZONE-04", "scada_protocol": "DNP3", "target_ips": ["10.240.11.4", "10.240.12.18"], "firmware_version": "GE-MDS-v4.1.9"}`,
      summary: "AI-generated review: Detected indicators of compromise match Volt Typhoon signature. SCADA network maps shared on closed state-sponsored communication logs."
    }
  },
  {
    id: "TR-2026-045",
    date: "2026-06-16",
    actor: "Lazarus Group",
    victim: "BancGlobal International",
    sector: "Finance",
    country: "Singapore",
    riskScore: 91,
    confidence: 92,
    status: "Critical",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: true,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Systemic risk to transactional settlement channels. Immediate SEC/Regulatory disclosure required. Potential direct loss of cryptocurrency or fiat reserves.",
    technicalImpact: "SWIFT transfer system server implants. Exfiltration of transaction logging templates and database security configurations.",
    actions: {
      immediate: "Quarantine SWIFT network interface terminals. Perform forensic memory capture of active communication processes.",
      hours24: "Check for malicious service creations or binary replacements in windows/system32 paths.",
      days7: "Implement strict hardware-based security keys for transaction approvals. Conduct continuous network traffic inspection."
    },
    evidence: {
      source: "DarkWeb PasteBin & Threat Research Aggregator",
      screenshot: "swift_malware.png",
      extracted: `{"implant_hash": "2f40b2a8d568c7320b9ee23a492f16ef0a41d9c1db169fe5a109f0293bf6f3a1", "target_process": "swift_gate.exe"}`,
      summary: "AI-generated review: Verification of SWIFT transaction processor logs matching verified target. Code signature corresponds to Lazarus-linked remote access Trojans."
    }
  },
  {
    id: "TR-2026-044",
    date: "2026-06-15",
    actor: "Clop Ransomware",
    victim: "United Logistics Corp",
    sector: "Government",
    country: "Germany",
    riskScore: 72,
    confidence: 94,
    status: "Medium",
    verificationStatus: "Rejected Incident",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Potential supply chain disruption and delay in federal shipping contracts. Low impact as records were outdated archive folders from 2018.",
    technicalImpact: "Exfiltration of obsolete 2018 logistics schedules, public pricing structures, and legacy shipping records.",
    actions: {
      immediate: "Verify firewall configurations against CVE-2023-34362 (MOVEit Transfer vulnerability) patches.",
      hours24: "Confirm the data belongs strictly to historical legacy servers with no live connection to active logistics systems.",
      days7: "Audit data retention policies and permanently delete orphaned databases and archives."
    },
    evidence: {
      source: "Clop '_MOVEit Leak' Portal",
      screenshot: "clop_evidence.png",
      extracted: `{"dump_archive": "UNITED_LOGISTICS_2018_ARCHIVE.tar.gz", "size_mb": 1420}`,
      summary: "AI-generated review: Ransomware claim published. Analysis of files reveals that all data is historical (2018) and lacks active, confidential credentials or operational data."
    }
  },
  {
    id: "TR-2026-043",
    date: "2026-06-14",
    actor: "Unknown Hacktivist",
    victim: "EduCloud Learning Platform",
    sector: "Technology",
    country: "Australia",
    riskScore: 45,
    confidence: 72,
    status: "Low",
    verificationStatus: "Pending Review",
    whyCritical: {
      credentialsExposed: false,
      financialRecordsAffected: false,
      knownRansomwareActor: false,
      publicEvidenceAvailable: true
    },
    businessImpact: "Minimal financial impact. Minor public relations embarrassment due to platform defacement threat.",
    technicalImpact: "Defacement scripts targeting marketing subdomains, database schema details leaked but no patient or student record data accessible.",
    actions: {
      immediate: "Restore marketing landing page from clean repository backup. Close port 22 open on public IP.",
      hours24: "Perform vulnerability scan on front-end servers to identify CMS plug-in exploits.",
      days7: "Move public WordPress files onto static AWS S3 buckets to reduce target vulnerability area."
    },
    evidence: {
      source: "Twitter Disclosure Link",
      screenshot: "twitter_defacement.png",
      extracted: `{"defaced_subdomain": "blog.educloud.edu.au", "defacer_signature": "AnonSec_2026"}`,
      summary: "AI-generated review: Public post claiming breach. Verification confirms target subdomain displayed custom hacker logo, indicating superficial system modifications."
    }
  },
  {
    id: "TR-2026-042",
    date: "2026-06-13",
    actor: "ALPHV BlackCat",
    victim: "CareFirst Clinical Lab",
    sector: "Healthcare",
    country: "United Kingdom",
    riskScore: 84,
    confidence: 89,
    status: "High",
    verificationStatus: "Verified",
    whyCritical: {
      credentialsExposed: true,
      financialRecordsAffected: false,
      knownRansomwareActor: true,
      publicEvidenceAvailable: true
    },
    businessImpact: "Severe HIPAA/GDPR penalty danger. Lab operational delays affecting emergency diagnosis timelines.",
    technicalImpact: "Compromised Citrix gateway credentials. Extracted 80GB of patient blood sample panels and employee directories.",
    actions: {
      immediate: "Deactivate the compromised Citrix user accounts. Block indicators of compromise (IPs, file hashes) in EDR platform.",
      hours24: "Implement patch updates on Citrix ADC infrastructure to protect against remote code execution.",
      days7: "Enforce multi-factor authentication for external portal users and restrict API query ranges."
    },
    evidence: {
      source: "ALPHV Onion Leak Site",
      screenshot: "alphv_evidence.png",
      extracted: `{"file_list": ["patient_lab_results_2026_Q1.xlsx", "staff_schedules.pdf", "lab_citrix_creds.txt"]}`,
      summary: "AI-generated review: Breach posted on ALPHV ransomware blog. Verified sample data includes active clinic patient names, test profiles, and internal contact information."
    }
  }
];

// 2. Audit Log Records
let audits = [
  {
    timestamp: "2026-06-20 14:30",
    analyst: "Maria Lopez",
    action: "Verified",
    reason: "Evidence contains valid corporate emails and internal documents confirming breach of Apex Fintech Services."
  },
  {
    timestamp: "2026-06-19 09:15",
    analyst: "Alex Chen",
    action: "Verified",
    reason: "GitHub leak repository confirmed hosting active AWS keys. Secret keys rotated by victim since notification."
  },
  {
    timestamp: "2026-06-18 16:45",
    analyst: "Sarah Jenkins",
    action: "Rejected",
    reason: "MOVEit leak files for United Logistics contain strictly public pricing datasheets dated from 2018."
  }
];

// 3. User Profile and Notifications
const activeAnalyst = {
  name: "Maria Lopez",
  role: "Lead Threat Intelligence Analyst",
  clearance: "L3 Admin Access",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
};

let notifications = [
  { id: 1, text: "New threat alert: LockBit 3.0 posted Medix Healthcare", time: "5m ago", unread: true },
  { id: 2, text: "Volt Typhoon critical intelligence report ingested", time: "1h ago", unread: true },
  { id: 3, text: "Exposure check completed for acme.corp", time: "3h ago", unread: false }
];

// 4. Chart References (for destruction on updates)
let chartInstances = {};

// 5. Global State
let currentTab = "landing";
let selectedThreat = threats[0];
let scanLogInterval = null;

// 6. Router and View Control
function navigateTo(tabId, threatId = null) {
  currentTab = tabId;
  
  // Hide all view screens
  document.querySelectorAll('.view-screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('page-fade-in');
  });

  // Handle active page styling in Sidebar
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('bg-slate-800/80', 'text-cyan-400', 'border-l-2', 'border-cyan-400');
      item.classList.remove('text-slate-400', 'hover:bg-slate-900/50', 'hover:text-slate-200');
    } else {
      item.classList.remove('bg-slate-800/80', 'text-cyan-400', 'border-l-2', 'border-cyan-400');
      item.classList.add('text-slate-400', 'hover:bg-slate-900/50', 'hover:text-slate-200');
    }
  });

  // If entering App Shell
  if (tabId === 'landing') {
    document.getElementById('landing-view').classList.remove('hidden');
    document.getElementById('landing-view').classList.add('page-fade-in');
    document.getElementById('app-shell').classList.add('hidden');
    return;
  } else {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
  }

  // Populate dynamic views
  if (tabId === 'dashboard') {
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('page-fade-in');
    renderDashboard();
  } else if (tabId === 'threat-details') {
    document.getElementById('threat-details-view').classList.remove('hidden');
    document.getElementById('threat-details-view').classList.add('page-fade-in');
    if (threatId) {
      selectedThreat = threats.find(t => t.id === threatId) || threats[0];
    }
    renderThreatDetails();
  } else if (tabId === 'exposure-check') {
    document.getElementById('exposure-check-view').classList.remove('hidden');
    document.getElementById('exposure-check-view').classList.add('page-fade-in');
    // Keep or reset scanning screen
  } else if (tabId === 'admin-panel') {
    document.getElementById('admin-panel-view').classList.remove('hidden');
    document.getElementById('admin-panel-view').classList.add('page-fade-in');
    renderAdminPanel();
  } else if (tabId === 'ai-safety') {
    document.getElementById('ai-safety-view').classList.remove('hidden');
    document.getElementById('ai-safety-view').classList.add('page-fade-in');
    renderAISafety();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 7. Initialize Chart.js Elements
function updateCharts() {
  // Chart 1: Threat Activity Over Time
  const ctxActivity = document.getElementById('chart-activity');
  if (ctxActivity) {
    if (chartInstances.activity) chartInstances.activity.destroy();
    
    // Aggregate threats by date
    const dates = ["06-14", "06-15", "06-16", "06-17", "06-18", "06-19", "06-20"];
    const counts = [1, 2, 1, 3, 2, 4, 3]; // mock data corresponding to dates
    
    chartInstances.activity = new Chart(ctxActivity, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ingested Threats',
          data: counts,
          borderColor: '#22d3ee', // Cyan
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  // Chart 2: Risk Distribution
  const ctxRisk = document.getElementById('chart-risk');
  if (ctxRisk) {
    if (chartInstances.risk) chartInstances.risk.destroy();
    
    // Count status values
    const critical = threats.filter(t => t.status === "Critical").length;
    const high = threats.filter(t => t.status === "High").length;
    const medium = threats.filter(t => t.status === "Medium").length;
    const low = threats.filter(t => t.status === "Low").length;

    chartInstances.risk = new Chart(ctxRisk, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          data: [critical, high, medium, low],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        }
      }
    });
  }

  // Chart 3: Sector Distribution
  const ctxSector = document.getElementById('chart-sector');
  if (ctxSector) {
    if (chartInstances.sector) chartInstances.sector.destroy();
    
    const sectors = ['Healthcare', 'Finance', 'Technology', 'Energy', 'Government'];
    const sectorCounts = sectors.map(sec => threats.filter(t => t.sector === sec).length);

    chartInstances.sector = new Chart(ctxSector, {
      type: 'bar',
      data: {
        labels: sectors,
        datasets: [{
          label: 'Alerts',
          data: sectorCounts,
          backgroundColor: 'rgba(168, 85, 247, 0.65)', // Purple
          borderColor: '#a855f7',
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', stepSize: 1 } }
        }
      }
    });
  }

  // Chart 4: Verification Status Distribution
  const ctxStatus = document.getElementById('chart-status');
  if (ctxStatus) {
    if (chartInstances.status) chartInstances.status.destroy();
    
    const verified = threats.filter(t => t.verificationStatus === "Verified").length;
    const pending = threats.filter(t => t.verificationStatus === "Pending Review").length;
    const rejected = threats.filter(t => t.verificationStatus === "Rejected Incident").length;

    chartInstances.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Verified', 'Pending', 'Rejected'],
        datasets: [{
          data: [verified, pending, rejected],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 } }
          }
        }
      }
    });
  }
}

// 8. Render Views
function renderDashboard() {
  // Update KPI calculations
  const todayCount = threats.filter(t => t.date === "2026-06-20").length;
  const criticalAlerts = threats.filter(t => t.status === "Critical").length;
  const verifiedLeaks = threats.filter(t => t.verificationStatus === "Verified").length;
  const pendingReviews = threats.filter(t => t.verificationStatus === "Pending Review").length;
  
  // Calculate unique threat actors and sectors
  const actors = new Set(threats.map(t => t.actor)).size;
  const sectors = new Set(threats.map(t => t.sector)).size;

  document.getElementById('kpi-threats-today').innerText = todayCount;
  document.getElementById('kpi-critical').innerText = criticalAlerts;
  document.getElementById('kpi-verified').innerText = verifiedLeaks;
  document.getElementById('kpi-pending').innerText = pendingReviews;
  document.getElementById('kpi-actors').innerText = actors;
  document.getElementById('kpi-sectors').innerText = sectors;

  // Build Threat Feed Table Rows
  const tableBody = document.getElementById('threat-feed-tbody');
  tableBody.innerHTML = "";

  threats.forEach(t => {
    // Risk badges
    let riskBadge = "";
    if (t.status === "Critical") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/60">${t.status}</span>`;
    else if (t.status === "High") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-800/60">${t.status}</span>`;
    else if (t.status === "Medium") riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/80 text-yellow-400 border border-yellow-800/60">${t.status}</span>`;
    else riskBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-950/80 text-green-400 border border-green-800/60">${t.status}</span>`;

    // Verification Badges
    let verifyBadge = "";
    if (t.verificationStatus === "Verified") verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-green-950/80 text-green-400 border border-green-800/60">Verified</span>`;
    else if (t.verificationStatus === "Pending Review") verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-yellow-950/80 text-yellow-400 border border-yellow-800/60">Pending Review</span>`;
    else verifyBadge = `<span class="px-2 py-0.5 rounded text-xs font-medium bg-red-950/80 text-red-400 border border-red-800/60">Rejected</span>`;

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/60 cursor-pointer border-b border-slate-800/50 transition-colors";
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">${t.date}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200">${t.actor}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${t.victim}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">${t.sector}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-center font-mono" style="color: ${t.riskScore > 85 ? '#ef4444' : t.riskScore > 70 ? '#f97316' : '#eab308'}">${t.riskScore}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-center font-mono">${t.confidence}%</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${riskBadge}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${verifyBadge}</td>
    `;
    
    // Add Click listener
    tr.addEventListener('click', () => {
      navigateTo('threat-details', t.id);
    });

    tableBody.appendChild(tr);
  });

  // Force chart update
  updateCharts();
}

function renderThreatDetails() {
  const t = selectedThreat;
  if (!t) return;

  // Set general details
  document.getElementById('detail-id').innerText = t.id;
  document.getElementById('detail-title-actor').innerText = t.actor;
  document.getElementById('detail-title-victim').innerText = t.victim;
  document.getElementById('detail-actor').innerText = t.actor;
  document.getElementById('detail-victim').innerText = t.victim;
  document.getElementById('detail-sector').innerText = t.sector;
  document.getElementById('detail-country').innerText = t.country;
  document.getElementById('detail-date').innerText = t.date;

  // Scores
  document.getElementById('detail-risk-score').innerText = t.riskScore;
  document.getElementById('detail-confidence-score').innerText = t.confidence;
  
  // Custom styled gauges
  const riskCircle = document.getElementById('detail-risk-gauge');
  const confCircle = document.getElementById('detail-confidence-gauge');
  if (riskCircle) riskCircle.style.width = `${t.riskScore}%`;
  if (confCircle) confCircle.style.width = `${t.confidence}%`;

  // Checklist
  document.getElementById('chk-creds').innerHTML = t.whyCritical.credentialsExposed ? '✓' : '✗';
  document.getElementById('chk-creds').className = t.whyCritical.credentialsExposed ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-financial').innerHTML = t.whyCritical.financialRecordsAffected ? '✓' : '✗';
  document.getElementById('chk-financial').className = t.whyCritical.financialRecordsAffected ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-actor').innerHTML = t.whyCritical.knownRansomwareActor ? '✓' : '✗';
  document.getElementById('chk-actor').className = t.whyCritical.knownRansomwareActor ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';
  document.getElementById('chk-evidence').innerHTML = t.whyCritical.publicEvidenceAvailable ? '✓' : '✗';
  document.getElementById('chk-evidence').className = t.whyCritical.publicEvidenceAvailable ? 'text-green-400 font-bold mr-2' : 'text-slate-600 font-bold mr-2';

  // Impacts and actions
  document.getElementById('detail-business-impact').innerText = t.businessImpact;
  document.getElementById('detail-technical-impact').innerText = t.technicalImpact;
  document.getElementById('detail-action-immediate').innerText = t.actions.immediate;
  document.getElementById('detail-action-24h').innerText = t.actions.hours24;
  document.getElementById('detail-action-7d').innerText = t.actions.days7;

  // Evidence
  document.getElementById('detail-evidence-source').innerText = t.evidence.source;
  document.getElementById('detail-evidence-extracted').innerText = t.evidence.extracted;
  document.getElementById('detail-evidence-summary').innerText = t.evidence.summary;

  // Dynamic SVG preview instead of missing image
  const svgWrapper = document.getElementById('detail-screenshot-svg');
  if (svgWrapper) {
    svgWrapper.innerHTML = `
      <svg viewBox="0 0 400 200" class="w-full h-full text-slate-800" fill="currentColor">
        <rect width="400" height="200" fill="#090d16" rx="4"></rect>
        <g stroke="#1e293b" stroke-width="1">
          <line x1="0" y1="40" x2="400" y2="40"></line>
          <line x1="0" y1="80" x2="400" y2="80"></line>
          <line x1="0" y1="120" x2="400" y2="120"></line>
          <line x1="0" y1="160" x2="400" y2="160"></line>
          <line x1="80" y1="0" x2="80" y2="200"></line>
          <line x1="160" y1="0" x2="160" y2="200"></line>
          <line x1="240" y1="0" x2="240" y2="200"></line>
          <line x1="320" y1="0" x2="320" y2="200"></line>
        </g>
        <text x="20" y="25" fill="#22d3ee" font-family="monospace" font-size="10">EVIDENCE SOURCE LOGGER [ID: ${t.id}]</text>
        <text x="20" y="65" fill="#f87171" font-family="monospace" font-size="10">> DETECTED KEYWORDS: "EXFILTRATED_DATA", "PASSWORDS_DUMP"</text>
        <text x="20" y="105" fill="#a78bfa" font-family="monospace" font-size="10">> COMPROMISE TIMESTAMP: ${t.date} 08:34:11 GMT</text>
        <text x="20" y="145" fill="#94a3b8" font-family="monospace" font-size="10">> RAW PARSING MATCH: 100% RELIABLE MATCH</text>
        <rect x="260" y="50" width="110" height="110" fill="rgba(34, 211, 238, 0.05)" stroke="#22d3ee" stroke-width="1" rx="4"></rect>
        <circle cx="315" cy="105" r="30" fill="none" stroke="#a855f7" stroke-width="2" class="animate-pulse"></circle>
        <text x="295" y="150" fill="#a855f7" font-family="monospace" font-size="8">BREACH NODE MAP</text>
      </svg>
    `;
  }

  // Banner Verification Status
  const banner = document.getElementById('detail-status-banner');
  banner.innerHTML = "";
  if (t.verificationStatus === "Verified") {
    banner.className = "p-4 rounded-lg bg-green-950/80 border border-green-800/80 text-green-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-semibold">Verified by LeakGuard Analyst:</span> Incident confirmed active threat status. Mitigations enforced.`;
  } else if (t.verificationStatus === "Pending Review") {
    banner.className = "p-4 rounded-lg bg-yellow-950/80 border border-yellow-800/80 text-yellow-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> <span class="font-semibold">Pending Human Review:</span> Ingestion completed. Awaiting analyst audit validation.`;
  } else {
    banner.className = "p-4 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400 flex items-center gap-2";
    banner.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-semibold">Rejected Incident:</span> Analyst reviewed and marked as false positive or non-critical legacy information.`;
  }
}

// Global active selection in Admin Queue
let adminActiveId = "";

function renderAdminPanel() {
  const pendingReviews = threats.filter(t => t.verificationStatus === "Pending Review");
  
  // KPI stats
  document.getElementById('admin-kpi-pending').innerText = pendingReviews.length;
  document.getElementById('admin-kpi-verified').innerText = threats.filter(t => t.verificationStatus === "Verified").length;
  document.getElementById('admin-kpi-rejected').innerText = threats.filter(t => t.verificationStatus === "Rejected Incident").length;
  
  // Queue Table
  const tbody = document.getElementById('admin-queue-tbody');
  tbody.innerHTML = "";
  
  const allIncidentsForAdmin = threats; // we show all for convenience, sorting pending first
  const sortedIncidents = [...allIncidentsForAdmin].sort((a, b) => {
    if (a.verificationStatus === "Pending Review" && b.verificationStatus !== "Pending Review") return -1;
    if (a.verificationStatus !== "Pending Review" && b.verificationStatus === "Pending Review") return 1;
    return 0;
  });

  sortedIncidents.forEach(t => {
    let statBadge = "";
    if (t.verificationStatus === "Verified") {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-950/50 text-green-400 border border-green-800/40">Verified</span>`;
    } else if (t.verificationStatus === "Pending Review") {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/50 text-yellow-400 border border-yellow-800/40 animate-pulse">Pending</span>`;
    } else {
      statBadge = `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/50 text-red-400 border border-red-800/40">Rejected</span>`;
    }

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-900/60 cursor-pointer border-b border-slate-800/50 transition-colors ${adminActiveId === t.id ? 'bg-slate-800/40 border-l-2 border-cyan-400' : ''}`;
    tr.innerHTML = `
      <td class="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-mono">${t.id}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs text-slate-300 font-semibold">${t.victim}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs font-bold font-mono text-cyan-400 text-center">${t.riskScore}</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-400 text-center">${t.confidence}%</td>
      <td class="px-4 py-3 whitespace-nowrap text-xs text-center">${statBadge}</td>
    `;
    
    tr.addEventListener('click', () => {
      adminActiveId = t.id;
      renderAdminPanel(); // re-render layout to show active border highlight
      loadAdminEvidenceViewer(t.id);
    });

    tbody.appendChild(tr);
  });

  // Pre-load the first incident if none selected
  if (!adminActiveId && sortedIncidents.length > 0) {
    adminActiveId = sortedIncidents[0].id;
    loadAdminEvidenceViewer(adminActiveId);
  } else if (adminActiveId) {
    loadAdminEvidenceViewer(adminActiveId);
  }

  // Audit Logs
  const auditTbody = document.getElementById('admin-audit-tbody');
  auditTbody.innerHTML = "";
  audits.forEach(a => {
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/30 text-xs text-slate-400";
    tr.innerHTML = `
      <td class="px-4 py-2 font-mono whitespace-nowrap">${a.timestamp}</td>
      <td class="px-4 py-2 font-medium text-slate-300">${a.analyst}</td>
      <td class="px-4 py-2 font-semibold ${a.action === 'Verified' ? 'text-green-400' : 'text-red-400'}">${a.action}</td>
      <td class="px-4 py-2 italic max-w-xs truncate" title="${a.reason}">${a.reason}</td>
    `;
    auditTbody.appendChild(tr);
  });
}

function loadAdminEvidenceViewer(threatId) {
  const t = threats.find(x => x.id === threatId);
  if (!t) return;

  document.getElementById('admin-ev-id').innerText = t.id;
  document.getElementById('admin-ev-victim').innerText = t.victim;
  document.getElementById('admin-ev-source').innerText = t.evidence.source;
  document.getElementById('admin-ev-extracted').innerText = t.evidence.extracted;
  document.getElementById('admin-ev-summary').innerText = t.evidence.summary;
  document.getElementById('admin-ev-risk').innerText = `${t.riskScore}/100`;
  document.getElementById('admin-ev-conf').innerText = `${t.confidence}%`;
  
  // Set default placeholder for reason
  document.getElementById('admin-verification-reason').value = "";

  // Dynamic review controls enable/disable depending on whether it is already resolved
  const actionContainer = document.getElementById('admin-actions-div');
  if (t.verificationStatus !== "Pending Review") {
    actionContainer.innerHTML = `
      <div class="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-center text-xs text-slate-400">
        This incident was audited and marked as <span class="font-bold text-cyan-400">${t.verificationStatus}</span>. Form submission disabled.
      </div>
    `;
  } else {
    actionContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-2">
        <button type="button" onclick="adminAuditAction('Verified')" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-semibold rounded text-xs">Verify Leak</button>
        <button type="button" onclick="adminAuditAction('Rejected Incident')" class="px-3 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-semibold rounded text-xs">Reject Leak</button>
        <button type="button" onclick="adminAuditAction('Request Evidence')" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-slate-200 font-semibold rounded text-xs">Request Info</button>
      </div>
    `;
  }
}

function adminAuditAction(actionState) {
  const reasonText = document.getElementById('admin-verification-reason').value.trim();
  if (!reasonText) {
    showToast("Please enter a validation rationale or reason.", "error");
    return;
  }

  // Find incident
  const incidentIdx = threats.findIndex(t => t.id === adminActiveId);
  if (incidentIdx === -1) return;

  // Update Status
  let actionLogged = "Verified";
  if (actionState === "Verified") {
    threats[incidentIdx].verificationStatus = "Verified";
    actionLogged = "Verified";
  } else if (actionState === "Rejected Incident") {
    threats[incidentIdx].verificationStatus = "Rejected Incident";
    actionLogged = "Rejected";
  } else {
    threats[incidentIdx].verificationStatus = "Pending Review";
    actionLogged = "Info Requested";
  }

  // Create audit log entry
  const now = new Date();
  const formatTime = now.getFullYear() + "-" + 
                     String(now.getMonth()+1).padStart(2, '0') + "-" + 
                     String(now.getDate()).padStart(2, '0') + " " + 
                     String(now.getHours()).padStart(2, '0') + ":" + 
                     String(now.getMinutes()).padStart(2, '0');

  const newAudit = {
    timestamp: formatTime,
    analyst: activeAnalyst.name,
    action: actionLogged,
    reason: reasonText
  };

  audits.unshift(newAudit); // add to top
  
  // Show notification
  showToast(`Incident ${adminActiveId} audited successfully as: ${actionLogged}`, "success");

  // Re-render
  renderAdminPanel();
  
  // Add dynamic notification
  notifications.unshift({
    id: Date.now(),
    text: `Incident ${adminActiveId} verification updated by ${activeAnalyst.name}`,
    time: "Just now",
    unread: true
  });
  renderNotifications();
}

function renderAISafety() {
  // Aggregate accuracy metrics
  const verified = threats.filter(t => t.verificationStatus === "Verified").length;
  const rejected = threats.filter(t => t.verificationStatus === "Rejected Incident").length;
  const totalAudited = verified + rejected;

  // False positive calculation (how many rejected out of audited)
  const fpRate = totalAudited > 0 ? ((rejected / totalAudited) * 100).toFixed(1) : "0.0";
  const verificationRate = threats.length > 0 ? (((threats.length - threats.filter(t => t.verificationStatus === "Pending Review").length) / threats.length) * 100).toFixed(1) : "0.0";

  document.getElementById('safety-verification-rate').innerText = `${verificationRate}%`;
  document.getElementById('safety-false-positive').innerText = `${fpRate}%`;
  
  // Average confidence calculations
  const avgConf = (threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length).toFixed(1);
  document.getElementById('safety-avg-confidence').innerText = `${avgConf}%`;
}

// 9. Exposure Checker Scanner Simulator
function runExposureCheck() {
  const domainInput = document.getElementById('exposure-domain-input').value.trim();
  if (!domainInput) {
    showToast("Please enter a valid domain to analyze.", "error");
    return;
  }

  const logConsole = document.getElementById('exposure-scan-log');
  const resultsCard = document.getElementById('exposure-results');
  
  // Clear previous outputs
  logConsole.innerHTML = "";
  logConsole.classList.remove('hidden');
  resultsCard.classList.add('hidden');

  const logLines = [
    `Initializing threat vulnerability analysis sequence for: ${domainInput}`,
    `[+] Resolving DNS records, MX routing, and TLS certificate bindings...`,
    `[+] Querying Dark Web forums and Telegram channel databases for keyword matches...`,
    `[+] Fetching ransomware leak sites metadata directories...`,
    `[+] Auditing OSINT credentials dumps matching email structures: *@${domainInput}...`,
    `[+] Evaluating cloud access policies and public-facing storage exposures...`,
    `[+] Running AI Risk Synthesis Model (Ver. 4.2.1)...`,
    `Analysis Complete. Displaying structured intelligence report.`
  ];

  let lineIndex = 0;
  
  if (scanLogInterval) clearInterval(scanLogInterval);

  scanLogInterval = setInterval(() => {
    if (lineIndex < logLines.length) {
      const p = document.createElement('p');
      p.className = "text-xs font-mono mb-1 " + (lineIndex === logLines.length - 1 ? 'text-green-400 font-bold' : 'text-slate-400');
      p.innerText = `[${new Date().toLocaleTimeString()}] ${logLines[lineIndex]}`;
      logConsole.appendChild(p);
      logConsole.scrollTop = logConsole.scrollHeight;
      lineIndex++;
    } else {
      clearInterval(scanLogInterval);
      
      // Calculate exposure results based on domain string (deterministic mock data)
      let score = 32; // Default low risk
      if (domainInput.includes('acme') || domainInput.includes('medix')) score = 84;
      else if (domainInput.includes('fintech') || domainInput.includes('bank')) score = 76;
      else if (domainInput.includes('hooli') || domainInput.includes('cyber')) score = 58;

      let trend = "Rising Threat Activity";
      let trendColor = "text-red-400";
      if (score < 40) {
        trend = "Stable Security Perimeter";
        trendColor = "text-green-400";
      }

      document.getElementById('exp-res-domain').innerText = domainInput;
      document.getElementById('exp-res-score').innerText = score;
      document.getElementById('exp-res-score').style.color = score > 80 ? '#ef4444' : score > 50 ? '#f97316' : '#22c55e';
      document.getElementById('exp-res-trend').innerText = trend;
      document.getElementById('exp-res-trend').className = `text-sm font-semibold ${trendColor}`;
      document.getElementById('exp-res-lastseen').innerText = score > 50 ? "Leak spotted 24 hours ago" : "No leaks detected in last 90 days";

      // Insert domain specific details
      const tableIncidents = document.getElementById('exp-incidents-tbody');
      tableIncidents.innerHTML = "";
      if (score > 50) {
        tableIncidents.innerHTML = `
          <tr class="border-b border-slate-800/50">
            <td class="px-4 py-2 font-mono text-xs text-slate-400">2026-06-20</td>
            <td class="px-4 py-2 text-xs font-semibold text-slate-200">Credential Leak Pack v4</td>
            <td class="px-4 py-2 text-xs text-red-400 font-bold">Critical</td>
            <td class="px-4 py-2 text-xs text-slate-400">12 employee email/password plaintext exposed</td>
          </tr>
          <tr>
            <td class="px-4 py-2 font-mono text-xs text-slate-400">2026-05-12</td>
            <td class="px-4 py-2 text-xs font-semibold text-slate-200">GitHub API Leak</td>
            <td class="px-4 py-2 text-xs text-orange-400 font-bold">High</td>
            <td class="px-4 py-2 text-xs text-slate-400">Internal source code uploaded by vendor</td>
          </tr>
        `;
      } else {
        tableIncidents.innerHTML = `
          <tr>
            <td colspan="4" class="px-4 py-8 text-center text-xs text-slate-500">No compromised archives found. Domain status clear.</td>
          </tr>
        `;
      }

      resultsCard.classList.remove('hidden');
      resultsCard.classList.add('page-fade-in');
      
      // Load small trend line chart
      const ctxTrend = document.getElementById('chart-exposure-trend');
      if (ctxTrend) {
        if (chartInstances.exposureTrend) chartInstances.exposureTrend.destroy();
        chartInstances.exposureTrend = new Chart(ctxTrend, {
          type: 'line',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Current'],
            datasets: [{
              label: 'Risk Trend',
              data: score > 50 ? [20, 35, 68, 55, score] : [10, 15, 12, 24, score],
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.05)',
              borderWidth: 1.5,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: { display: false }
            }
          }
        });
      }
    }
  }, 450);
}

// 10. Global Search Event Handler
function executeGlobalSearch() {
  const query = document.getElementById('global-search').value.toLowerCase().trim();
  const searchResultsDiv = document.getElementById('search-dropdown');

  if (!query) {
    searchResultsDiv.classList.add('hidden');
    return;
  }

  // Filter threats
  const filtered = threats.filter(t => 
    t.actor.toLowerCase().includes(query) || 
    t.victim.toLowerCase().includes(query) || 
    t.sector.toLowerCase().includes(query) || 
    t.id.toLowerCase().includes(query)
  );

  searchResultsDiv.innerHTML = "";
  if (filtered.length > 0) {
    filtered.forEach(f => {
      const d = document.createElement('div');
      d.className = "p-2 hover:bg-slate-800 text-xs cursor-pointer flex justify-between items-center text-slate-300 border-b border-slate-800/50";
      d.innerHTML = `
        <div>
          <span class="font-semibold text-slate-100">${f.actor}</span> <span class="text-slate-500">-></span> ${f.victim}
        </div>
        <span class="text-[10px] font-mono px-1 rounded bg-slate-900 text-cyan-400">${f.status}</span>
      `;
      d.addEventListener('click', () => {
        navigateTo('threat-details', f.id);
        document.getElementById('global-search').value = "";
        searchResultsDiv.classList.add('hidden');
      });
      searchResultsDiv.appendChild(d);
    });
    searchResultsDiv.classList.remove('hidden');
  } else {
    searchResultsDiv.innerHTML = `<div class="p-3 text-center text-xs text-slate-500">No threat match found</div>`;
    searchResultsDiv.classList.remove('hidden');
  }
}

// 11. Notification Dropdown Toggle
function toggleNotificationCenter() {
  const div = document.getElementById('notification-dropdown-menu');
  div.classList.toggle('hidden');
}

function renderNotifications() {
  const badge = document.getElementById('notification-badge');
  const count = notifications.filter(n => n.unread).length;
  
  if (count > 0) {
    badge.innerText = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  const wrapper = document.getElementById('notifications-list-container');
  wrapper.innerHTML = "";
  notifications.forEach(n => {
    const item = document.createElement('div');
    item.className = `p-3 text-xs border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors ${n.unread ? 'bg-slate-900/30' : ''}`;
    item.innerHTML = `
      <div class="flex justify-between items-start mb-1">
        <span class="font-medium text-slate-200">${n.text}</span>
        <span class="text-[10px] text-slate-500 whitespace-nowrap">${n.time}</span>
      </div>
    `;
    // Click mark read
    item.addEventListener('click', () => {
      n.unread = false;
      renderNotifications();
    });
    wrapper.appendChild(item);
  });
}

// 12. Toast Feedback Generator
function showToast(message, type = "success") {
  const wrapper = document.getElementById('toast-wrapper');
  const toast = document.createElement('div');
  
  let typeClasses = "bg-slate-900 border-emerald-500/50 text-emerald-400 glow-cyan";
  if (type === "error") {
    typeClasses = "bg-slate-900 border-red-500/50 text-red-400 glow-red";
  }

  toast.className = `flex items-center gap-3 p-4 rounded-lg border shadow-lg text-sm max-w-sm ${typeClasses} page-fade-in`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <div class="font-medium">${message}</div>
  `;

  wrapper.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Close Dropdowns on Click Outside
document.addEventListener('click', (e) => {
  const searchInput = document.getElementById('global-search');
  const searchDropdown = document.getElementById('search-dropdown');
  if (searchInput && searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
    searchDropdown.classList.add('hidden');
  }

  const notificationBtn = document.getElementById('notification-bell-btn');
  const notificationMenu = document.getElementById('notification-dropdown-menu');
  if (notificationBtn && notificationMenu && !notificationBtn.contains(e.target) && !notificationMenu.contains(e.target)) {
    notificationMenu.classList.add('hidden');
  }
});

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  renderNotifications();
  // Set analyst info
  document.getElementById('analyst-profile-name').innerText = activeAnalyst.name;
  document.getElementById('analyst-profile-role').innerText = activeAnalyst.role;
  document.getElementById('analyst-avatar-img').src = activeAnalyst.avatar;
});
