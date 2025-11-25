export const notificationsData = [
    // Notifications for candidate@example.com
    {
        userEmail: "candidate@example.com",
        type: "new_follower",
        title: "New Follower",
        message: "Recruiter User started following you",
        isRead: true,
        createdAt: new Date("2025-11-20T10:00:00Z"),
    },
    {
        userEmail: "candidate@example.com",
        type: "new_follower",
        title: "New Follower",
        message: "Dev User started following you",
        isRead: true,
        createdAt: new Date("2025-11-21T14:30:00Z"),
    },
    {
        userEmail: "candidate@example.com",
        type: "post_comment",
        title: "New Comment",
        message: "Recruiter User commented on your post",
        isRead: false,
        createdAt: new Date("2025-11-23T09:15:00Z"),
    },
    {
        userEmail: "candidate@example.com",
        type: "chat_message",
        title: "New Message",
        message: "You have a new message from Recruiter User",
        isRead: false,
        createdAt: new Date("2025-11-24T08:00:00Z"),
    },

    // Notifications for recruiter@example.com
    {
        userEmail: "recruiter@example.com",
        type: "new_follower",
        title: "New Follower",
        message: "Candidate User started following you",
        isRead: true,
        createdAt: new Date("2025-11-20T11:00:00Z"),
    },
    {
        userEmail: "recruiter@example.com",
        type: "job_application",
        title: "New Job Application",
        message: "Candidate User applied to Frontend Developer position",
        isRead: false,
        createdAt: new Date("2025-11-22T16:45:00Z"),
    },
    {
        userEmail: "recruiter@example.com",
        type: "post_like",
        title: "Post Liked",
        message: "Candidate User liked your post",
        isRead: true,
        createdAt: new Date("2025-11-23T12:00:00Z"),
    },

    // Notifications for dev@example.com
    {
        userEmail: "dev@example.com",
        type: "new_follower",
        title: "New Follower",
        message: "Candidate User started following you",
        isRead: true,
        createdAt: new Date("2025-11-21T15:00:00Z"),
    },
    {
        userEmail: "dev@example.com",
        type: "post_comment",
        title: "New Comment",
        message: "Candidate User commented on your post",
        isRead: false,
        createdAt: new Date("2025-11-23T18:30:00Z"),
    },
];
