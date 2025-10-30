export const postsData = [
  {
    userEmail: "candidate@example.com",
    content: "Excited to start my new project using Next.js and Tailwind CSS!",
    imageUrl: null,
    likes: 5,
    comments: [
      {
        commenterEmail: "recruiter@example.com",
        content: "Looks great! Keep us posted on your progress.",
      },
      {
        commenterEmail: "dev@example.com",
        content: "Can't wait to see the final results!",
      },
    ],
    createdAt: new Date("2025-03-01T10:00:00Z"),
  },
  {
    userEmail: "recruiter@example.com",
    content: "We are hiring frontend and backend engineers. Apply now!",
    imageUrl: null,
    likes: 8,
    comments: [
      {
        commenterEmail: "candidate@example.com",
        content: "Excited to apply!",
      },
    ],
    createdAt: new Date("2025-03-02T09:00:00Z"),
  },
];
