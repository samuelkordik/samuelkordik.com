export const site = {
  name: 'Samuel Kordik',
  title: 'Samuel Kordik: EMS leader, data analyst, educator',
  description:
    'Paramedic, EMS quality leader, data analyst, photographer and teacher. Improving out-of-hospital emergency medical care by answering questions, solving problems, and teaching others to do the same.',
  mission:
    'I improve out-of-hospital emergency medical care by answering questions, solving problems, and teaching others to do the same.',
  emsStartYear: 2005,
  // Email is assembled in the browser so scrapers don't find it in the HTML.
  email: { user: 'mail', domain: 'samuelkordik.com' },
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/samuelkordik' },
    { label: 'GitHub', href: 'https://github.com/samuelkordik' },
    { label: 'ORCID', href: 'https://orcid.org/0000-0003-4230-1154' },
    { label: 'Goodreads', href: 'https://www.goodreads.com/user/show/8817258-samuel-kordik' },
  ],
  nav: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'Teaching', href: '/teaching/' },
    { label: 'About', href: '/about/' },
    { label: 'Resume', href: '/resume/' },
  ],
};

export const yearsInEms = () => new Date().getFullYear() - site.emsStartYear;
