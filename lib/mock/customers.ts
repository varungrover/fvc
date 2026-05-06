import type { Customer, CustomerLocation } from "@/lib/types";

export const CUSTOMERS: Customer[] = [
  {
    id: "cust_raj",
    userId: "user_raj",
    fullName: "Raj Sharma",
    dob: "1984-06-12",
    phone: "+1-604-555-0188",
    emergencyContact: "Meera Sharma · +1-604-555-0189",
    gender: "Male",
    cfcId: "CFC-2025-0042",
    termsAccepted: true,
    loyaltyPoints: 412,
  },
  // Stub customers used by admin/coach lists
  {
    id: "cust_chen",
    userId: "user_chen",
    fullName: "Wei Chen",
    dob: "1981-03-22",
    phone: "+1-604-555-0190",
    termsAccepted: true,
    loyaltyPoints: 158,
  },
  {
    id: "cust_okafor",
    userId: "user_okafor",
    fullName: "Adaeze Okafor",
    dob: "1987-11-04",
    phone: "+1-604-555-0191",
    termsAccepted: true,
    loyaltyPoints: 86,
  },
  {
    id: "cust_kumar",
    userId: "user_kumar",
    fullName: "Suresh Kumar",
    dob: "1979-08-30",
    phone: "+1-604-555-0192",
    termsAccepted: true,
    loyaltyPoints: 224,
  },
  {
    id: "cust_oconnor",
    userId: "user_oconnor",
    fullName: "Niamh O'Connor",
    dob: "1990-02-14",
    phone: "+1-604-555-0193",
    termsAccepted: true,
    loyaltyPoints: 12,
  },
];

export const CUSTOMER_BY_ID: Record<string, Customer> = Object.fromEntries(
  CUSTOMERS.map((c) => [c.id, c]),
);

export const DEMO_CUSTOMER = CUSTOMERS[0];

export const CUSTOMER_LOCATIONS: CustomerLocation[] = [
  { id: "cl_raj_surrey", customerId: "cust_raj", locationId: "loc_tlp_surrey", isPreferred: true },
  { id: "cl_chen_surrey", customerId: "cust_chen", locationId: "loc_tlp_surrey", isPreferred: true },
  { id: "cl_okafor_abb", customerId: "cust_okafor", locationId: "loc_tlp_abbotsford", isPreferred: true },
  { id: "cl_kumar_surrey", customerId: "cust_kumar", locationId: "loc_tlp_surrey", isPreferred: true },
  { id: "cl_oconnor_lan", customerId: "cust_oconnor", locationId: "loc_tlp_langley", isPreferred: true },
];
