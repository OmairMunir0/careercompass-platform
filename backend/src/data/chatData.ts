export const chatData = [
  {
    recruiterEmail: "recruiter@example.com",
    candidateEmail: "candidate@example.com",
    messages: [
      {
        senderType: "recruiter",
        content:
          "Hi there! I saw your profile and think you'd be a great fit for our frontend developer position.",
        isRead: true,
        createdAt: new Date("2025-01-10T09:00:00Z"),
      },
      {
        senderType: "candidate",
        content: "Hi! Thanks for reaching out. I’d love to hear more about the role.",
        isRead: true,
        createdAt: new Date("2025-01-10T09:05:00Z"),
      },
      {
        senderType: "recruiter",
        content: "Perfect. Can we schedule a quick call this week to discuss the details?",
        isRead: false,
        createdAt: new Date("2025-01-10T09:10:00Z"),
      },
    ],
  },
];
