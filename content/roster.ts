export type IntakeStatus =
  | "not-started"
  | "in-progress"
  | "plan-generated"
  | "synced-to-emoney";

export type AthleteFlag = "state-compliance" | "entity" | "insurance";

export type Athlete = {
  id: string;
  name: string;
  sport: string;
  school: string;
  classYear: string;
  isMinor: boolean;
  status: IntakeStatus;
  flags: AthleteFlag[];
  nilIncomeYtd: number;
  homeState: string;
  competingStates: string[];
  lastActivity: string;
};

export const ROSTER: Athlete[] = [
  {
    id: "a-01",
    name: "Marcus Ellison",
    sport: "Men's Football",
    school: "Auburn University",
    classYear: "Junior",
    isMinor: false,
    status: "plan-generated",
    flags: ["entity", "insurance"],
    nilIncomeYtd: 412_000,
    homeState: "GA",
    competingStates: ["AL", "TN", "MS", "TX", "GA", "FL"],
    lastActivity: "2 days ago",
  },
  {
    id: "a-02",
    name: "Jordan Reyes",
    sport: "Women's Basketball",
    school: "University of Connecticut",
    classYear: "Sophomore",
    isMinor: false,
    status: "in-progress",
    flags: ["state-compliance"],
    nilIncomeYtd: 148_500,
    homeState: "NY",
    competingStates: ["CT", "MA", "TN", "IN", "TX"],
    lastActivity: "5 hours ago",
  },
  {
    id: "a-03",
    name: "Devin Okafor",
    sport: "Men's Basketball",
    school: "Duke University",
    classYear: "Freshman",
    isMinor: true,
    status: "in-progress",
    flags: ["state-compliance"],
    nilIncomeYtd: 86_200,
    homeState: "IL",
    competingStates: ["NC", "VA", "KY", "MA"],
    lastActivity: "yesterday",
  },
  {
    id: "a-04",
    name: "Sam Whitaker",
    sport: "Baseball",
    school: "Vanderbilt University",
    classYear: "Junior",
    isMinor: false,
    status: "not-started",
    flags: [],
    nilIncomeYtd: 32_000,
    homeState: "TN",
    competingStates: ["TN"],
    lastActivity: "—",
  },
  {
    id: "a-05",
    name: "Leah Nakamura",
    sport: "Women's Basketball",
    school: "Stanford University",
    classYear: "Senior",
    isMinor: false,
    status: "synced-to-emoney",
    flags: [],
    nilIncomeYtd: 227_400,
    homeState: "HI",
    competingStates: ["CA", "AZ", "OR", "WA", "UT"],
    lastActivity: "1 week ago",
  },
  {
    id: "a-06",
    name: "Tyrese Booker",
    sport: "Men's Football",
    school: "Ohio State University",
    classYear: "Sophomore",
    isMinor: false,
    status: "in-progress",
    flags: ["entity"],
    nilIncomeYtd: 318_900,
    homeState: "OH",
    competingStates: ["OH", "MI", "PA", "IN", "WI"],
    lastActivity: "3 days ago",
  },
  {
    id: "a-07",
    name: "Ana Delgado",
    sport: "Soccer",
    school: "UCLA",
    classYear: "Junior",
    isMinor: false,
    status: "not-started",
    flags: [],
    nilIncomeYtd: 44_100,
    homeState: "CA",
    competingStates: ["CA", "OR", "WA"],
    lastActivity: "—",
  },
  {
    id: "a-08",
    name: "Cole Whitfield",
    sport: "Men's Football",
    school: "University of Texas",
    classYear: "Junior",
    isMinor: false,
    status: "plan-generated",
    flags: ["entity", "insurance", "state-compliance"],
    nilIncomeYtd: 610_500,
    homeState: "TX",
    competingStates: ["TX", "OK", "GA", "LA", "AL"],
    lastActivity: "yesterday",
  },
];

export const STATUS_LABEL: Record<IntakeStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "plan-generated": "Plan generated",
  "synced-to-emoney": "Synced to eMoney",
};

export const FLAG_LABEL: Record<AthleteFlag, string> = {
  "state-compliance": "State NIL",
  entity: "Entity",
  insurance: "LOV insurance",
};
