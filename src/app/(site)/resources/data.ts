export interface ResourceCard {
  title: string
  desc: string
  href: string
  phone?: string
  external?: boolean
}

export const electedOfficials: ResourceCard[] = [
  {
    title: "City of Madison – Mayor's Office",
    desc: "Contact the Mayor's office for city-wide issues and services.",
    href: 'https://www.cityofmadison.com/mayor',
    external: true,
  },
  {
    title: 'Madison City Council',
    desc: 'Find your District representative and city council meeting information.',
    href: 'https://www.cityofmadison.com/council',
    external: true,
  },
  {
    title: 'Dane County Executive',
    desc: 'County-level government services and elected leadership.',
    href: 'https://www.countyofdane.com/exec',
    external: true,
  },
  {
    title: 'Wisconsin State Legislature',
    desc: 'Find your state Assembly and Senate representatives.',
    href: 'https://legis.wisconsin.gov/',
    external: true,
  },
  {
    title: 'Madison City Services (311)',
    desc: 'Report issues, request services, or ask questions about city services.',
    href: 'https://www.cityofmadison.com/streets/cityservices/',
    phone: 'Call 311 or (608) 266-4611',
    external: true,
  },
  {
    title: 'Madison Alder — District 16',
    desc: "Sprecher East falls within Madison's District 16. Contact your Alder directly.",
    href: 'https://www.cityofmadison.com/council/district16',
    external: true,
  },
]

export const publicSafety: ResourceCard[] = [
  {
    title: 'Madison Police Department',
    desc: 'Non-emergency line for reporting concerns and connecting with your district officers.',
    href: 'https://www.cityofmadison.com/police',
    phone: 'Non-emergency: (608) 255-2345',
    external: true,
  },
  {
    title: 'Madison Fire Department',
    desc: 'Fire prevention, safety tips, and emergency information.',
    href: 'https://www.cityofmadison.com/fire',
    phone: 'Emergency: 911',
    external: true,
  },
  {
    title: 'Dane County Emergency Management',
    desc: 'Preparedness resources, alerts, and emergency planning.',
    href: 'https://www.countyofdane.com/publicsafety/emergency',
    external: true,
  },
  {
    title: 'MPD East District',
    desc: 'Your local police district covering the Far East Side of Madison.',
    href: 'https://www.cityofmadison.com/police/districts/east',
    external: true,
  },
]

export const childcare: ResourceCard[] = [
  {
    title: 'Wisconsin Child Care Subsidy Program',
    desc: 'Financial assistance for qualifying families needing childcare support.',
    href: 'https://www.dhs.wisconsin.gov/childcare/subsidy.htm',
    external: true,
  },
  {
    title: 'Wisconsin Early Childhood Association',
    desc: 'Find quality childcare providers and early education resources.',
    href: 'https://www.wisconsinearlychildhood.org/',
    external: true,
  },
  {
    title: 'Madison School Childcare Programs',
    desc: 'Before and after school care through Madison Metropolitan School District.',
    href: 'https://www.madison.k12.wi.us/',
    external: true,
  },
  {
    title: 'Boys & Girls Club of Dane County',
    desc: 'Youth programs, after-school care, and summer activities.',
    href: 'https://www.bgcdane.org/',
    phone: '(608) 257-2606',
    external: true,
  },
  {
    title: 'Childcare Resource & Referral Network',
    desc: "Help finding childcare providers that fit your family's needs.",
    href: 'https://www.dhs.wisconsin.gov/childcare/referral.htm',
    external: true,
  },
]

export const renting: ResourceCard[] = [
  {
    title: 'Madison City Housing',
    desc: 'Tenant rights, housing code enforcement, and renter assistance programs.',
    href: 'https://www.cityofmadison.com/dpced/communityDevelopment/housing',
    external: true,
  },
  {
    title: 'Tenant Resource Center',
    desc: 'Free help understanding your rights and responsibilities as a renter in Wisconsin.',
    href: 'https://www.tenantresourcecenter.org/',
    phone: '(608) 257-0006',
    external: true,
  },
  {
    title: 'Legal Action of Wisconsin',
    desc: 'Free legal assistance for low-income tenants facing eviction or housing issues.',
    href: 'https://www.legalaction.org/',
    external: true,
  },
]

export const otherResources: ResourceCard[] = [
  {
    title: 'United Way of Dane County',
    desc: 'Connects residents with health, education, and financial stability services.',
    href: 'https://www.unitedwaydanecounty.org/',
    phone: 'Dial 211 for help',
    external: true,
  },
  {
    title: 'Dane County Social Services',
    desc: 'Public benefits, food assistance, housing programs, and more.',
    href: 'https://www.countyofdane.com/humanservices',
    external: true,
  },
  {
    title: 'Madison Public Library — Pinney Branch',
    desc: 'Your nearest library branch with programs, resources, and community space.',
    href: 'https://www.madisonpubliclibrary.org/locations/pinney',
    external: true,
  },
  {
    title: 'East Madison Community Center',
    desc: 'Programs, classes, and community gathering space on the East Side.',
    href: 'https://www.cityofmadison.com/parks/facilities/communityCenter.cfm?id=1246',
    external: true,
  },
  {
    title: 'Wisconsin 211',
    desc: 'Free, confidential referral service for health and human services.',
    href: 'https://www.211wisconsin.org/',
    phone: 'Dial 211 anytime',
    external: true,
  },
  {
    title: 'Neighbor Forum (sprechereast.org)',
    desc: 'Connect with your Sprecher East neighbors online for local recommendations and help.',
    href: 'https://www.sprechereast.org/',
    external: true,
  },
]
