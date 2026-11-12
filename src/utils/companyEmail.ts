// Free / personal mailbox providers. The PR media contact must be a company or
// organisation address; the backend refuses the same list.
export const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "rocketmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "zoho.com",
  "zohomail.com",
  "yandex.com",
  "yandex.ru",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "rediffmail.com",
  "tutanota.com",
  "hey.com",
  "qq.com",
  "163.com",
];

export const COMPANY_EMAIL_MESSAGE =
  "Please use a company or organisation email (not Gmail, Yahoo, etc.)";

export const isPersonalEmail = (email?: string | null): boolean => {
  const domain = email?.trim().toLowerCase().split("@")[1];
  return !!domain && PERSONAL_EMAIL_DOMAINS.includes(domain);
};
