// Technical summaries grounded in GitHub, the resume, and user-confirmed design details.
// Research provenance stays in CASE-STUDY-SOURCES.md, outside the visitor-facing pages.
const caseStudies = {
  "glancear": {
    title: "GlanceAR",
    label: "Event networking · Team prototype",
    flow: [
      "Opt-in event",
      "Recognize & pair",
      "Conversation",
      "Recap & follow-up"
    ],
    architecture: "React Native and Expo provide the event interface. Convex coordinates profiles, participant permissions, pairing, conversations and messages. Browser recognition runs locally; backend actions connect captured audio to Meta transcription and conversation summaries. Stored profile information supplies topics for an introduction.",
    techStack: [
      [
        "Application",
        "React Native · Expo"
      ],
      [
        "Backend & state",
        "Convex"
      ],
      [
        "Browser recognition",
        "face-api · TensorFlow.js"
      ],
      [
        "Conversation processing",
        "Meta speech-to-text · Meta text models"
      ]
    ],
    features: [
      "Opt-in face scans associate a recognized attendee with their profile and relevant talking points.",
      "Mutual sighting and gesture signals control entry into conversation mode; a unilateral signal must not start a session.",
      "Conversation recaps retain topics and next steps alongside the connection."
    ],
    challenges: [
      "Synchronizing agreement from two participants while handling delayed gestures, lost recognition and people looking away.",
      "Defining a useful match score from profile information without allowing a high score to bypass mutual agreement.",
      "Keeping conversation behavior consistent across browser and native capture paths with different camera and audio capabilities."
    ],
    takeaway: "Model multi-user interactions as explicit state transitions. Specify which signals authorize each transition, how long those signals remain valid, and what happens when either participant disconnects."
  },
  "signvision": {
    title: "SignVision",
    label: "Computer vision · Accessibility",
    flow: [
      "Camera → Python",
      "YOLO → crop regions",
      "Crops → Gemini",
      "AR overlay + audio"
    ],
    architecture: "Camera frames enter a Python pipeline. YOLO localizes objects, and the detected pixel regions are cropped before being sent to Gemini for contextual interpretation. The results return as labels over the camera feed and spoken alerts. Cropping limits the image content sent to Gemini rather than asking it to process every full frame.",
    techStack: [
      [
        "Camera & overlays",
        "JavaScript · HTML/CSS"
      ],
      [
        "Detection pipeline",
        "Python · Flask · YOLO"
      ],
      [
        "Context & speech",
        "Gemini API · Google Cloud Text-to-Speech"
      ],
      [
        "Deployment",
        "Vercel"
      ]
    ],
    features: [
      "YOLO bounding regions determine which pixels are passed to Gemini.",
      "Contextual labels are overlaid on the live camera feed and paired with audio feedback.",
      "The cropped-image path is designed to reduce token usage and response latency while retaining the information needed for accurate interpretation."
    ],
    challenges: [
      "Keeping labels attached to the correct object as the camera and objects move between frames.",
      "Distinguishing a newly encountered object from a fresh detection of an object already being tracked, so overlays and alerts remain stable.",
      "Reducing the image content sent for contextual inference while retaining enough surrounding detail for accurate interpretation."
    ],
    takeaway: "Optimize the whole interaction, from input capture to the feedback a user receives. Reduce unnecessary processing early in the pipeline, then evaluate responsiveness and output quality together so a faster component actually improves the experience."
  },
  "researchly": {
    title: "Researchly",
    label: "Research discovery · HackMIT",
    flow: [
      "Student context",
      "Lab retrieval",
      "Match",
      "Draft → refine → verify"
    ],
    architecture: "A Flask application combines student background with lab data for retrieval-augmented recommendations. Outreach then runs through an ADK LoopAgent with separate generation, refinement and verification agents. The loop permits at most five iterations.",
    techStack: [
      [
        "Web application",
        "Flask · JavaScript · HTML/CSS"
      ],
      [
        "Retrieval & matching",
        "Python · OpenAI agents · Web-search MCPs"
      ],
      [
        "Outreach orchestration",
        "Google ADK · LoopAgent"
      ]
    ],
    features: [
      "Student background and retrieved lab information provide context for matching.",
      "Email generation uses the student profile and recipient information rather than a generic outreach template.",
      "Separate agents generate, revise and check the draft inside a bounded loop."
    ],
    challenges: [
      "Matching varied student backgrounds to relevant labs using retrieved information that may be incomplete.",
      "Keeping outreach specific to the student and recipient while preventing unsupported details or generic placeholders.",
      "Balancing draft quality against the latency and cost of repeated agent revisions within a fixed iteration budget."
    ],
    takeaway: "Give automated workflows both a stopping rule and a separate quality check. A process finishing successfully should be distinguishable from its output meeting the requirements, especially when later steps depend on generated content."
  },
  "akpsi-gpt": {
    title: "AKPsi GPT",
    label: "Community software · Full stack",
    flow: [
      "Member question",
      "Flask",
      "Sheets + GPT-4o",
      "Answer + chat history"
    ],
    architecture: "A React interface sends member questions to a Flask backend. The backend retrieves directory information through the Google Sheets API and uses GPT-4o to answer questions. Preserved chat history carries context between turns; the interface also supports mobile use.",
    techStack: [
      [
        "Interface",
        "React · Mobile UI"
      ],
      [
        "Backend",
        "Python · Flask"
      ],
      [
        "Data & model",
        "Google Sheets API · GPT-4o"
      ],
      [
        "Deployment",
        "Heroku"
      ]
    ],
    features: [
      "Natural-language access to directory information covering 300+ chapter members.",
      "Preserved chat history supports follow-up questions within a conversation.",
      "A mobile interface makes directory queries available away from a desktop."
    ],
    challenges: [
      "Resolving follow-up references to people or earlier answers while retrieving the correct directory records.",
      "Keeping answers consistent with member data as conversation history accumulates across turns.",
      "Making a multi-turn query workflow usable on a small screen without losing the context needed for the next question."
    ],
    takeaway: "Design around the complete user journey, including follow-up questions and switching screen sizes. Preserving context and making the next action easy should be part of the core behavior, rather than a final interface polish pass."
  },
  "vantage": {
    title: "Vantage",
    label: "Recruiting intelligence · In development",
    flow: [
      "Job discoveries",
      "Canonical opening",
      "Recruiter research",
      "Outreach draft"
    ],
    architecture: "A Next.js frontend and Python worker share Supabase PostgreSQL, queues and operational metrics. A company registry provides offline scoring and user-controlled targeting. Ingestion turns source observations into canonical jobs; new jobs trigger recruiter research, evidence-backed ranking and outreach drafts. Provider interfaces separate external services from worker business logic.",
    techStack: [
      [
        "Web application",
        "Next.js · React · TypeScript"
      ],
      [
        "Worker",
        "Python · Pydantic"
      ],
      [
        "Storage & queues",
        "Supabase PostgreSQL · pgmq"
      ],
      [
        "External capabilities",
        "LLM · Search · Notification provider interfaces"
      ]
    ],
    features: [
      "A stored company registry supports precomputed scoring and user-controlled target selection.",
      "Source observations are grouped into canonical openings so each new job triggers one recruiter-research workflow.",
      "Recruiter evidence, ranking and outreach drafts share a traceable workflow, with operational metrics and queue-backed processing."
    ],
    challenges: [
      "Reconciling different URLs, titles and source records that refer to the same opening without merging genuinely different jobs.",
      "Preventing refreshed postings and repeated processing from creating duplicate research tasks or unnecessary model calls.",
      "Keeping recruiter details traceable to evidence when sources are incomplete or disagree."
    ],
    takeaway: "Define what counts as a new unit of work before automating it. Stable identities and explicit triggers keep repeated inputs and retries from multiplying downstream actions, making the product easier to operate and its costs easier to explain."
  },
  "sentiment-radar": {
    title: "Sentiment Radar",
    label: "Customer insights · Product prototype",
    flow: [
      "Regional snapshot",
      "Trend",
      "Probable cause",
      "Message drafts"
    ],
    architecture: "A Next.js dashboard renders regional sentiment snapshots on a Leaflet map. API routes read snapshots from Supabase and run a five-step workflow: retrieve data, analyze the trend, identify a probable cause, draft an internal message and draft a customer update. Resolution logs store the proposed response.",
    techStack: [
      [
        "Dashboard & API",
        "Next.js · React · TypeScript"
      ],
      [
        "Map",
        "Leaflet · React-Leaflet"
      ],
      [
        "Storage & sentiment",
        "Supabase PostgreSQL · HuggingFace API with fallback"
      ],
      [
        "Diagnosis",
        "Rule-based Nemotron workflow simulation"
      ]
    ],
    features: [
      "Regional map markers connect a sentiment snapshot to its diagnosis workflow.",
      "Trend analysis and proposed causes feed separate internal and customer-facing drafts.",
      "Snapshots refresh on a 30-second interval, and resolution logs retain the generated response."
    ],
    challenges: [
      "Comparing regional snapshots over time without treating a single low score as a sustained trend.",
      "Maintaining understandable results when the sentiment API is unavailable and fallback analysis is used.",
      "Presenting a probable cause and suggested response without making them appear to be a confirmed incident or an already-published update."
    ],
    takeaway: "Represent observations, interpretations and actions as separate states in decision-support products. This gives users a clear point to review uncertain results and leaves a record of how the information led to a proposed action."
  }
};
