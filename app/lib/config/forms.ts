export type FieldType =
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "number"
    | "select"
    | "multiselect"
    | "tags";

export interface FieldOption {
    label: string;
    value: string;
}

export interface FieldConfig {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    options?: FieldOption[];
}

export const REGISTER_FIELDS: FieldConfig[] = [
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "userName", label: "Username", type: "text", required: true, minLength: 3, maxLength: 20 },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true, minLength: 8 },
];

export const LOGIN_FIELDS: FieldConfig[] = [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
];

export const EDIT_PROFILE_FIELDS: FieldConfig[] = [
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "userName", label: "Username", type: "text", required: true, minLength: 3, maxLength: 20 },
    { name: "bio", label: "Bio", type: "textarea", maxLength: 280 },
    { name: "location", label: "Location", type: "text" },
];

export const POST_CREATE_FIELDS: FieldConfig[] = [
    { name: "title", label: "Route Title", type: "text", required: true, maxLength: 120 },
    { name: "content", label: "Route Details", type: "textarea", required: true, maxLength: 1000 },
    {
        name: "vehicles", label: "Transport Modes", type: "multiselect", options: [
            { label: "Bus", value: "bus" },
            { label: "Taxi", value: "taxi" },
            { label: "Bike", value: "bike" },
            { label: "Keke", value: "keke" },
            { label: "Walk", value: "trekking" },
        ]
    },
    { name: "fare", label: "Estimated Fare", type: "number" },
    { name: "tags", label: "Tags", type: "tags" },
];

export const BUG_REPORT_FIELDS: FieldConfig[] = [
    { name: "title", label: "Issue Title", type: "text", required: true, maxLength: 120 },
    { name: "description", label: "Description", type: "textarea", required: true, maxLength: 2000 },
    {
        name: "severity",
        label: "Severity",
        type: "select",
        required: true,
        options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
            { label: "Critical", value: "critical" },
        ],
    },
];

export const CONTACT_FIELDS: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "subject", label: "Subject", type: "text", required: true, maxLength: 120 },
    { name: "message", label: "Message", type: "textarea", required: true, maxLength: 1500 },
];
