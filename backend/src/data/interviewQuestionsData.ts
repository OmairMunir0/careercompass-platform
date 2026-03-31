export const interviewQuestionsData = {
    Frontend: [
        {
            question: "Explain how React Fiber architecture works and how it improves performance over the previous stack-based reconciler.",
            answer: "React Fiber breaks rendering work into units and prioritizes updates based on importance. It allows interruption, pausing, and resuming of rendering work, leading to smoother UI updates and better handling of high-priority tasks.",
            concepts: ["React Fiber", "Reconciliation", "Rendering", "Performance Optimization"]
        },
        {
            question: "How does server-side rendering (SSR) differ from static site generation (SSG) in Next.js, and when would you use each?",
            answer: "SSR generates HTML on each request dynamically, good for frequently changing data. SSG generates HTML at build time, suitable for static content. SSR trades performance for freshness; SSG trades freshness for speed and caching.",
            concepts: ["SSR", "SSG", "Next.js", "Rendering Strategies"]
        },
        {
            question: "Explain how React's concurrent mode improves rendering performance and handles interruptions.",
            answer: "Concurrent mode lets React work on multiple state updates simultaneously, yielding control back to the browser to keep the UI responsive. Long-running tasks can be paused or interrupted to prevent blocking user interactions.",
            concepts: ["Concurrent Mode", "State Updates", "UI Responsiveness", "React Scheduling"]
        },
        {
            question: "How does memoization with useMemo differ from caching computed values in vanilla JavaScript?",
            answer: "useMemo caches the result of expensive calculations between renders and recomputes only when dependencies change. Unlike vanilla JS caching, it integrates with React's render lifecycle to avoid stale values.",
            concepts: ["Memoization", "useMemo", "React Hooks", "Performance"]
        },
        {
            question: "Describe critical rendering path in browsers and how you can optimize it for performance.",
            answer: "Critical rendering path is the sequence from HTML parsing to page rendering. Optimize by reducing render-blocking CSS/JS, minifying assets, using preloading, and inlining critical CSS to speed up first meaningful paint.",
            concepts: ["Critical Rendering Path", "Browser Performance", "Web Vitals", "Optimization"]
        },
        {
            question: "Explain how CSS Houdini works and give an example use case.",
            answer: "CSS Houdini exposes low-level CSS APIs to JavaScript, allowing developers to extend CSS by writing custom layout, paint, and animation rules. Example: creating a custom background shader dynamically.",
            concepts: ["CSS Houdini", "Web APIs", "Advanced Styling"]
        },
        {
            question: "How does shadow DOM work, and why is it important for web components?",
            answer: "Shadow DOM encapsulates a component’s DOM and styles, preventing external styles from leaking in and internal styles from leaking out. This enables reusable, isolated components.",
            concepts: ["Shadow DOM", "Web Components", "Encapsulation", "CSS Isolation"]
        },
        {
            question: "Explain the difference between progressive hydration and full hydration in modern frontend frameworks.",
            answer: "Full hydration attaches all JS logic to the DOM at once, while progressive hydration hydrates only visible components first, improving performance on large pages by deferring less critical JS.",
            concepts: ["Hydration", "Progressive Hydration", "Frontend Frameworks", "UX Optimization"]
        },
        {
            question: "How do browser reflows and repaints affect performance, and how can you minimize them?",
            answer: "Reflows recalculate layout, repaints redraw pixels. They are costly when frequent. Minimize by batching DOM changes, using transforms instead of top/left, and avoiding layout thrashing.",
            concepts: ["Reflows", "Repaints", "DOM Manipulation", "Browser Rendering Engine"]
        },
        {
            question: "Explain how web workers and service workers differ, and when to use each.",
            answer: "Web workers run scripts in background threads for computation-heavy tasks. Service workers act as network proxies, caching and intercepting requests for offline support. Use web workers for CPU-heavy tasks and service workers for offline caching.",
            concepts: ["Web Workers", "Service Workers", "Multithreading", "PWA"]
        },
    ],
    Backend: [
        {
            question: "Explain the Node.js Event Loop phases and how they affect asynchronous I/O execution order.",
            answer: "The event loop has phases: timers, I/O callbacks, idle, poll, check, and close callbacks. Microtasks run after each phase. Understanding phase order is critical for managing async tasks, setImmediate, nextTick, and promise execution.",
            concepts: ["Node.js Event Loop", "Asynchronous I/O", "Microtasks", "Timers"]
        },
        {
            question: "How would you implement a zero-downtime deployment for a Node.js API in production?",
            answer: "Use process managers like PM2 with cluster mode, load balancers, blue-green deployments, and graceful shutdown handlers to ensure existing requests complete before replacing processes.",
            concepts: ["Zero-Downtime Deployment", "Load Balancing", "Graceful Shutdown", "PM2"]
        },
        {
            question: "Explain backpressure in Node.js streams and how to handle it.",
            answer: "Backpressure occurs when writable streams cannot consume data as fast as readable streams produce it. Handle it by checking stream.write() return value and pausing/resuming the readable stream appropriately.",
            concepts: ["Backpressure", "Node.js Streams", "Buffer Management", "I/O Optimization"]
        },
        {
            question: "Describe how JWT token revocation can be implemented in a stateless API.",
            answer: "Store a token blacklist in DB/Redis with expiration matching token. Check incoming tokens against the blacklist. Alternatively, use short-lived tokens with refresh tokens for revocation.",
            concepts: ["JWT", "Token Revocation", "Stateless API", "Authentication"]
        },
        {
            question: "How do you design a highly scalable REST API capable of handling millions of concurrent users?",
            answer: "Use horizontal scaling, stateless servers, load balancing, caching, database sharding/replication, connection pooling, async processing queues, and monitoring/logging for performance bottlenecks.",
            concepts: ["System Design", "API Scalability", "Load Balancing", "Caching"]
        },
        {
            question: "Explain eventual consistency in distributed databases and trade-offs compared to strong consistency.",
            answer: "Eventual consistency allows temporary stale reads for better availability and partition tolerance. Strong consistency guarantees latest data but may reduce availability and increase latency.",
            concepts: ["Distributed Databases", "Eventual Consistency", "Strong Consistency", "CAP Theorem"]
        },
        {
            question: "How does Node.js handle thread safety and concurrency internally?",
            answer: "Node.js is single-threaded for JS code but uses libuv’s thread pool for I/O. Concurrency is achieved via async callbacks and event loop, avoiding shared mutable state in JS code.",
            concepts: ["Thread Safety", "Concurrency", "libuv", "Single-threaded Architecture"]
        },
        {
            question: "Explain how you would implement rate limiting in an API gateway.",
            answer: "Use in-memory or Redis counters keyed by IP or user ID, apply limits per interval, and return 429 Too Many Requests if limit exceeded. Consider leaky bucket or token bucket algorithms.",
            concepts: ["Rate Limiting", "API Gateway", "Redis", "Security"]
        },
        {
            question: "What are memory leaks in Node.js and how can you detect them?",
            answer: "Leaks occur when objects are retained unintentionally. Detect using heap snapshots, Chrome DevTools, Node.js inspector, or libraries like memwatch-next. Monitor memory growth patterns in production.",
            concepts: ["Memory Leaks", "Garbage Collection", "Profiling", "Node.js Diagnostics"]
        },
        {
            question: "Describe how to implement a queue system in Node.js for background jobs.",
            answer: "Use message brokers like RabbitMQ or Redis queues. Workers consume tasks asynchronously, allowing retry mechanisms, job prioritization, and distributed processing for scalable background tasks.",
            concepts: ["Message Queues", "Background Jobs", "RabbitMQ / Redis", "Asynchronous Processing"]
        },
    ],
    "IOS Developement (Swift)": [
        {
            question: "Explain Swift's memory management model and how ARC handles strong, weak, and unowned references to prevent retain cycles.",
            answer: "ARC tracks strong references and frees memory when count drops to zero. Weak references do not increment count; unowned references assume the referenced object exists. Correct use prevents retain cycles and memory leaks.",
            concepts: ["ARC (Automatic Reference Counting)", "Memory Management", "Retain Cycles", "Swift"]
        },
        {
            question: "How does Combine framework handle reactive programming and backpressure in Swift?",
            answer: "Combine uses publishers and subscribers to model asynchronous streams. Operators control data flow, and demand signals manage backpressure, ensuring subscribers aren't overwhelmed.",
            concepts: ["Combine Framework", "Reactive Programming", "Backpressure", "Asynchronous Streams"]
        },
        {
            question: "Explain how Swift property wrappers work and give a custom example.",
            answer: "Property wrappers add behavior to properties via a wrapper type. Example: @Published for observable properties, or creating a wrapper that clamps values to a range.",
            concepts: ["Property Wrappers", "Swift Syntax", "Code Reusability", "Data Encapsulation"]
        },
        {
            question: "What is the difference between value semantics and reference semantics, and how does it affect concurrency in Swift?",
            answer: "Value types (structs) are copied on mutation, making them thread-safe. Reference types (classes) share memory, requiring synchronization to avoid race conditions in concurrent code.",
            concepts: ["Value Types vs Reference Types", "Concurrency", "Thread Safety", "Swift Structs and Classes"]
        },
        {
            question: "Explain SwiftUI’s declarative layout system and how state changes trigger view updates.",
            answer: "SwiftUI views describe UI as a function of state. When state changes, the view hierarchy is re-evaluated. SwiftUI calculates minimal differences to update the UI efficiently.",
            concepts: ["SwiftUI", "Declarative UI", "State Management", "View Rendering"]
        },
        {
            question: "Describe the differences between Grand Central Dispatch (GCD) and OperationQueues for concurrency.",
            answer: "GCD provides low-level queues for async execution; OperationQueues wrap GCD with dependencies, priorities, and cancellation support for more structured concurrency.",
            concepts: ["GCD", "OperationQueues", "Concurrency", "Multithreading"]
        },
        {
            question: "How would you detect and resolve a retain cycle in Swift?",
            answer: "Use weak/unowned references where needed, inspect memory graph in Xcode, and check for closures capturing self strongly inside classes.",
            concepts: ["Retain Cycle Detection", "Memory Debugging", "Closures", "Xcode Memory Graph"]
        },
        {
            question: "Explain protocol-oriented programming in Swift and how it improves code flexibility.",
            answer: "Swift encourages defining behavior with protocols and default implementations in extensions. It enables composition over inheritance and reduces coupling.",
            concepts: ["Protocol-Oriented Programming (POP)", "Composition over Inheritance", "Swift Protocols", "Code Flexibility"]
        },
        {
            question: "What are the differences between synchronous, asynchronous, and concurrent tasks in Swift?",
            answer: "Synchronous tasks block execution; asynchronous tasks run in background with completion handlers; concurrent tasks allow multiple units of work to execute in parallel safely.",
            concepts: ["Synchronous vs Asynchronous", "Concurrency Models", "Task Execution", "Swift"]
        },
        {
            question: "Explain how Core Data handles multithreading and data consistency.",
            answer: "Core Data uses managed object contexts tied to threads/queues. Changes are propagated via parent-child contexts or notifications, ensuring thread-safe operations and consistency.",
            concepts: ["Core Data", "Multithreading", "Managed Object Context", "Data Consistency"]
        },
    ],
    Cybersecurity: [
        {
            question: "Explain the differences between AES and RSA encryption and when to use each.",
            answer: "AES is symmetric, fast, used for encrypting large data. RSA is asymmetric, slower, used for key exchange and digital signatures. Often combined in hybrid encryption for secure communication.",
            concepts: ["Cryptography", "AES (Symmetric)", "RSA (Asymmetric)", "Encryption Algorithms"]
        },
        {
            question: "How would you prevent SQL injection, XSS, and CSRF in a web application?",
            answer: "Use parameterized queries/ORMs for SQL injection, sanitize/escape input for XSS, implement anti-CSRF tokens for CSRF, and apply Content Security Policy (CSP).",
            concepts: ["Web Security", "SQL Injection", "Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)"]
        },
        {
            question: "Describe the steps of a TCP SYN flood attack and mitigation strategies.",
            answer: "Attacker sends many SYN packets to exhaust server's connection table. Mitigate with SYN cookies, rate limiting, firewalls, and load balancers.",
            concepts: ["Denial of Service (DoS)", "TCP SYN Flood", "Network Security", "Mitigation Strategies"]
        },
        {
            question: "Explain the difference between a symmetric key exchange and asymmetric key exchange in TLS handshake.",
            answer: "TLS handshake uses asymmetric encryption to exchange a symmetric session key securely. Asymmetric ensures safe key exchange; symmetric ensures fast encryption for data transmission.",
            concepts: ["TLS / SSL", "Key Exchange", "Symmetric vs Asymmetric", "Secure Communication"]
        },
        {
            question: "What is a timing attack, and how can you prevent it?",
            answer: "A timing attack exploits variable response times to infer secrets. Prevent with constant-time algorithms, proper padding, and avoiding data-dependent branches.",
            concepts: ["Side-Channel Attacks", "Timing Attacks", "Cryptographic Defenses", "Constant-Time Algorithms"]
        },
        {
            question: "Explain the differences between black-box, white-box, and gray-box penetration testing.",
            answer: "Black-box testers have no internal knowledge, white-box testers have full knowledge, gray-box testers have partial knowledge. Approach affects scope, depth, and methodology.",
            concepts: ["Penetration Testing", "Black-box Testing", "White-box Testing", "Security Assessment"]
        },
        {
            question: "Describe how a man-in-the-middle attack can compromise TLS and how certificate pinning mitigates it.",
            answer: "MITM can intercept TLS by substituting certificates. Pinning certificates in the client ensures only trusted certificates are accepted, preventing interception.",
            concepts: ["Man-In-The-Middle (MITM)", "TLS Interception", "Certificate Pinning", "Network Security"]
        },
        {
            question: "Explain what a buffer overflow is and how modern systems prevent it.",
            answer: "Buffer overflow occurs when memory bounds are exceeded, overwriting adjacent memory. Prevented with stack canaries, ASLR, DEP, and safe languages/runtime checks.",
            concepts: ["Buffer Overflow", "Memory Safety", "ASLR / DEP", "Vulnerability Mitigation"]
        },
        {
            question: "What are side-channel attacks and examples of how to mitigate them?",
            answer: "Side-channel attacks exploit indirect info (timing, power, cache). Mitigation includes constant-time algorithms, noise introduction, and hardware-level defenses.",
            concepts: ["Side-Channel Attacks", "Hardware Vulnerabilities", "Cryptanalysis", "Security Mitigation"]
        },
        {
            question: "Describe the security risks of OAuth 2.0 implicit flow and why PKCE is preferred.",
            answer: "Implicit flow exposes tokens to the browser, vulnerable to interception. PKCE adds code challenge and verifier to secure public clients.",
            concepts: ["OAuth 2.0", "Authentication Flows", "PKCE", "Identity & Access Management"]
        },
    ],
    DevOps: [
        {
            question: "Explain the difference between blue-green and canary deployments, and when to use each.",
            answer: "Blue-green switches all traffic instantly between environments; canary routes a small percentage to the new version. Use blue-green for zero-downtime, canary for risk-controlled rollouts with real-user monitoring.",
            concepts: ["Deployment Strategies", "Blue-Green Deployment", "Canary Rollout", "Continuous Delivery"]
        },
        {
            question: "How does Kubernetes handle pod scaling and self-healing?",
            answer: "Horizontal Pod Autoscaler (HPA) scales pods based on CPU/memory metrics. The kubelet and controller manager monitor pod health, restarting failed pods and rescheduling them on healthy nodes.",
            concepts: ["Kubernetes", "Autoscaling", "Self-Healing", "Container Orchestration"]
        },
        {
            question: "Describe Infrastructure as Code (IaC) and name tools for managing it with version control.",
            answer: "IaC defines infrastructure via code (declarative/imperative). Tools: Terraform (declarative), Pulumi (imperative), Ansible (configuration). Store in Git for versioning, reviews, and rollbacks.",
            concepts: ["Infrastructure as Code (IaC)", "Terraform / Ansible", "Version Control", "Automation"]
        },
        {
            question: "Explain CI/CD pipeline stages and how to implement rollback strategies.",
            answer: "Stages: build, test, deploy, monitor. Rollback: versioned artifacts, feature flags, database migrations with down scripts, or revert to previous deployment in immutable infrastructure.",
            concepts: ["CI/CD Pipelines", "Rollback Strategies", "Software Lifecycle", "Automation"]
        },
        {
            question: "How do you monitor and alert on infrastructure health in a cloud environment?",
            answer: "Use Prometheus/Grafana for metrics, ELK/EFK for logs, CloudWatch/DataDog for cloud-native. Set up alerts on thresholds (CPU, latency, error rates) via PagerDuty or OpsGenie.",
            concepts: ["Monitoring & Alerting", "Observability", "Prometheus / Grafana", "Cloud Infrastructure"]
        },
        {
            question: "What is GitOps and how does it improve deployment reliability?",
            answer: "GitOps uses Git as the single source of truth for declarative infrastructure and application config. Tools like ArgoCD/Flux sync cluster state with Git, enabling audit trails and automated rollbacks.",
            concepts: ["GitOps", "Declarative Configuration", "Deployment Reliability", "ArgoCD / Flux"]
        },
        {
            question: "Explain container orchestration vs. serverless, and trade-offs in cost and management.",
            answer: "Orchestration (Kubernetes) manages containers at scale; serverless (AWS Lambda) abstracts infrastructure. Serverless reduces ops overhead but has cold starts and vendor lock-in; orchestration offers control but higher complexity.",
            concepts: ["Container Orchestration", "Serverless Architecture", "Cloud Computing Costs", "Infrastructure Management"]
        },
        {
            question: "How would you secure a CI/CD pipeline against supply chain attacks?",
            answer: "Sign artifacts, use SLSA framework, enforce least-privilege IAM, scan dependencies (SBOM), require code reviews, and use in-toto for attestation and verification.",
            concepts: ["DevSecOps", "Supply Chain Security", "CI/CD Hardening", "SBOM (Software Bill of Materials)"]
        },
        {
            question: "Describe chaos engineering principles and a tool to implement it.",
            answer: "Chaos engineering tests system resilience by injecting failures. Tool: Chaos Monkey (Netflix) randomly terminates instances; Gremlin for controlled experiments on network, CPU, etc.",
            concepts: ["Chaos Engineering", "System Resilience", "Failure Injection", "Chaos Monkey"]
        },
        {
            question: "How do you manage secrets in a Kubernetes cluster securely?",
            answer: "Use Kubernetes Secrets (base64-encoded), integrate with HashiCorp Vault, AWS Secrets Manager, or Sealed Secrets. Avoid hardcoding; rotate regularly and audit access.",
            concepts: ["Secrets Management", "Kubernetes Security", "HashiCorp Vault", "Data Encryption"]
        },
    ],
    Database: [
        {
            question: "Explain the CAP theorem and how NoSQL databases like Cassandra achieve AP over CP.",
            answer: "CAP: Consistency, Availability, Partition tolerance—pick two. Cassandra prioritizes AP with eventual consistency, tunable consistency per query, and replication across nodes.",
            concepts: ["CAP Theorem", "NoSQL", "Eventual Consistency", "Distributed Systems"]
        },
        {
            question: "How do ACID transactions differ from BASE in database design?",
            answer: "ACID (Atomicity, Consistency, Isolation, Durability) ensures strong guarantees; BASE (Basically Available, Soft state, Eventual consistency) favors availability and scalability in distributed systems.",
            concepts: ["ACID Properties", "BASE Model", "Database Transactions", "Distributed Databases"]
        },
        {
            question: "Describe database sharding strategies and when to use each.",
            answer: "Range sharding (by ID range), hash sharding (consistent hashing), directory-based. Use range for time-series, hash for even distribution, directory for dynamic resharding.",
            concepts: ["Database Sharding", "Horizontal Scaling", "Partitioning Strategies", "Data Distribution"]
        },
        {
            question: "Explain indexing in relational databases and trade-offs with write performance.",
            answer: "Indexes speed up reads via B-trees or hash structures. Trade-off: slower writes (index updates), increased storage, and potential index bloat. Use selectively on frequent query columns.",
            concepts: ["Database Indexing", "Query Optimization", "B-Trees", "Read/Write Trade-offs"]
        },
        {
            question: "How does read replication improve scalability, and what are consistency challenges?",
            answer: "Replicas handle read traffic, reducing primary load. Challenges: replication lag leading to stale reads; mitigate with read-your-writes or strong consistency settings.",
            concepts: ["Read Replication", "Database Scalability", "Replication Lag", "Data Consistency"]
        },
        {
            question: "What are database connection pools and why are they critical in web applications?",
            answer: "Pools reuse DB connections to avoid overhead of creating/tearing down. Critical to limit connections, prevent exhaustion, and maintain performance under load.",
            concepts: ["Connection Pooling", "Resource Management", "Database Performance", "Web Application Architecture"]
        },
        {
            question: "Explain normalization vs. denormalization and use cases in modern apps.",
            answer: "Normalization reduces redundancy (3NF); denormalization duplicates data for read speed (e.g., in analytics, caching). Use normalization for OLTP, denormalization for OLAP or NoSQL.",
            concepts: ["Normalization", "Denormalization", "Schema Design", "OLTP vs OLAP"]
        },
        {
            question: "How do you optimize slow SQL queries using EXPLAIN and indexing?",
            answer: "Run EXPLAIN to analyze query plan (scans vs. seeks). Add covering indexes, avoid SELECT *, use WHERE on indexed columns, and rewrite joins/subqueries.",
            concepts: ["Query Optimization", "EXPLAIN Plan", "Covering Indexes", "SQL Performance"]
        },
        {
            question: "Describe multi-tenancy database patterns: shared DB, schema per tenant, DB per tenant.",
            answer: "Shared: all tenants in one DB (cheapest, complex filtering). Schema: separate schemas (isolation). DB per tenant: full isolation (costly, scalable).",
            concepts: ["Multi-Tenancy", "Database Isolation", "SaaS Architecture", "Schema Design"]
        },
        {
            question: "What are database migrations and how do you ensure zero-downtime during schema changes?",
            answer: "Migrations evolve schema via scripts. Zero-downtime: add columns (nullable), backfill data, use triggers/views, then drop old structures in phases.",
            concepts: ["Database Migrations", "Schema Evolution", "Zero-Downtime Deployments", "Data Modeling"]
        },
    ],
    Design: [
        {
            question: "Explain the difference between product design and graphic design, and how they work together.",
            answer: "Product design focuses on functionality and user experience; graphic design focuses on visuals and branding. They collaborate via prototypes, branding guidelines, and visual storytelling.",
            concepts: ["Product Design", "Graphic Design", "UX/UI", "Brand Identity"]
        },
        {
            question: "How do you conduct research to validate a design concept before implementation?",
            answer: "Use surveys, interviews, market research, usability testing, and feedback sessions. Create personas and journey maps to align designs with user and business needs.",
            concepts: ["User Research", "Usability Testing", "Personas", "Design Validation"]
        },
        {
            question: "Describe accessibility (a11y) best practices in design.",
            answer: "Ensure readability, proper contrast, scalable typography, semantic structure, keyboard navigation, and testing for visual and cognitive accessibility.",
            concepts: ["Accessibility (a11y)", "Inclusive Design", "WCAG Standards", "Contrast & Typography"]
        },
        {
            question: "What are design systems and how do they improve consistency and efficiency?",
            answer: "Reusable components, guidelines, and tokens (colors, spacing, typography). Tools: Figma, Storybook. Enforce consistency, reduce redesign, and speed up production.",
            concepts: ["Design Systems", "Component Libraries", "Design Consistency", "Figma / Storybook"]
        },
        {
            question: "Explain Fitts’s Law and how it applies to designing interactive elements.",
            answer: "Time to interact depends on distance and size. Apply by making frequent actions large and accessible, reducing effort and improving usability.",
            concepts: ["Fitts's Law", "Interaction Design", "UX Principles", "Usability"]
        },
        {
            question: "How do you design for multiple themes or environments while maintaining brand identity?",
            answer: "Define adaptable color palettes, typography, and elements; use variables; test contrast and readability; ensure brand recognition in all contexts.",
            concepts: ["Theming", "Design Tokens", "Brand Consistency", "Responsive Design"]
        },
        {
            question: "What is Hick’s Law and how can it simplify design decision-making?",
            answer: "Decision time increases with the number of choices. Simplify by prioritizing actions, grouping options, and progressive disclosure to reduce cognitive load.",
            concepts: ["Hick's Law", "Cognitive Load", "User Decision Making", "Simplification"]
        },
        {
            question: "Describe the double diamond design process and its phases.",
            answer: "Discover (research), Define (problem), Develop (ideate solutions), Deliver (prototype/test). Divergent/convergent thinking ensures user-centered and effective designs.",
            concepts: ["Double Diamond Process", "Design Thinking", "Divergent / Convergent Thinking", "Prototyping"]
        },
        {
            question: "How do you measure the success of a design using metrics and feedback?",
            answer: "Metrics: adoption rate, error rate, time to complete tasks. Feedback: surveys, interviews, usability tests. Combine quantitative and qualitative data for insights.",
            concepts: ["Design Metrics", "UX Analytics", "Quantitative vs Qualitative", "Success Measurement"]
        },
        {
            question: "Explain micro-interactions and their role in enhancing design.",
            answer: "Small interactive details (like hover effects, loading indicators). They provide feedback, guide users, and make the experience engaging without distraction.",
            concepts: ["Micro-interactions", "User Feedback", "Interactive Design", "UX Enhancements"]
        },
    ],
    Management: [
        {
            question: "How do you estimate project timelines and manage scope creep?",
            answer: "Break into tasks, use historical velocity, add buffers. Prevent scope creep with change control boards, clear requirements, and prioritized backlogs.",
            concepts: ["Project Estimation", "Scope Management", "Agile Velocity", "Backlog Prioritization"]
        },
        {
            question: "Explain Agile vs. Waterfall methodologies and when to use each.",
            answer: "Agile: iterative, flexible, customer feedback. Waterfall: linear, fixed scope. Use Agile for software, Waterfall for construction or regulated industries.",
            concepts: ["Agile", "Waterfall", "Software Development Life Cycle (SDLC)", "Project Management Methodologies"]
        },
        {
            question: "How do you handle underperforming team members while maintaining morale?",
            answer: "Private 1:1s, clear expectations, coaching, PIP if needed. Focus on growth, recognize improvements, and avoid public criticism.",
            concepts: ["People Management", "Performance Improvement", "1:1 Coaching", "Team Morale"]
        },
        {
            question: "Describe OKRs and how they align teams with company goals.",
            answer: "Objectives (what), Key Results (measurable how). Cascade from company to team to individual, reviewed quarterly for focus and accountability.",
            concepts: ["OKRs (Objectives and Key Results)", "Goal Alignment", "Performance Measurement", "Organizational Strategy"]
        },
        {
            question: "How do you run effective retrospectives to improve team processes?",
            answer: "Safe space, gather data (metrics, feedback), generate insights, decide actions, assign owners. Use formats like Start/Stop/Continue or 4Ls.",
            concepts: ["Agile Retrospectives", "Continuous Improvement", "Feedback Loops", "Team Processes"]
        },
        {
            question: "Explain technical debt and strategies to manage it without halting features.",
            answer: "Accumulated suboptimal code. Manage with dedicated sprints, refactor in feature work (boy scout rule), track via sonar, and prioritize in backlog.",
            concepts: ["Technical Debt", "Refactoring", "Code Quality", "Sprint Planning"]
        },
        {
            question: "How do you foster psychological safety in engineering teams?",
            answer: "Encourage questions, admit mistakes, blameless postmortems, inclusive meetings, and recognize effort over outcome to promote learning.",
            concepts: ["Psychological Safety", "Engineering Culture", "Blameless Culture", "Team Dynamics"]
        },
        {
            question: "Describe stakeholder management techniques for conflicting priorities.",
            answer: "RICE/ICE scoring, MoSCoW prioritization, regular syncs, transparent backlogs, and data-driven decisions to align on business value.",
            concepts: ["Stakeholder Management", "Prioritization Frameworks (RICE / MoSCoW)", "Cross-functional Alignment", "Data-Driven Decisions"]
        },
        {
            question: "How do you measure engineering team productivity beyond lines of code?",
            answer: "Cycle time, deployment frequency, change failure rate (DORA metrics), feature usage, customer satisfaction, and team health surveys.",
            concepts: ["Engineering Metrics", "DORA Metrics", "Cycle Time", "Team Productivity"]
        },
        {
            question: "Explain cross-functional team structures and how to resolve dependencies.",
            answer: "Include eng, design, PM, QA. Use interface contracts, async communication, shared goals, and dependency mapping to reduce blockers.",
            concepts: ["Cross-Functional Teams", "Dependency Management", "Collaboration", "Organizational Design"]
        },
    ],
    Testing: [
        {
            question: "Explain the testing pyramid and why unit tests form the base.",
            answer: "Unit (many, fast), integration (fewer), UI/E2E (fewest, slow). Unit tests are cheap, fast, and catch most bugs early in development.",
            concepts: ["Testing Pyramid", "Unit Testing", "Test Strategy", "Cost of Bugs"]
        },
        {
            question: "How do contract tests differ from integration tests, and when to use Pact?",
            answer: "Contract tests verify API provider-consumer agreements; integration tests run full systems. Use Pact for microservices to test independently.",
            concepts: ["Contract Testing", "Integration Testing", "Microservices", "Pact"]
        },
        {
            question: "Describe property-based testing and a library to implement it.",
            answer: "Generate random inputs to test properties (e.g., reverse(reverse(s)) === s). Libraries: JSVerify (JS), Hypothesis (Python), QuickCheck (Haskell).",
            concepts: ["Property-Based Testing", "Generative Testing", "Test Automation", "Edge Case Discovery"]
        },
        {
            question: "What are mocking, stubbing, and spying in unit tests, and when to use each?",
            answer: "Mock: fake with behavior verification. Stub: predefined responses. Spy: records calls. Use mocks for external deps, stubs for determinism, spies for interaction checks.",
            concepts: ["Test Doubles", "Mocking", "Stubbing", "Spying"]
        },
        {
            question: "Explain mutation testing and how it improves test suite quality.",
            answer: "Mutate code and check if tests fail. High mutation score means robust tests. Tools: Stryker (JS), PIT (Java). Reveals weak assertions.",
            concepts: ["Mutation Testing", "Test Suite Quality", "Assertion Strength", "Stryker"]
        },
        {
            question: "How do you achieve high test coverage without sacrificing maintainability?",
            answer: "Focus on critical paths, avoid testing internals, use TDD/BDD, refactor tests with code, and set coverage thresholds with exclusions for generated code.",
            concepts: ["Test Coverage", "Test Maintainability", "Black-Box Testing", "Code Quality"]
        },
        {
            question: "Describe end-to-end testing with Cypress or Playwright and flakiness mitigation.",
            answer: "Simulate user flows in real browser. Mitigate flakiness: waits (not sleeps), retries, deterministic setup (seeding DB), and CI isolation.",
            concepts: ["End-to-End (E2E) Testing", "Cypress / Playwright", "Test Flakiness", "Browser Automation"]
        },
        {
            question: "What is test-driven development (TDD) and its red-green-refactor cycle?",
            answer: "Write failing test (red), make it pass (green), refactor code/tests. Ensures design emerges from requirements and maintains 100% coverage.",
            concepts: ["Test-Driven Development (TDD)", "Red-Green-Refactor", "Software Design", "Test-First Approach"]
        },
        {
            question: "Explain accessibility testing tools and how to integrate them in CI.",
            answer: "Tools: axe-core, pa11y, Lighthouse. Run in CI via CLI, fail builds on violations, and combine with manual screen reader testing.",
            concepts: ["Accessibility Testing", "CI/CD Integration", "axe-core", "Automated a11y Audits"]
        },
        {
            question: "How do you test microservices in isolation and as a system?",
            answer: "Isolation: contract tests, mocks. System: deploy to staging, run E2E via Postman/Newman or Canary. Use consumer-driven contracts for confidence.",
            concepts: ["Microservices Testing", "System Testing", "Isolation", "Consumer-Driven Contracts"]
        },
    ],
};
