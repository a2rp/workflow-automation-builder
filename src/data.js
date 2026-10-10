export const nodeTypes = [
    { type: "trigger", label: "Trigger", hint: "Start this workflow", icon: "bolt" },
    { type: "condition", label: "Condition", hint: "Add a decision", icon: "branch" },
    { type: "action", label: "Action", hint: "Do something", icon: "play" },
    { type: "delay", label: "Wait", hint: "Pause the sequence", icon: "clock" },
];

export const makeStarterNodes = (triggerName = "New form submission") => [
    {
        id: "step-trigger",
        type: "trigger",
        app: "Webhook",
        title: triggerName,
        detail: "When a new record arrives",
        config: "Inbound form",
    },
];

export const initialWorkflows = [
    {
        id: "flow-101",
        name: "Lead intake and routing",
        status: "Active",
        updatedAt: "2026-10-11T08:24:00",
        runs: 482,
        owner: "You",
        nodes: [
            { id: "n-101", type: "trigger", app: "Webflow", title: "New form submission", detail: "Inbound lead form", config: "Lead capture form" },
            { id: "n-102", type: "condition", app: "Rules", title: "Score is above 70", detail: "Continue only for qualified leads", config: "Lead score > 70" },
            { id: "n-103", type: "action", app: "HubSpot", title: "Create or update contact", detail: "Add lead to the sales pipeline", config: "Lifecycle stage: Lead" },
            { id: "n-104", type: "action", app: "Slack", title: "Notify sales team", detail: "Post a summary in #new-leads", config: "#new-leads" },
        ],
    },
    {
        id: "flow-102",
        name: "Trial welcome sequence",
        status: "Active",
        updatedAt: "2026-10-10T15:40:00",
        runs: 236,
        owner: "You",
        nodes: [
            { id: "n-201", type: "trigger", app: "Stripe", title: "New trial starts", detail: "A new subscription enters trial", config: "Trial subscription" },
            { id: "n-202", type: "delay", app: "Wait", title: "Wait 20 minutes", detail: "Give the account time to finish setup", config: "20 minutes" },
            { id: "n-203", type: "action", app: "Customer.io", title: "Send welcome email", detail: "Share the getting started guide", config: "Welcome to your trial" },
        ],
    },
    {
        id: "flow-103",
        name: "Overdue invoice reminder",
        status: "Active",
        updatedAt: "2026-10-10T11:05:00",
        runs: 118,
        owner: "Maya Chen",
        nodes: [
            { id: "n-301", type: "trigger", app: "Stripe", title: "Invoice becomes overdue", detail: "A payment passes its due date", config: "Invoice status: overdue" },
            { id: "n-302", type: "condition", app: "Rules", title: "Balance is over $100", detail: "Skip small balances", config: "Amount due > $100" },
            { id: "n-303", type: "action", app: "Gmail", title: "Email account owner", detail: "Send a friendly payment reminder", config: "Billing reminder" },
        ],
    },
    {
        id: "flow-104",
        name: "Friday usage digest",
        status: "Paused",
        updatedAt: "2026-10-09T16:18:00",
        runs: 64,
        owner: "You",
        nodes: [
            { id: "n-401", type: "trigger", app: "Schedule", title: "Every Friday at 9 AM", detail: "Run weekly in your workspace timezone", config: "Friday, 9:00 AM" },
            { id: "n-402", type: "action", app: "PostgreSQL", title: "Collect workspace activity", detail: "Summarize active accounts", config: "Last 7 days" },
            { id: "n-403", type: "action", app: "Slack", title: "Send weekly digest", detail: "Post the digest in #customer-success", config: "#customer-success" },
        ],
    },
    {
        id: "flow-105",
        name: "New support issue triage",
        status: "Draft",
        updatedAt: "2026-10-08T09:12:00",
        runs: 0,
        owner: "You",
        nodes: [
            { id: "n-501", type: "trigger", app: "Linear", title: "New issue is created", detail: "Watch the support project", config: "SUP project" },
            { id: "n-502", type: "condition", app: "Rules", title: "Priority is urgent", detail: "Route urgent issues first", config: "Priority = Urgent" },
        ],
    },
    {
        id: "flow-106",
        name: "Renewal heads-up",
        status: "Active",
        updatedAt: "2026-10-07T13:32:00",
        runs: 92,
        owner: "Maya Chen",
        nodes: [
            { id: "n-601", type: "trigger", app: "HubSpot", title: "Renewal is 30 days away", detail: "Check active customer contracts", config: "Renewal date in 30 days" },
            { id: "n-602", type: "action", app: "Slack", title: "Send account briefing", detail: "Notify the account owner", config: "#renewals" },
            { id: "n-603", type: "action", app: "Asana", title: "Create renewal task", detail: "Add a task to the renewal board", config: "Renewal preparation" },
        ],
    },
];

export const templates = [
    {
        id: "tpl-lead-routing",
        name: "Qualify and route a new lead",
        category: "Sales",
        description: "Score new leads, add qualified people to your CRM, and alert the right sales channel.",
        apps: ["Webflow", "HubSpot", "Slack"],
        nodes: [
            { type: "trigger", app: "Webflow", title: "New form submission", detail: "Inbound lead form", config: "Lead capture form" },
            { type: "condition", app: "Rules", title: "Score is above 70", detail: "Continue for qualified leads", config: "Lead score > 70" },
            { type: "action", app: "HubSpot", title: "Create or update contact", detail: "Add to sales pipeline", config: "Lifecycle stage: Lead" },
            { type: "action", app: "Slack", title: "Notify sales team", detail: "Post in #new-leads", config: "#new-leads" },
        ],
    },
    {
        id: "tpl-trial-onboarding",
        name: "Welcome a new trial account",
        category: "Customer success",
        description: "Wait for signup activity to settle, then send a relevant getting started message.",
        apps: ["Stripe", "Customer.io"],
        nodes: [
            { type: "trigger", app: "Stripe", title: "New trial starts", detail: "A subscription enters trial", config: "Trial subscription" },
            { type: "delay", app: "Wait", title: "Wait 20 minutes", detail: "Allow setup to finish", config: "20 minutes" },
            { type: "action", app: "Customer.io", title: "Send welcome email", detail: "Share the getting started guide", config: "Welcome to your trial" },
        ],
    },
    {
        id: "tpl-invoice-followup",
        name: "Follow up on an overdue invoice",
        category: "Finance",
        description: "Send a measured reminder for invoices that need attention and meet your balance threshold.",
        apps: ["Stripe", "Gmail"],
        nodes: [
            { type: "trigger", app: "Stripe", title: "Invoice becomes overdue", detail: "Payment passes its due date", config: "Invoice status: overdue" },
            { type: "condition", app: "Rules", title: "Balance is over $100", detail: "Skip small balances", config: "Amount due > $100" },
            { type: "action", app: "Gmail", title: "Email account owner", detail: "Send a friendly reminder", config: "Billing reminder" },
        ],
    },
    {
        id: "tpl-weekly-digest",
        name: "Share a weekly team digest",
        category: "Productivity",
        description: "Collect activity once a week and share a short summary with the team.",
        apps: ["Schedule", "PostgreSQL", "Slack"],
        nodes: [
            { type: "trigger", app: "Schedule", title: "Every Friday at 9 AM", detail: "Run weekly", config: "Friday, 9:00 AM" },
            { type: "action", app: "PostgreSQL", title: "Collect workspace activity", detail: "Summarize the past week", config: "Last 7 days" },
            { type: "action", app: "Slack", title: "Send weekly digest", detail: "Post in #team-updates", config: "#team-updates" },
        ],
    },
    {
        id: "tpl-issue-triage",
        name: "Route urgent support issues",
        category: "Support",
        description: "Watch a support project, recognize urgent work, and send it to the team that can respond.",
        apps: ["Linear", "Slack", "Asana"],
        nodes: [
            { type: "trigger", app: "Linear", title: "New issue is created", detail: "Watch the support project", config: "SUP project" },
            { type: "condition", app: "Rules", title: "Priority is urgent", detail: "Continue only for urgent issues", config: "Priority = Urgent" },
            { type: "action", app: "Slack", title: "Alert support channel", detail: "Post the issue summary", config: "#support-urgent" },
            { type: "action", app: "Asana", title: "Create response task", detail: "Assign the on-call teammate", config: "Urgent issue response" },
        ],
    },
    {
        id: "tpl-renewal-alert",
        name: "Prepare for an upcoming renewal",
        category: "Customer success",
        description: "Give account owners an early reminder and a task to prepare a renewal conversation.",
        apps: ["HubSpot", "Slack", "Asana"],
        nodes: [
            { type: "trigger", app: "HubSpot", title: "Renewal is 30 days away", detail: "Check active customer contracts", config: "Renewal in 30 days" },
            { type: "action", app: "Slack", title: "Send account briefing", detail: "Notify the account owner", config: "#renewals" },
            { type: "action", app: "Asana", title: "Create renewal task", detail: "Add to renewal board", config: "Renewal preparation" },
        ],
    },
];

export const initialRuns = [
    { id: "run-801", workflowId: "flow-101", status: "Success", startedAt: "2026-10-11T08:21:04", duration: "1.8s", trigger: "Mira Chen submitted a demo request", steps: ["New form submission received", "Lead score matched the rule", "Contact updated in HubSpot", "Message posted to #new-leads"] },
    { id: "run-800", workflowId: "flow-102", status: "Success", startedAt: "2026-10-11T08:04:16", duration: "2.4s", trigger: "Trial started for Northwind Studio", steps: ["Trial subscription received", "Wait step completed", "Welcome email prepared for delivery"] },
    { id: "run-799", workflowId: "flow-103", status: "Failed", startedAt: "2026-10-11T07:52:43", duration: "0.9s", trigger: "Invoice INV-2048 became overdue", steps: ["Overdue invoice received", "Balance matched the threshold", "Email step needs account credentials"] },
    { id: "run-798", workflowId: "flow-101", status: "Success", startedAt: "2026-10-11T07:48:09", duration: "1.5s", trigger: "Ari Patel submitted a contact request", steps: ["New form submission received", "Lead score matched the rule", "Contact updated in HubSpot", "Message posted to #new-leads"] },
    { id: "run-797", workflowId: "flow-106", status: "Success", startedAt: "2026-10-10T16:12:28", duration: "1.2s", trigger: "Renewal for Acme North is 30 days away", steps: ["Renewal date matched", "Account briefing created", "Renewal task prepared"] },
    { id: "run-796", workflowId: "flow-102", status: "Running", startedAt: "2026-10-10T15:56:54", duration: "Running", trigger: "Trial started for Lumen Works", steps: ["Trial subscription received", "Waiting for scheduled delay"] },
    { id: "run-795", workflowId: "flow-104", status: "Success", startedAt: "2026-10-09T09:01:11", duration: "3.1s", trigger: "Friday workspace schedule", steps: ["Weekly schedule started", "Activity summary prepared", "Digest posted to #customer-success"] },
];

export const formatRelativeTime = (value) => {
    const date = new Date(value);
    const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
};

export const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const makeRunForWorkflow = (workflow, status = "Success") => ({
    id: makeId("run"),
    workflowId: workflow.id,
    status,
    startedAt: new Date().toISOString(),
    duration: `${(Math.random() * 2.6 + 0.8).toFixed(1)}s`,
    trigger: "Test event: Example customer record",
    steps: workflow.nodes.map((node) => `${node.title} ${status === "Failed" && node.type === "action" ? "needs an app connection" : "completed"}`),
});