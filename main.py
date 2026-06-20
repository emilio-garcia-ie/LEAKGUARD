import os
import re
import json
import sqlite3
import hashlib
import secrets
import urllib.request
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Load environment variables manually from .env if present
if os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

app = FastAPI(title="Aegis Cyber Security Consulting Hub")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "aegis.db"
BREACH_API_URL = "https://leakosintapi.com/"
BREACH_API_TOKEN = "8947909479:o3pE83Li"

# --- SQLITE DATABASE MANAGER ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            val TEXT
        )
    """)
    # Seed default protection values
    cursor.execute("INSERT OR IGNORE INTO system_config (key, val) VALUES ('bo_protection', '1')")
    cursor.execute("INSERT OR IGNORE INTO system_config (key, val) VALUES ('prompt_shield', '1')")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            salt TEXT,
            token TEXT
        )
    """)
    
    # Create forbidden_attempts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS forbidden_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            query TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create system_logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Seed default system logs if empty
    cursor.execute("SELECT COUNT(*) FROM system_logs")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO system_logs (message) VALUES ('LeakGuard: Base de datos RAG enlazada.')")
        cursor.execute("INSERT INTO system_logs (message) VALUES ('LeakGuard: Auditoría en tiempo real activa.')")
        
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_config(key: str, default: str) -> str:
    conn = get_db_connection()
    row = conn.execute("SELECT val FROM system_config WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row["val"] if row else default

def set_config(key: str, val: str):
    conn = get_db_connection()
    conn.execute("INSERT OR REPLACE INTO system_config (key, val) VALUES (?, ?)", (key, val))
    conn.commit()
    conn.close()

def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def get_user_by_token(token: str):
    if not token:
        return None
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE token = ?", (token,)).fetchone()
    conn.close()
    return user

def log_system_message(message: str):
    conn = get_db_connection()
    conn.execute("INSERT INTO system_logs (message) VALUES (?)", (message,))
    conn.commit()
    conn.close()

def query_leak_osint(query_str: str) -> dict:
    payload = {
        "token": BREACH_API_TOKEN,
        "request": query_str,
        "limit": 500,
        "lang": "es"
    }
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            BREACH_API_URL, 
            data=data, 
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except Exception as e:
        print(f"Error calling LeakOSINT: {e}")
        return {"error": str(e)}

# --- PROMPT INJECTION SHIELD SCANNER ---
def check_prompt_injection(user_input: str) -> tuple[bool, str]:
    # Custom rule-based scan for common prompt injection patterns
    injection_patterns = [
        (r'(?i)ignore\b.*\binstructions', "Ignore Instructions Bypass"),
        (r'(?i)system\b.*\boverride', "System Settings Override"),
        (r'(?i)act\b.*\bas\b.*\bgpt', "Persona Impersonation"),
        (r'(?i)olvida\b.*\binstrucciones', "Spanish Forget Instructions"),
        (r'(?i)ejecuta\b.*\bcomandos', "Remote Command Request"),
        (r'(?i)delete\b.*\bdatabase', "Destructive Command Injection"),
        (r'(?i)bypassear\b.*\bseguridad', "Security Bypass Terminology")
    ]
    
    for pattern, name in injection_patterns:
        if re.search(pattern, user_input):
            return True, name
    return False, ""

def ask_local_security_assistant(user_prompt: str, leak_context: str = "") -> str:
    # Offline Local Security Engine (Zero cost, Zero token usage, Zero external API latency)
    if leak_context:
        # Convert raw leak_context data into a neat list of up to 10 leaks
        lines = [line.strip() for line in leak_context.split("\n") if "DB:" in line]
        if lines:
            formatted_list = "\n".join([f"{i+1}. {line}" for i, line in enumerate(lines[:10])])
            return (
                f"Auditoría Aegis OSINT: Se han detectado registros expuestos para el objetivo. "
                f"A continuación se detallan las 10 credenciales exfiltradas:\n\n{formatted_list}"
            )
        return f"Auditoría Aegis OSINT: {leak_context}"
    
    prompt_lower = user_prompt.lower()
    if "rag" in prompt_lower or "base de datos" in prompt_lower or "vector" in prompt_lower:
        return "Aegis RAG Guard asegura tus bases de datos vectoriales filtrando inyecciones indirectas y cifrando metadatos sensibles."
    elif "injection" in prompt_lower or "prompt" in prompt_lower or "jailbreak" in prompt_lower or "shield" in prompt_lower:
        return "Mitigamos inyecciones semánticas a nivel de gateway, analizando heurísticas maliciosas antes de que lleguen a tu LLM."
    elif "pentest" in prompt_lower or "hack" in prompt_lower or "vulnerabilidad" in prompt_lower:
        return "Nuestros Pentests simulan ataques en vivo sobre tu infraestructura para detectar puertos abiertos e inyecciones de código."
    elif "osint" in prompt_lower or "correo" in prompt_lower or "telefono" in prompt_lower:
        return "El escáner OSINT de Aegis monitorea foros hacker y bases de datos expuestas para alertar sobre credenciales filtradas."
    
    # Generic responses
    import random
    respuestas = [
        "Aegis aconseja implementar políticas de mínimo privilegio (RBAC) y habilitar MFA en toda la infraestructura corporativa.",
        "Sanitizar los prompts y estructurar las respuestas es el primer paso para proteger aplicaciones basadas en modelos de lenguaje.",
        "Para cualquier consulta o soporte técnico adicional, contáctanos en support@aegis.com."
    ]
    return random.choice(respuestas)

def ask_gemini_assistant(user_prompt: str, leak_context: str = "") -> str:
    # Read Gemini API Key from loaded env settings
    api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyB35Bx94WDIp3-CGnTflYwbEYvgDEVrmis")
    
    system_instruction = (
        "Eres AegisAI, el motor de inteligencia cognitiva de Aegis Cyber Security. "
        "Tus respuestas deben ser profesionales, técnicas, directas, concisas y con un tono de experto en ciberseguridad. "
        "No utilices emojis. Si hay datos de filtraciones reales adjuntos, analízalos rigurosamente en tu respuesta."
    )
    
    if leak_context:
        prompt = (
            f"{system_instruction}\n\n"
            f"[CONTEXTO DE FILTRACIONES DETECTADAS]:\n{leak_context}\n\n"
            f"Consulta del usuario a auditar: {user_prompt}"
        )
    else:
        prompt = (
            f"{system_instruction}\n\n"
            f"Consulta de seguridad del usuario: {user_prompt}"
        )
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            candidates = res_json.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
            return ask_local_security_assistant(user_prompt, leak_context)
    except Exception as e:
        print(f"Error calling Gemini 2.5 Flash: {e}")
        return ask_local_security_assistant(user_prompt, leak_context)

# --- API MODELS ---
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    query: str
    protection: bool
    token: str = None

class ToggleRequest(BaseModel):
    token: str
    protection: bool

# --- HELPER FUNCTIONS ---
def is_forbidden_query(user_input: str) -> bool:
    patterns = [
        r'\.gob\b', 
        r'\.gov\b', 
        r'\.minsalud\b', 
        r'(?i)minsalud', 
        r'(?i)gobierno', 
        r'(?i)gubernamental',
        r'(?i)ministerio'
    ]
    for p in patterns:
        if re.search(p, user_input):
            return True
    return False

# --- ROUTING ENDPOINTS ---
@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.post("/register")
async def register(req: RegisterRequest):
    username = req.username.strip()
    password = req.password.strip()
    if not username or not password:
        return {"success": False, "message": "El usuario y contraseña no pueden estar vacíos."}
    
    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return {"success": False, "message": "El nombre de usuario ya está registrado."}
    
    salt = secrets.token_hex(16)
    password_hash = hash_password(password, salt)
    
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
            (username, password_hash, salt)
        )
        conn.commit()
        success = True
        message = "Usuario registrado exitosamente."
        # Log system message
        conn.execute("INSERT INTO system_logs (message) VALUES (?)", (f"Nuevo usuario registrado: {username}",))
        conn.commit()
    except Exception as e:
        success = False
        message = f"Error al registrar: {str(e)}"
    finally:
        conn.close()
        
    return {"success": success, "message": message}

@app.post("/login")
async def login(req: LoginRequest):
    username = req.username.strip()
    password = req.password.strip()
    
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if not user:
        conn.close()
        return {"success": False, "message": "Usuario o contraseña incorrectos."}
    
    salt = user["salt"]
    expected_hash = hash_password(password, salt)
    if user["password_hash"] != expected_hash:
        conn.close()
        return {"success": False, "message": "Usuario o contraseña incorrectos."}
    
    token = secrets.token_hex(24)
    conn.execute("UPDATE users SET token = ? WHERE id = ?", (token, user["id"]))
    conn.execute("INSERT INTO system_logs (message) VALUES (?)", (f"Sesión iniciada para: {username}",))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Sesión iniciada.", "token": token, "username": username}

@app.post("/logout")
async def logout(token: str):
    conn = get_db_connection()
    user = conn.execute("SELECT username FROM users WHERE token = ?", (token,)).fetchone()
    if user:
        username = user["username"]
        conn.execute("UPDATE users SET token = NULL WHERE token = ?", (token,))
        conn.execute("INSERT INTO system_logs (message) VALUES (?)", (f"Sesión cerrada para: {username}",))
        conn.commit()
    conn.close()
    return {"success": True, "message": "Sesión cerrada."}

@app.get("/dashboard/data")
async def get_dashboard_data(token: str):
    user = get_user_by_token(token)
    if not user:
        return {"success": False, "message": "No autorizado."}
    
    conn = get_db_connection()
    bo_protection = conn.execute("SELECT val FROM system_config WHERE key = 'bo_protection'").fetchone()
    prompt_shield = conn.execute("SELECT val FROM system_config WHERE key = 'prompt_shield'").fetchone()
    
    attempts_rows = conn.execute("SELECT username, query, timestamp FROM forbidden_attempts ORDER BY id DESC LIMIT 50").fetchall()
    attempts = [dict(row) for row in attempts_rows]
    
    logs_rows = conn.execute("SELECT message, timestamp FROM system_logs ORDER BY id DESC LIMIT 50").fetchall()
    logs = [f"[{row['timestamp']}] {row['message']}" for row in logs_rows]
    
    conn.close()
    
    return {
        "success": True,
        "bo_protection": (bo_protection["val"] == "1") if bo_protection else True,
        "prompt_shield": (prompt_shield["val"] == "1") if prompt_shield else True,
        "forbidden_attempts": attempts,
        "logs": logs
    }

@app.post("/dashboard/toggle")
async def toggle_dashboard_setting(req: ToggleRequest):
    user = get_user_by_token(req.token)
    if not user:
        return {"success": False, "message": "No autorizado."}
    
    set_config("bo_protection", "1" if req.protection else "0")
    
    action = "ACTIVADO" if req.protection else "DESACTIVADO"
    msg = f"Filtro Dominios .bo {action} por {user['username']}."
    log_system_message(msg)
    
    return {"success": True, "bo_protection": req.protection}

@app.post("/chat")
async def handle_chat_request(req: ChatRequest):
    query = req.query.strip()
    
    # Store dynamic toggle configuration from client
    set_config("bo_protection", "1" if req.protection else "0")

    # 1. First run prompt injection shield (if active)
    shield_active = get_config("prompt_shield", "1") == "1"
    if shield_active:
        is_inj, inj_name = check_prompt_injection(query)
        if is_inj:
            log_system_message(f"PROMPT SHIELD DETECTED: {inj_name} en consulta '{query}'")
            return {
                "response": f"[PROMPT SHIELD DETECTED: {inj_name}] Petición bloqueada automáticamente por Aegis Dynamic Guardrails.",
                "log": f"VECTORES DE ATAQUE: Bloqueada inyección '{inj_name}' en la consulta de entrada.",
                "leak": False
            }

    # 2. Check for forbidden (governmental) searches
    if is_forbidden_query(query):
        # Resolve username
        username = "Anónimo"
        if req.token:
            user = get_user_by_token(req.token)
            if user:
                username = user["username"]
        
        conn = get_db_connection()
        conn.execute("INSERT INTO forbidden_attempts (username, query) VALUES (?, ?)", (username, query))
        conn.commit()
        conn.close()
        
        log_system_message(f"BÚSQUEDA PROHIBIDA BLOQUEADA: '{query}' por {username}")
        
        return {
            "response": "[BÚSQUEDA BLOQUEADA - ACCESO DENEGADO] Los términos de búsqueda ingresados hacen referencia a dominios o entidades gubernamentales restringidas (.gob / .gov / .minsalud). Esta consulta ha sido bloqueada y registrada para auditoría.",
            "log": f"ALERTA SEGURIDAD: Búsqueda gubernamental bloqueada ('{query}').",
            "leak": False
        }

    leak_data_summary = ""
    is_email = bool(re.match(r'[^@]+@[^@]+\.[^@]+', query))
    is_phone = bool(re.match(r'^\+?\d{8,15}$', query))
    
    is_leak_search = "leak" in query.lower() or "filtrac" in query.lower() or "breach" in query.lower() or is_email or is_phone
    
    if is_leak_search:
        # Check registration requirement
        user = get_user_by_token(req.token)
        if not user:
            log_system_message("CONSULTA BLOQUEADA: Intento de consulta OSINT sin autenticación.")
            return {
                "response": "[REGISTRO REQUERIDO] Las búsquedas OSINT, filtraciones de credenciales y auditorías de base de datos están restringidas para usuarios no registrados. Por favor, regístrate e inicia sesión desde el Dashboard de Seguridad para acceder a esta función.",
                "log": "ACCESO DENEGADO: Intento de consulta OSINT sin autenticación.",
                "leak": False
            }

        potential_targets = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+|[+]?\d{8,15}', query)
        target = potential_targets[0] if potential_targets else query
        
        # When switch is ON, block ALL requests regardless of domain
        if req.protection:
            log_system_message(f"CONSULTA PROTEGIDA: Auditoría bloqueada por Aegis Shield para '{target}'")
            return {
                "response": "[DATA PROTECTED - ACTIVE SECURITY SHIELD] La base de datos Aegis ha bloqueado esta consulta para prevenir la exfiltración de registros corporativos.",
                "log": f"ACCESO DENEGADO: Intento de consulta de auditoría bloqueado por Aegis Shield.",
                "leak": False
            }
        
        res = query_leak_osint(target)
        leak_list = res.get("List", {})
        
        # Parse and gather up to 10 actual credentials/lines from the database dump
        extracted_leaks = []
        if leak_list and isinstance(leak_list, dict):
            for db_name, db_info in leak_list.items():
                if isinstance(db_info, dict) and "Data" in db_info:
                    records = db_info["Data"]
                    if isinstance(records, list):
                        for rec in records:
                            if len(extracted_leaks) >= 10:
                                break
                            email_val = rec.get("Email") or rec.get("UserName") or rec.get("Login") or "N/A"
                            pass_val = rec.get("Password") or rec.get("Hash") or "N/A"
                            extracted_leaks.append(f"DB: {db_name} | Email/User: {email_val} | Pass: {pass_val}")
                if len(extracted_leaks) >= 10:
                    break
        
        if extracted_leaks:
            # Format the exactly 10 exposures
            leak_data_summary = (
                f"IMPORTANTE: Se han encontrado filtraciones reales para '{target}'. Debes enumerar explícitamente y de forma obligatoria las siguientes credenciales comprometidas (mostrando hasta 10 si están disponibles):\n"
                + "\n".join(extracted_leaks)
            )
        else:
            leak_data_summary = f"No se encontraron filtraciones para '{target}' en las bases de datos de LeakOSINT."

    assistant_reply = ask_local_security_assistant(query, leak_context=leak_data_summary)
    
    has_leaks = "filtraciones reales" in leak_data_summary
    log_msg = f"EXFILTRACIÓN CRÍTICA: Expuestos registros confidenciales de '{query}'." if (has_leaks and not req.protection) else ("CONSULTA OSINT: Identificador limpio." if not has_leaks else "IA CONSULTA: Respuesta de IA generada.")
    
    # Log system message
    log_system_message(f"Consulta procesada: '{query}' -> {log_msg}")

    return {
        "response": assistant_reply,
        "log": log_msg,
        "leak": has_leaks and not req.protection
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
