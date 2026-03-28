export type DemoUser = {
  avatarAccent: string;
  city: string;
  company: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  lifecycleStage: 'trial' | 'active' | 'power-user';
  plan: 'starter' | 'growth' | 'enterprise';
  preferredCategory: string;
  role: string;
  state: string;
  team: string;
  username: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: 'usr_olivia_hart',
    email: 'olivia.hart@northstar.dev',
    username: 'Olivia Hart',
    firstName: 'Olivia',
    lastName: 'Hart',
    plan: 'starter',
    team: 'Platform',
    company: 'Northstar Dev',
    role: 'Developer Advocate',
    lifecycleStage: 'trial',
    preferredCategory: 'Desk',
    city: 'Austin',
    state: 'TX',
    avatarAccent: '#7dd3fc',
  },
  {
    id: 'usr_mateo_ruiz',
    email: 'mateo.ruiz@signalforge.io',
    username: 'Mateo Ruiz',
    firstName: 'Mateo',
    lastName: 'Ruiz',
    plan: 'growth',
    team: 'SRE',
    company: 'SignalForge',
    role: 'Site Reliability Engineer',
    lifecycleStage: 'active',
    preferredCategory: 'Apparel',
    city: 'Denver',
    state: 'CO',
    avatarAccent: '#34d399',
  },
  {
    id: 'usr_priya_shah',
    email: 'priya.shah@vectralabs.com',
    username: 'Priya Shah',
    firstName: 'Priya',
    lastName: 'Shah',
    plan: 'enterprise',
    team: 'Observability',
    company: 'Vectra Labs',
    role: 'Engineering Manager',
    lifecycleStage: 'power-user',
    preferredCategory: 'Carry',
    city: 'New York',
    state: 'NY',
    avatarAccent: '#f59e0b',
  },
  {
    id: 'usr_evan_choi',
    email: 'evan.choi@redlineops.com',
    username: 'Evan Choi',
    firstName: 'Evan',
    lastName: 'Choi',
    plan: 'growth',
    team: 'Ops',
    company: 'Redline Ops',
    role: 'Incident Commander',
    lifecycleStage: 'active',
    preferredCategory: 'Apparel',
    city: 'Seattle',
    state: 'WA',
    avatarAccent: '#c084fc',
  },
];

export function findDemoUser(userId: string | null | undefined) {
  if (!userId) {
    return null;
  }

  return demoUsers.find(user => user.id === userId) ?? null;
}
