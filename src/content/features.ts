import type { Locale } from '@/i18n/routing';

export type IconName =
  | 'server'
  | 'layers'
  | 'gauge'
  | 'flask'
  | 'terminal'
  | 'fileCog'
  | 'workflow'
  | 'shieldCheck'
  | 'box'
  | 'blocks'
  | 'puzzle'
  | 'refreshCw'
  | 'bot'
  | 'badgeCheck'
  | 'gem'
  | 'database'
  | 'radio'
  | 'mail'
  | 'calendar'
  | 'key'
  | 'folder'
  | 'languages';

export type Accent = 'cyan' | 'gold' | 'blue';

export interface FeatureContent {
  title: string;
  tagline: string;
  summary: string;
  bullets: string[];
}

export interface Feature {
  slug: string;
  order: number;
  icon: IconName;
  accent: Accent;
  content: Record<Locale, FeatureContent>;
}

export const features: Feature[] = [
  {
    slug: 'http',
    order: 1,
    icon: 'server',
    accent: 'blue',
    content: {
      en: {
        title: 'Python meets Rust. Requests take flight.',
        tagline: 'HTTP / ASGI + RSGI',
        summary:
          'One request API, two server interfaces. Granian supplies the Rust engine; Orionis brings compiled routing, middleware pipelines and streaming responses.',
        bullets: [
          'Native Granian RSGI and ASGI compatibility',
          'Typed routes and composable middleware',
          'JSON, files, streams and content negotiation',
        ],
      },
      es: {
        title: 'Python se encuentra con Rust. Tus peticiones despegan.',
        tagline: 'HTTP / ASGI + RSGI',
        summary:
          'Una API de solicitudes, dos interfaces de servidor. Granian aporta el motor Rust; Orionis reúne rutas compiladas, pipelines de middleware y respuestas en streaming.',
        bullets: [
          'RSGI nativo de Granian y compatibilidad ASGI',
          'Rutas tipadas y middleware componible',
          'JSON, archivos, streams y negociación de contenido',
        ],
      },
    },
  },
  {
    slug: 'realtime',
    order: 2,
    icon: 'radio',
    accent: 'cyan',
    content: {
      en: {
        title: 'The moment it happens. Everywhere it matters.',
        tagline: 'Realtime / Typed hubs',
        summary:
          'Build collaborative experiences with bidirectional RPC, client events and streamed results. Typed hubs compile their invocation plans before the first connection.',
        bullets: [
          'Explicit @remote methods and injected services',
          'JSON or MessagePack over native WebSockets',
          'Groups and worker-local broadcast with bounded fan-out',
        ],
      },
      es: {
        title: 'Cuando sucede. Donde importa.',
        tagline: 'Realtime / Hubs tipados',
        summary:
          'Crea experiencias colaborativas con RPC bidireccional, eventos y resultados en streaming. Los hubs tipados compilan sus planes antes de la primera conexión.',
        bullets: [
          'Métodos @remote explícitos y servicios inyectados',
          'JSON o MessagePack sobre WebSockets nativos',
          'Grupos y broadcast local al worker con fan-out acotado',
        ],
      },
    },
  },
  {
    slug: 'streams',
    order: 3,
    icon: 'workflow',
    accent: 'cyan',
    content: {
      en: {
        title: 'Keep the conversation open.',
        tagline: 'WebSocket / SSE',
        summary:
          'Live dashboards, progress updates and long-lived connections belong in your framework, not in a separate stack.',
        bullets: [
          'WebSockets on ASGI and RSGI',
          'Typed ServerSentEvent encoding',
          'Streaming, disconnect handling and configurable budgets',
        ],
      },
      es: {
        title: 'Mantén la conversación abierta.',
        tagline: 'WebSocket / SSE',
        summary:
          'Dashboards en vivo, avances de procesos y conexiones persistentes forman parte de tu framework, no de otra pila de herramientas.',
        bullets: [
          'WebSockets sobre ASGI y RSGI',
          'Codificación tipada con ServerSentEvent',
          'Streaming, desconexiones y presupuestos configurables',
        ],
      },
    },
  },
  {
    slug: 'orm',
    order: 4,
    icon: 'database',
    accent: 'blue',
    content: {
      en: {
        title: 'Your data. A fluent language.',
        tagline: 'Async Active Record / ORM',
        summary:
          'Express your domain through models, relationships and fluent queries. Engine-neutral plans keep application code independent of the SQL dialect.',
        bullets: [
          'PostgreSQL, MySQL, SQLite, Oracle and SQL Server',
          'Eager loading, pagination, scopes and soft deletes',
          'Migrations, transactions and model factories',
        ],
      },
      es: {
        title: 'Tus datos. Un lenguaje fluido.',
        tagline: 'Active Record asíncrono / ORM',
        summary:
          'Expresa tu dominio con modelos, relaciones y consultas fluidas. Los planes independientes del motor separan tu código del dialecto SQL.',
        bullets: [
          'PostgreSQL, MySQL, SQLite, Oracle y SQL Server',
          'Eager loading, paginación, scopes y soft deletes',
          'Migraciones, transacciones y factories de modelos',
        ],
      },
    },
  },
  {
    slug: 'cache',
    order: 5,
    icon: 'layers',
    accent: 'gold',
    content: {
      en: {
        title: 'Do the work. Reuse the result.',
        tagline: 'Cache / Five backends',
        summary:
          'One asynchronous API for cache-aside reads, batch operations and backend-aware locks. Stores initialize only when you need them.',
        bullets: [
          'Memory, file, Redis, Memcached and database',
          'TTL, counters and remember resolvers',
          'Source-aware caching for compiled artifacts',
        ],
      },
      es: {
        title: 'Haz el trabajo. Reutiliza el resultado.',
        tagline: 'Caché / Cinco backends',
        summary:
          'Una API asíncrona para cache-aside, operaciones por lotes y locks según el backend. Cada store se inicializa cuando lo necesitas.',
        bullets: [
          'Memoria, archivo, Redis, Memcached y base de datos',
          'TTL, contadores y resolvers remember',
          'Caché de artefactos invalidada por cambios de código',
        ],
      },
    },
  },
  {
    slug: 'queues',
    order: 6,
    icon: 'blocks',
    accent: 'blue',
    content: {
      en: {
        title: 'Move the work off the request.',
        tagline: 'Queues / Reliable jobs',
        summary:
          'Dispatch serializable jobs, inject their dependencies and let durable workers handle retries. Every execution gets its own application scope.',
        bullets: [
          'Sync, database and Redis drivers',
          'Delays, retry backoff, timeouts and leases',
          'Primitive job payloads, without arbitrary unpickling',
        ],
      },
      es: {
        title: 'El trabajo sigue fuera de la petición.',
        tagline: 'Queues / Jobs fiables',
        summary:
          'Despacha jobs serializables, inyecta sus dependencias y deja los reintentos a workers durables. Cada ejecución tiene su propio scope de aplicación.',
        bullets: [
          'Drivers sync, base de datos y Redis',
          'Delays, backoff, timeouts y leases',
          'Payloads primitivos, sin deserializar clases arbitrarias',
        ],
      },
    },
  },
  {
    slug: 'mcp',
    order: 7,
    icon: 'bot',
    accent: 'gold',
    content: {
      en: {
        title: 'Make your application agent-ready.',
        tagline: 'Native MCP / HTTP + STDIO',
        summary:
          'Expose your application to AI clients with typed tools, resources and prompts. The same compiled server definition works across transports.',
        bullets: [
          'Tools, resources and prompts as Python classes',
          'Schema validation and dependency injection',
          'HTTP, STDIO and an in-process testing client',
        ],
      },
      es: {
        title: 'Tu aplicación, al alcance de la IA.',
        tagline: 'MCP nativo / HTTP + STDIO',
        summary:
          'Expón tu aplicación a clientes de IA con tools, recursos y prompts tipados. La misma definición compilada funciona en distintos transportes.',
        bullets: [
          'Tools, recursos y prompts como clases Python',
          'Validación de schemas e inyección de dependencias',
          'HTTP, STDIO y cliente de pruebas en proceso',
        ],
      },
    },
  },
  {
    slug: 'container',
    order: 8,
    icon: 'box',
    accent: 'cyan',
    content: {
      en: {
        title: 'Architecture that grows with you.',
        tagline: 'Container / Providers / Facades',
        summary:
          'Type annotations connect your services. Explicit lifetimes and eager or deferred providers keep dependencies predictable from controllers to jobs and tests.',
        bullets: [
          'Singleton, transient and context-local scopes',
          'Automatic callable and constructor injection',
          'Replaceable contracts and lazy service facades',
        ],
      },
      es: {
        title: 'Arquitectura que crece contigo.',
        tagline: 'Container / Providers / Facades',
        summary:
          'Las anotaciones conectan tus servicios. Los ciclos de vida explícitos y proveedores eager o deferred mantienen claras las dependencias, de controladores a jobs y tests.',
        bullets: [
          'Singleton, transient y scopes locales al contexto',
          'Inyección automática en callables y constructores',
          'Contratos reemplazables y fachadas de carga lazy',
        ],
      },
    },
  },
];

export function getFeatures(): Feature[] {
  return [...features].sort((left, right) => left.order - right.order);
}

export function getFeature(slug: string): Feature | undefined {
  return features.find((feature) => feature.slug === slug);
}

export function featureContent(feature: Feature, locale: Locale): FeatureContent {
  return feature.content[locale] ?? feature.content.en;
}

export interface EcosystemFeature {
  slug: string;
  icon: IconName;
  content: Record<Locale, { title: string; summary: string }>;
}

export const ecosystemFeatures: EcosystemFeature[] = [
  {
    slug: 'auth',
    icon: 'shieldCheck',
    content: {
      en: {
        title: 'Auth & permissions',
        summary: 'Sessions, personal tokens, roles, permissions and resource policies.',
      },
      es: {
        title: 'Auth y permisos',
        summary: 'Sesiones, tokens personales, roles, permisos y políticas por recurso.',
      },
    },
  },
  {
    slug: 'schemas',
    icon: 'badgeCheck',
    content: {
      en: {
        title: 'Typed schemas',
        summary: 'Compiled constraints, nested error collection and async validation rules.',
      },
      es: {
        title: 'Schemas tipados',
        summary: 'Restricciones compiladas, errores anidados y reglas de validación async.',
      },
    },
  },
  {
    slug: 'storage',
    icon: 'folder',
    content: {
      en: {
        title: 'Storage, anywhere',
        summary: 'One async API for local files, S3, Azure Blob and Google Cloud Storage.',
      },
      es: {
        title: 'Storage, donde sea',
        summary: 'Una API async para archivos locales, S3, Azure Blob y Google Cloud Storage.',
      },
    },
  },
  {
    slug: 'mail',
    icon: 'mail',
    content: {
      en: {
        title: 'Expressive mail',
        summary: 'Reusable mailables, templates, attachments and SMTP or custom transports.',
      },
      es: {
        title: 'Correo expresivo',
        summary: 'Mailables reutilizables, plantillas, adjuntos y transportes SMTP o propios.',
      },
    },
  },
  {
    slug: 'console',
    icon: 'terminal',
    content: {
      en: {
        title: 'Reactor CLI',
        summary: 'Scaffold components, register commands and run workers from one entry point.',
      },
      es: {
        title: 'Reactor CLI',
        summary: 'Genera componentes, registra comandos y ejecuta workers desde un único punto.',
      },
    },
  },
  {
    slug: 'scheduler',
    icon: 'calendar',
    content: {
      en: {
        title: 'Persistent scheduling',
        summary: 'Schedule registered commands with the integrated APScheduler service.',
      },
      es: {
        title: 'Scheduling persistente',
        summary: 'Programa comandos registrados con el servicio APScheduler integrado.',
      },
    },
  },
  {
    slug: 'testing',
    icon: 'flask',
    content: {
      en: {
        title: 'Application-aware tests',
        summary: 'Async unittest cases, injected services, Rich results and MCP integration tests.',
      },
      es: {
        title: 'Tests con contexto',
        summary: 'Casos unittest async, servicios inyectados, resultados Rich y pruebas MCP.',
      },
    },
  },
  {
    slug: 'views',
    icon: 'puzzle',
    content: {
      en: {
        title: 'Async views',
        summary: 'Server-rendered Jinja2 templates connected to routes, sessions and localization.',
      },
      es: {
        title: 'Vistas asíncronas',
        summary: 'Plantillas Jinja2 en servidor conectadas a rutas, sesiones y traducciones.',
      },
    },
  },
  {
    slug: 'sessions',
    icon: 'refreshCw',
    content: {
      en: {
        title: 'Lazy sessions',
        summary: 'Server-side state, flash data and secure identifiers, activated on first write.',
      },
      es: {
        title: 'Sesiones lazy',
        summary:
          'Estado en servidor, flash data e identificadores seguros desde la primera escritura.',
      },
    },
  },
  {
    slug: 'security',
    icon: 'key',
    content: {
      en: {
        title: 'Hashing & encryption',
        summary: 'Argon2id, bcrypt and application-keyed AES-CBC or AES-GCM encryption.',
      },
      es: {
        title: 'Hashing y cifrado',
        summary: 'Argon2id, bcrypt y cifrado AES-CBC o AES-GCM con la clave de aplicación.',
      },
    },
  },
  {
    slug: 'logging',
    icon: 'fileCog',
    content: {
      en: {
        title: 'Logging & configuration',
        summary:
          'Lazy rotating log channels, typed environment values and validated configuration.',
      },
      es: {
        title: 'Logs y configuración',
        summary: 'Canales lazy con rotación, entorno tipado y configuración validada.',
      },
    },
  },
  {
    slug: 'localization',
    icon: 'languages',
    content: {
      en: {
        title: 'Built-in localization',
        summary: 'JSON translations, fallback locales, replacements and plural forms.',
      },
      es: {
        title: 'Localización integrada',
        summary: 'Traducciones JSON, idiomas fallback, reemplazos y formas plurales.',
      },
    },
  },
];
