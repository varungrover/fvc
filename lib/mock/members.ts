import type { Member } from "@/lib/types";

export const MEMBERS: Member[] = [
  // Raj Sharma's family
  {
    id: "mem_aarav",
    customerId: "cust_raj",
    fullName: "Aarav Sharma",
    dob: "2017-04-08",
    grade: "Grade 3",
    tshirtSize: "S",
    preferredColor: "Blue",
    isSelf: false,
  },
  {
    id: "mem_anaya",
    customerId: "cust_raj",
    fullName: "Anaya Sharma",
    dob: "2014-09-21",
    grade: "Grade 7",
    tshirtSize: "M",
    preferredColor: "Teal",
    isSelf: false,
  },
  {
    id: "mem_raj_self",
    customerId: "cust_raj",
    fullName: "Raj Sharma",
    dob: "1984-06-12",
    email: "parent@demo.com",
    grade: "Adult",
    tshirtSize: "L",
    preferredColor: "Navy",
    isSelf: true,
  },
  // Other customers' members (used by admin/coach views)
  {
    id: "mem_lin_chen",
    customerId: "cust_chen",
    fullName: "Lin Chen",
    dob: "2015-12-02",
    grade: "Grade 5",
    tshirtSize: "S",
    isSelf: false,
  },
  {
    id: "mem_kai_chen",
    customerId: "cust_chen",
    fullName: "Kai Chen",
    dob: "2013-07-19",
    grade: "Grade 7",
    tshirtSize: "M",
    isSelf: false,
  },
  {
    id: "mem_ada_okafor",
    customerId: "cust_okafor",
    fullName: "Chiamaka Okafor",
    dob: "2014-05-11",
    grade: "Grade 6",
    tshirtSize: "M",
    isSelf: false,
  },
  {
    id: "mem_arjun_kumar",
    customerId: "cust_kumar",
    fullName: "Arjun Kumar",
    dob: "2016-10-25",
    grade: "Grade 4",
    tshirtSize: "S",
    isSelf: false,
  },
  {
    id: "mem_oconnor_son",
    customerId: "cust_oconnor",
    fullName: "Liam O'Connor",
    dob: "2017-02-03",
    grade: "Grade 3",
    tshirtSize: "S",
    isSelf: false,
  },
];

export const MEMBER_BY_ID: Record<string, Member> = Object.fromEntries(
  MEMBERS.map((m) => [m.id, m]),
);

export const MEMBERS_BY_CUSTOMER: Record<string, Member[]> = MEMBERS.reduce(
  (acc, m) => {
    (acc[m.customerId] ??= []).push(m);
    return acc;
  },
  {} as Record<string, Member[]>,
);
