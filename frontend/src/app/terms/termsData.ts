import { FileText, ShieldAlert, EyeOff, Lock, Globe, LucideIcon } from "lucide-react";
import { Lang } from "@/contexts/language-context";

export const termsData: Record<Lang, {
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string;
  sections: { title: string; icon: LucideIcon; content: string[] }[];
  footerNote: string;
}> = {
  es: {
    title: "Términos de Servicio y Aviso Legal",
    subtitle: "Marco regulatorio y condiciones de uso para LeakGuard",
    lastUpdated: "Última actualización: 22 de junio de 2026",
    intro: "Bienvenido a LeakGuard. Antes de utilizar nuestra plataforma OSINT y de inteligencia de amenazas, le solicitamos que lea detenidamente este aviso legal. El acceso y uso del sitio implica la aceptación plena de estas condiciones.",
    sections: [
      {
        title: "1. Finalidad de la Plataforma",
        icon: FileText,
        content: [
          "LeakGuard es una herramienta desarrollada con fines exclusivos de ciberseguridad, educación e inteligencia preventiva frente a incidentes. Su objetivo es permitir a individuos y organizaciones verificar si su información de credenciales o exposición de activos ha sido comprometida en filtraciones públicas.",
          "El servicio está diseñado para mitigar riesgos cibernéticos facilitando alertas oportunas y recomendaciones automatizadas de remediación."
        ]
      },
      {
        title: "2. Neutralidad Técnica y Exención de Responsabilidad",
        icon: ShieldAlert,
        content: [
          "LeakGuard es una plataforma de indexación y consulta pasiva. Declaramos explícitamente que no tenemos relación alguna, directa o indirecta, con intrusiones, hackeos, robos de información o ciberataques.",
          "Nuestra actividad se limita a recopilar, procesar y dar a conocer información pública previamente indexada y disponible en el ciberespacio, incluyendo foros especializados y fuentes abiertas (OSINT).",
          "Al igual que plataformas tecnológicas internacionalmente reconocidas como Intelligence X (IntelX) o Have I Been Pwned, operamos de forma neutral sin participar en la distribución maliciosa de datos."
        ]
      },
      {
        title: "3. Redacción y Censura de Credenciales",
        icon: EyeOff,
        content: [
          "Para salvaguardar la seguridad de los afectados, LeakGuard implementa de forma obligatoria la censura de contraseñas y datos sensibles en texto plano.",
          "El sistema nunca mostrará de manera pública ni almacenará contraseñas legibles completas. Se limita a mostrar fragmentos censurados y a calcular índices de riesgo para alertar sobre la necesidad de un cambio de credenciales."
        ]
      },
      {
        title: "4. Privacidad y Tratamiento de Datos",
        icon: Lock,
        content: [
          "Datos del usuario: Los datos personales recopilados durante el registro (como nombre y correo electrónico) se utilizan estrictamente para configurar el perfil del usuario y enviar notificaciones y alertas automáticas de filtraciones.",
          "No comercialización: Garantizamos bajo este marco que no vendemos, distribuimos ni comerciamos con la información personal de nuestros usuarios.",
          "Sin registros invasivos: LeakGuard no almacena los términos de búsqueda específicos realizados por los usuarios ni las direcciones IP desde las cuales se realizan las consultas, preservando el anonimato de las auditorías de seguridad."
        ]
      },
      {
        title: "5. Marco Legal y Jurisdicción",
        icon: Globe,
        content: [
          "Esta plataforma se respalda y opera bajo el amparo de la legislación de los Estados Unidos de América en lo relativo a la indexación de información de acceso público y a la protección de herramientas de investigación y seguridad en Internet.",
          "Cualquier uso indebido de la información obtenida a través de LeakGuard es responsabilidad exclusiva del usuario final. El usuario se compromete a no utilizar esta plataforma para actividades ilícitas, de acoso, extorsión o intrusión digital."
        ]
      }
    ],
    footerNote: "El uso y la responsabilidad sobre los datos consultados van sobre cada usuario. Si no está de acuerdo con estos términos, le solicitamos que se abstenga de utilizar este servicio."
  },
  en: {
    title: "Terms of Service & Legal Notice",
    subtitle: "Regulatory framework and conditions of use for LeakGuard",
    lastUpdated: "Last updated: June 22, 2026",
    intro: "Welcome to LeakGuard. Before using our OSINT and threat intelligence platform, we ask that you carefully read this legal notice. Accessing and using this site implies full acceptance of these terms.",
    sections: [
      {
        title: "1. Purpose of the Platform",
        icon: FileText,
        content: [
          "LeakGuard is a tool developed exclusively for cybersecurity, education, and preventive threat intelligence. Its purpose is to allow individuals and organizations to check if their credential information or asset exposure has been compromised in public data breaches.",
          "The service is designed to mitigate cyber risks by providing timely alerts and automated remediation recommendations."
        ]
      },
      {
        title: "2. Technical Neutrality & Disclaimer of Liability",
        icon: ShieldAlert,
        content: [
          "LeakGuard is a passive querying and indexing platform. We explicitly state that we have no relationship, direct or indirect, with any intrusions, hacks, data theft, or cyberattacks.",
          "Our activity is strictly limited to gathering, processing, and publicizing information that has already been publicly indexed and made available in cyberspace, including specialized forums and open sources (OSINT).",
          "Similar to internationally recognized platforms like Intelligence X (IntelX) or Have I Been Pwned, we operate as a neutral indexing search engine without participating in the malicious distribution of data."
        ]
      },
      {
        title: "3. Redaction and Censorship of Credentials",
        icon: EyeOff,
        content: [
          "To safeguard the security of affected individuals, LeakGuard strictly redacts/censors passwords and sensitive data in plaintext.",
          "The system will never publicly display or store complete readable passwords. It only displays partially hidden strings and calculates risk indexes to alert the user of the critical need to change their credentials."
        ]
      },
      {
        title: "4. Privacy & Data Handling",
        icon: Lock,
        content: [
          "User data: Personal data collected during registration (such as name and email address) is used strictly to set up the user profile and to deliver automated alerts and breach notifications.",
          "No commercialization: We guarantee that we do not sell, distribute, or trade our users' personal information.",
          "No invasive logs: LeakGuard does not store specific search queries made by users or the IP addresses from which queries originate, ensuring full anonymity for security audits."
        ]
      },
      {
        title: "5. Legal Framework and Jurisdiction",
        icon: Globe,
        content: [
          "This platform is backed and operates under the laws of the United States of America regarding the indexing of publicly accessible information and the protection of internet security and research tools.",
          "Any misuse of the information obtained through LeakGuard is the sole responsibility of the end user. The user agrees not to use this platform for unlawful activities, harassment, extortion, or digital intrusions."
        ]
      }
    ],
    footerNote: "The use and liability of the queried data lie entirely with each user. If you do not agree to these terms, please refrain from using this service."
  },
  ru: {
    title: "Условия использования и правовое уведомление",
    subtitle: "Правовая база и правила использования платформы LeakGuard",
    lastUpdated: "Последнее обновление: 22 июня 2026 г.",
    intro: "Добро пожаловать в LeakGuard. Перед использованием нашей OSINT-платформы анализа угроз безопасности просим вас внимательно ознакомиться с этим юридическим уведомлением. Использование сайта означает полное согласие с данными условиями.",
    sections: [
      {
        title: "1. Назначение платформы",
        icon: FileText,
        content: [
          "LeakGuard — это инструмент, разработанный исключительно для целей кибербезопасности, обучения и превентивного выявления угроз. Его цель — позволить частным лицам и организациям проверить, были ли их учетные данные или конфиденциальные активы скомпрометированы в результате публичных утечек данных.",
          "Сервис предназначен для снижения киберрисков путем предоставления своевременных оповещений и автоматических рекомендаций по устранению последствий."
        ]
      },
      {
        title: "2. Техническая нейтральность и ограничение ответственности",
        icon: ShieldAlert,
        content: [
          "LeakGuard является пассивной поисковой и индексирующей платформой. Мы официально заявляем, что не имеем никакого отношения — прямого или косвенного — к хакерским атакам, краже данных или любым кибератакам.",
          "Наша деятельность ограничивается сбором, обработкой и предоставлением информации, которая уже была публично проиндексирована и находится в открытом доступе, включая специализированные форумы и открытые источники (OSINT).",
          "Подобно всемирно известным платформам, таким как Intelligence X (IntelX) или Have I Been Pwned, мы работаем как нейтральный поисковый индекс и не участвуем в злонамеренном распространении данных."
        ]
      },
      {
        title: "3. Цензурирование и скрытие учетных данных",
        icon: EyeOff,
        content: [
          "Для защиты безопасности затронутых лиц LeakGuard в обязательном порядке применяет маскирование и цензурирование паролей и конфиденциальных данных, находящихся в открытом виде.",
          "Система никогда не отображает публично и не сохраняет полные читаемые пароли. Мы показываем только частично скрытые строки и рассчитываем индексы риска, чтобы предупредить о необходимости смены паролей."
        ]
      },
      {
        title: "4. Конфиденциальность и обработка данных",
        icon: Lock,
        content: [
          "Данные пользователей: Персональные данные, собираемые при регистрации (например, имя и электронная почта), используются строго для настройки профиля пользователя и отправки автоматических уведомлений об утечках.",
          "Без коммерциализации: Мы гарантируем, что не продаем, не распространяем и не передаем личную информацию наших пользователей третьим лицам.",
          "Без хранения логов: LeakGuard не сохраняет поисковые запросы пользователей, а также IP-адреса, с которых выполняются запросы, обеспечивая полную анонимность аудита безопасности."
        ]
      },
      {
        title: "5. Законодательство и юрисдикция",
        icon: Globe,
        content: [
          "Платформа функционирует в соответствии с законодательством Соединенных Штатов Америки в части индексирования общедоступной информации и защиты исследовательских инструментов интернет-безопасности.",
          "Любое неправомерное использование информации, полученной через LeakGuard, является исключительной ответственностью конечного пользователя. Пользователь обязуется не использовать эту платформу для незаконной деятельности, шантажа, вымогательства или несанкционированного доступа."
        ]
      }
    ],
    footerNote: "Использование и ответственность за полученные данные лежат исключительно на каждом пользователе. Если вы не согласны с этими условиями, пожалуйста, воздержитесь от использования этого сервиса."
  },
  he: {
    title: "תנאי שימוש והצהרה משפטית",
    subtitle: "מסגרת רגולטורית ותנאי שימוש עבור LeakGuard",
    lastUpdated: "עדכון אחרון: 22 ביוני 2026",
    intro: "ברוכים הבאים ל-LeakGuard. לפני השימוש בפלטפורמת ה-OSINT ומודיעין האיומים שלנו, אנו מבקשים ממך לקרוא בעיון הצהרה משפטית זו. הגישה והשימוש באתר מהווים הסכמה מלאה לתנאים אלו.",
    sections: [
      {
        title: "1. מטרת הפלטפורמה",
        icon: FileText,
        content: [
          "LeakGuard הוא כלי שפותח אך ורק למטרות אבטחת מידע, חינוך ומודיעין מניעתי. מטרתו לאפשר לאנשים פרטיים ולארגונים לבדוק אם פרטי הגישה או הנכסים הדיגיטליים שלהם נחשפו בדליפות מידע ציבוריות.",
          "השירות נועד לצמצם סיכוני סייבר על ידי מתן התראות בזמן והמלצות תיקון אוטומטיות."
        ]
      },
      {
        title: "2. ניטרליות טכנית ופטור מאחריות",
        icon: ShieldAlert,
        content: [
          "LeakGuard היא פלטפורמת אינדוקס ושאילתות פסיבית. אנו מצהירים באופן מפורש שאין לנו כל קשר, ישיר או עקיף, לפריצות, גניבת מידע או מתקפות סייבר.",
          "הפעילות שלנו מוגבלת לאיסוף, עיבוד והצגת מידע שכבר אונדקס באופן ציבורי וזמין במרחב הקיברנטי, כולל פורומים ייעודיים ומקורות גלויים (OSINT).",
          "בדומה לפלטפורמות מוכרות ברחבי העולם כגון Intelligence X (IntelX) או Have I Been Pwned, אנו פועלים כמנוע חיפוש ואינדוקס ניטרלי ללא השתתפות בהפצה זדונית של נתונים."
        ]
      },
      {
        title: "3. צנזור והסתרת סיסמאות",
        icon: EyeOff,
        content: [
          "על מנת להגן על אבטחת המשתמשים שנפגעו, LeakGuard מיישמת חובת צנזור על סיסמאות ונתונים רגישים בטקסט פשוט.",
          "המערכת לעולם לא תציג בפומבי או תשמור סיסמאות קריאות מלאות. התצוגה מוגבלת לסיסמאות מוסתרות בחלקן לצד חישוב מדדי סיכון כדי להתריע על הצורך בהחלפת סיסמה דחופה."
        ]
      },
      {
        title: "4. פרטיות וטיפול בנתונים",
        icon: Lock,
        content: [
          "נתוני משתמש: נתונים אישיים שנאספים במהלך ההרשמה (כגון שם ואימייל) משמשים אך ורק להגדרת פרופיל המשתמש ושליחת התראות ודליפות אוטומטיות.",
          "ללא מסחור: אנו מתחייבים כי איננו מוכרים, מפיצים או סוחרים במידע האישי של המשתמשים שלנו.",
          "ללא יומני מעקב פולשניים: LeakGuard אינה שומרת את מונחי החיפוש הספציפיים המבוצעים על ידי משתמשים או את כתובות ה-IP שמהן מבוצעות השאילתות, ובכך שומרת על אנונימיות מלאה של בדיקות האבטחה."
        ]
      },
      {
        title: "5. מסגרת משפטית וסמכות שיפוט",
        icon: Globe,
        content: [
          "פלטפורמה זו פועלת ומגובה תחת החוק של ארצות הברית של אמריקה (USA) בכל הנוגע לאינדוקס מידע נגיש לציבור והגנה על כלי מחקר ואבטחת אינטרנט.",
          "כל שימוש לרעה במידע המתקבל באמצעות LeakGuard הוא באחריותו הבלעדית של משתמש הקצה. המשתמש מתחייב שלא להשתמש בפלטפורמה זו לפעילויות בלתי חוקיות, הטרדה, סחיטה או חדירה דיגיטלית."
        ]
      }
    ],
    footerNote: "השימוש והאחריות על המידע המבוקש חלים על כל משתמש באופן בלעדי. אם אינך מסכים לתנאים אלו, אנא הימנע משימוש בשירות זה."
  }
};
