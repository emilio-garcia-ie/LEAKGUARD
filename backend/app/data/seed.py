from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.models.incident import Incident

THREATS = [
    {
        "id": "TR-2026-049",
        "date": "2026-06-20",
        "actor": "LockBit 3.0",
        "victim": "Medix Healthcare Group",
        "sector": "Healthcare",
        "country": "United States",
        "riskScore": 92,
        "confidence": 96,
        "status": "Critical",
        "verificationStatus": "Pending Review",
        "whyCritical": {"credentialsExposed": True, "financialRecordsAffected": True, "knownRansomwareActor": True, "publicEvidenceAvailable": True},
        "businessImpact": "Exposed health records violating HIPAA standards. Potential ransomware extortion amount set to $4.2M.",
        "technicalImpact": "Active Directory domain controller compromised. Extraction of 250GB SQL databases containing patient PII.",
        "actions": {"immediate": "Isolate AD domain controllers.", "hours24": "Force global password reset.", "days7": "Perform comprehensive AD audit."},
        "evidence": {"source": "LockBit Ransomware Disclosure Blog", "extracted": "patient_billing_details_2025.csv", "summary": "Critical matching signatures detected."},
    },
    {
        "id": "TR-2026-048",
        "date": "2026-06-19",
        "actor": "Storm-0811",
        "victim": "Apex Fintech Services",
        "sector": "Finance",
        "country": "United Kingdom",
        "riskScore": 88,
        "confidence": 90,
        "status": "High",
        "verificationStatus": "Verified",
        "whyCritical": {"credentialsExposed": True, "financialRecordsAffected": True, "knownRansomwareActor": False, "publicEvidenceAvailable": True},
        "businessImpact": "Risk of direct financial fraud and regulatory penalty under FCA.",
        "technicalImpact": "AWS access keys and API secrets leaked via public GitHub repository.",
        "actions": {"immediate": "Rotate all AWS IAM credentials.", "hours24": "Audit cloud-trail logs.", "days7": "Implement secret scanning in CI/CD."},
        "evidence": {"source": "GitHub Public Leak Repository", "extracted": "AWS keys validated", "summary": "Live production API keys confirmed."},
    },
    {
        "id": "TR-2026-047",
        "date": "2026-06-18",
        "actor": "ShinyHunters",
        "victim": "ShopSphere E-Commerce",
        "sector": "Technology",
        "country": "Canada",
        "riskScore": 78,
        "confidence": 85,
        "status": "High",
        "verificationStatus": "Verified",
        "whyCritical": {"credentialsExposed": True, "financialRecordsAffected": False, "knownRansomwareActor": False, "publicEvidenceAvailable": True},
        "businessImpact": "Loss of customer trust. PIPEDA compliance investigations.",
        "technicalImpact": "Database dump with 1.2M customer profiles.",
        "actions": {"immediate": "Password reset notifications.", "hours24": "Verify salt algorithms.", "days7": "Deploy WAF."},
        "evidence": {"source": "BreachForums Database Listing", "extracted": "1.2M records", "summary": "Sample records verified."},
    },
    {
        "id": "TR-2026-046",
        "date": "2026-06-17",
        "actor": "Volt Typhoon",
        "victim": "Pacifica Grid Solutions",
        "sector": "Energy",
        "country": "United States",
        "riskScore": 95,
        "confidence": 88,
        "status": "Critical",
        "verificationStatus": "Pending Review",
        "whyCritical": {"credentialsExposed": False, "financialRecordsAffected": False, "knownRansomwareActor": False, "publicEvidenceAvailable": False},
        "businessImpact": "Critical infrastructure disruption risks.",
        "technicalImpact": "SCADA network topology maps exfiltrated.",
        "actions": {"immediate": "Terminate VPN connections.", "hours24": "Deep host forensics.", "days7": "Air-gap OT networks."},
        "evidence": {"source": "CISA OSINT Feed", "extracted": "OT-ZONE-04", "summary": "Volt Typhoon signature match."},
    },
    {
        "id": "TR-2026-045",
        "date": "2026-06-16",
        "actor": "Lazarus Group",
        "victim": "BancGlobal International",
        "sector": "Finance",
        "country": "Singapore",
        "riskScore": 91,
        "confidence": 92,
        "status": "Critical",
        "verificationStatus": "Verified",
        "whyCritical": {"credentialsExposed": True, "financialRecordsAffected": True, "knownRansomwareActor": False, "publicEvidenceAvailable": True},
        "businessImpact": "Systemic risk to transactional settlement channels.",
        "technicalImpact": "SWIFT transfer system server implants.",
        "actions": {"immediate": "Quarantine SWIFT terminals.", "hours24": "Check malicious services.", "days7": "Hardware security keys for approvals."},
        "evidence": {"source": "DarkWeb PasteBin", "extracted": "swift_gate.exe", "summary": "Lazarus-linked RAT confirmed."},
    },
    {
        "id": "TR-2026-044",
        "date": "2026-06-15",
        "actor": "Clop Ransomware",
        "victim": "United Logistics Corp",
        "sector": "Government",
        "country": "Germany",
        "riskScore": 72,
        "confidence": 94,
        "status": "Medium",
        "verificationStatus": "Rejected Incident",
        "whyCritical": {"credentialsExposed": False, "financialRecordsAffected": False, "knownRansomwareActor": True, "publicEvidenceAvailable": True},
        "businessImpact": "Low impact — outdated 2018 archive folders.",
        "technicalImpact": "Legacy shipping records from 2018.",
        "actions": {"immediate": "Verify MOVEit patches.", "hours24": "Confirm legacy data only.", "days7": "Audit retention policies."},
        "evidence": {"source": "Clop MOVEit Leak Portal", "extracted": "2018 archive", "summary": "Historical data only."},
    },
    {
        "id": "TR-2026-043",
        "date": "2026-06-14",
        "actor": "Unknown Hacktivist",
        "victim": "EduCloud Learning Platform",
        "sector": "Technology",
        "country": "Australia",
        "riskScore": 45,
        "confidence": 72,
        "status": "Low",
        "verificationStatus": "Pending Review",
        "whyCritical": {"credentialsExposed": False, "financialRecordsAffected": False, "knownRansomwareActor": False, "publicEvidenceAvailable": True},
        "businessImpact": "Minimal financial impact.",
        "technicalImpact": "Defacement scripts on marketing subdomains.",
        "actions": {"immediate": "Restore from backup.", "hours24": "Vulnerability scan.", "days7": "Static hosting on S3."},
        "evidence": {"source": "Twitter Disclosure", "extracted": "blog subdomain", "summary": "Superficial defacement."},
    },
    {
        "id": "TR-2026-042",
        "date": "2026-06-13",
        "actor": "ALPHV BlackCat",
        "victim": "CareFirst Clinical Lab",
        "sector": "Healthcare",
        "country": "United Kingdom",
        "riskScore": 84,
        "confidence": 89,
        "status": "High",
        "verificationStatus": "Verified",
        "whyCritical": {"credentialsExposed": True, "financialRecordsAffected": False, "knownRansomwareActor": True, "publicEvidenceAvailable": True},
        "businessImpact": "Severe HIPAA/GDPR penalty danger.",
        "technicalImpact": "Citrix gateway compromised. 80GB patient data.",
        "actions": {"immediate": "Deactivate Citrix accounts.", "hours24": "Patch Citrix ADC.", "days7": "Enforce MFA."},
        "evidence": {"source": "ALPHV Onion Leak Site", "extracted": "lab results xlsx", "summary": "Active patient data verified."},
    },
]

DARKWEB_LEAKS = [
    {"date": "2026-06-20", "forum": "BreachForums v2", "title": "Combo List LATAM Gov Emails", "victim": "Sector público BO/PE", "severity": "Critical", "indicator": "420K credenciales · emails @gob.*"},
    {"date": "2026-06-19", "forum": "XSS.is (Tor)", "title": "Stealer Logs Batch #8812", "victim": "Multiples corporativos", "severity": "Critical", "indicator": "Cookies + wallets + RDP"},
    {"date": "2026-06-19", "forum": "Exploit.in", "title": "VPN Access Tokens Dump", "victim": "Proveedor telecom regional", "severity": "High", "indicator": "Tokens OpenVPN censurados"},
    {"date": "2026-06-18", "forum": "RaidForums Mirror", "title": "Database SQL — E-commerce", "victim": "Retail SA", "severity": "High", "indicator": "1.2M registros · tarjetas parciales"},
    {"date": "2026-06-18", "forum": "LeakBase Paste", "title": "Admin panels .gov.bo", "victim": "Instituciones BO", "severity": "Critical", "indicator": "URLs panel + user:pass ocultos"},
    {"date": "2026-06-17", "forum": "Bhinneka Underground", "title": "Corporate Mail Access", "victim": "Dominio energía", "severity": "High", "indicator": "Webmail IMAP dumps"},
    {"date": "2026-06-17", "forum": "DarkNet Market #14", "title": "Employee Directory Leak", "victim": "Logística internacional", "severity": "Medium", "indicator": "Nombres + tel + correo interno"},
    {"date": "2026-06-16", "forum": "LockBit Blog (Onion)", "title": "Full AD Dump — Healthcare", "victim": "Medix Healthcare Group", "severity": "Critical", "indicator": "NTLM hashes · 248GB"},
    {"date": "2026-06-16", "forum": "Telegram Exfil Channel", "title": "GitHub Token Harvest", "victim": "Fintech UK", "severity": "High", "indicator": "AWS + Stripe keys expuestas"},
    {"date": "2026-06-15", "forum": "Altenen Network", "title": "Banking Portal Credentials", "victim": "BancGlobal SG", "severity": "Critical", "indicator": "SWIFT gateway configs"},
]

AUDITS = [
    {"analyst": "Maria Lopez", "action": "Verified", "reason": "Evidence contains valid corporate emails confirming breach of Apex Fintech Services."},
    {"analyst": "Alex Chen", "action": "Verified", "reason": "GitHub leak repository confirmed hosting active AWS keys."},
    {"analyst": "Sarah Jenkins", "action": "Rejected", "reason": "MOVEit leak files contain strictly public pricing datasheets from 2018."},
]


def incident_to_api(row: Incident) -> dict:
    p = row.payload or {}
    return {
        "id": row.id,
        "date": row.date.isoformat(),
        "actor": row.actor,
        "victim": row.victim,
        "sector": row.sector,
        "country": row.country,
        "riskScore": row.risk_score,
        "confidence": row.confidence,
        "status": row.status,
        "verificationStatus": row.verification_status,
        **p,
    }


async def seed_database(session: AsyncSession) -> None:
    existing = await session.scalar(select(Incident.id).limit(1))
    if existing:
        return

    for t in THREATS:
        payload = {k: v for k, v in t.items() if k not in ("id", "date", "actor", "victim", "sector", "country", "riskScore", "confidence", "status", "verificationStatus")}
        session.add(
            Incident(
                id=t["id"],
                date=date.fromisoformat(t["date"]),
                actor=t["actor"],
                victim=t["victim"],
                sector=t["sector"],
                country=t["country"],
                risk_score=t["riskScore"],
                confidence=t["confidence"],
                status=t["status"],
                verification_status=t["verificationStatus"],
                payload=payload,
            )
        )

    for a in AUDITS:
        session.add(AuditLog(analyst=a["analyst"], action=a["action"], reason=a["reason"]))

    await session.commit()
