export type LegalInlineBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalInlineBlock[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  updated: "August 17, 2026",
  intro: [
    'This Privacy Policy explains how Exo ("we," "us," "the app") collects, uses, and protects your information.',
  ],
  sections: [
    {
      heading: "Information We Collect",
      blocks: [
        {
          type: "p",
          text: "**Account information:** name, email address, and password (or Google / Apple account information if you sign in with those providers).",
        },
        {
          type: "p",
          text: "**Health and fitness information you provide:** weight, height, age, gender, fitness goals, workout history, exercise logs, meal logs, nutritional targets, and progress data.",
        },
        {
          type: "p",
          text: "**Photos:** if you use the meal-scanning feature, we collect the photo you take of your food. These photos are processed by Google's Gemini AI to estimate nutritional content, and stored securely to display in your meal history.",
        },
        {
          type: "p",
          text: "**Technical information:** basic crash and error data (via Sentry) to help us fix bugs. This does not include your personal health data.",
        },
      ],
    },
    {
      heading: "How We Use Your Information",
      blocks: [
        {
          type: "p",
          text: "We use your information solely to provide the app's functionality: generating personalized workout plans, tracking your nutrition and fitness progress, and improving your experience. We do not sell your personal information to third parties, and we do not use your data for advertising.",
        },
      ],
    },
    {
      heading: "Third-Party Services",
      blocks: [
        {
          type: "p",
          text: "We use the following third-party services to operate the app:",
        },
        {
          type: "ul",
          items: [
            "**Google** — for optional sign-in, and for AI-powered food recognition (Gemini) when you use the meal scanner",
            "**Apple** — for optional Sign in with Apple on iOS",
            "**Resend** — to send account-related emails (verification, password reset, account deletion confirmation)",
            "**Vercel** — to host our backend and store meal photos",
            "**Neon** — to store your data in our database",
            "**Sentry** — to help us detect and fix app crashes (technical data only, not your personal health data)",
          ],
        },
        {
          type: "p",
          text: "Each of these providers has its own privacy practices governing how they handle data on our behalf.",
        },
      ],
    },
    {
      heading: "Data Retention and Deletion",
      blocks: [
        {
          type: "p",
          text: "You can delete your account at any time from Profile → Delete Account. When you do, your account and all associated data (workouts, meals, weight logs, and progress) are permanently deleted from our systems, with the exception of technical logs that may briefly persist for security purposes before automatically expiring.",
        },
      ],
    },
    {
      heading: "Your Rights",
      blocks: [
        {
          type: "p",
          text: "You can access, correct, or delete your data at any time through Profile in the app.",
        },
      ],
    },
    {
      heading: "Children's Privacy",
      blocks: [
        {
          type: "p",
          text: "Exo is not intended for children under 13 (or the relevant age of consent in your region). We do not knowingly collect data from children.",
        },
      ],
    },
    {
      heading: "Changes to This Policy",
      blocks: [
        {
          type: "p",
          text: "We may update this policy from time to time. We'll notify you of significant changes within the app.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        {
          type: "p",
          text: "Questions about this policy? Review or delete your data from Profile in the app.",
        },
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  updated: "August 17, 2026",
  intro: ["By using Exo, you agree to these terms."],
  sections: [
    {
      heading: "Using Exo",
      blocks: [
        {
          type: "p",
          text: "Exo provides workout planning, nutrition tracking, and fitness progress tools. You must be at least 13 years old (or the applicable age in your region) to use the app.",
        },
      ],
    },
    {
      heading: "Not Medical Advice",
      blocks: [
        {
          type: "p",
          text: "Exo provides general fitness and nutrition guidance based on the information you provide. It is not medical advice. Consult a doctor before starting any new exercise or diet program, especially if you have a pre-existing health condition. Nutritional targets and workout suggestions are estimates, not personalized medical recommendations.",
        },
      ],
    },
    {
      heading: "Your Account",
      blocks: [
        {
          type: "p",
          text: "You're responsible for keeping your login credentials secure. You're responsible for the accuracy of the information you provide (weight, goals, health information) — the app's recommendations are only as good as the data you give it.",
        },
      ],
    },
    {
      heading: "Acceptable Use",
      blocks: [
        {
          type: "p",
          text: "Don't use Exo to upload harmful, illegal, or abusive content, including through the meal-photo scanner. We reserve the right to suspend accounts that misuse the service.",
        },
      ],
    },
    {
      heading: "Disclaimers",
      blocks: [
        {
          type: "p",
          text: 'Exo is provided "as is." We work hard to keep it accurate and reliable, but we don\'t guarantee the app will be error-free or that workout/nutrition suggestions will produce specific results. Use of the app, including any exercise performed based on its suggestions, is at your own risk.',
        },
      ],
    },
    {
      heading: "Changes to the Service",
      blocks: [
        {
          type: "p",
          text: "We may update, modify, or discontinue features of the app over time.",
        },
      ],
    },
    {
      heading: "Termination",
      blocks: [
        {
          type: "p",
          text: "You can delete your account at any time. We may suspend or terminate accounts that violate these terms.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        {
          type: "p",
          text: "Questions about these terms? Review or delete your account from Profile in the app.",
        },
      ],
    },
  ],
};
