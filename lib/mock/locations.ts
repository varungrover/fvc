import type { Location } from "@/lib/types";

export const LOCATIONS: Location[] = [
  // The Learning Planet (corporate, BC)
  {
    id: "loc_tlp_surrey",
    ownershipId: "ten_tlp",
    name: "Surrey Central",
    addressLine1: "10153 King George Blvd",
    city: "Surrey",
    stateProvince: "BC",
    country: "Canada",
    postalCode: "V3T 2W1",
    isActive: true,
  },
  {
    id: "loc_tlp_abbotsford",
    ownershipId: "ten_tlp",
    name: "Abbotsford",
    addressLine1: "32700 South Fraser Way",
    city: "Abbotsford",
    stateProvince: "BC",
    country: "Canada",
    postalCode: "V2S 2A8",
    isActive: true,
  },
  {
    id: "loc_tlp_langley",
    ownershipId: "ten_tlp",
    name: "Langley",
    addressLine1: "20151 Fraser Hwy",
    city: "Langley",
    stateProvince: "BC",
    country: "Canada",
    postalCode: "V3A 4E4",
    isActive: true,
  },
  // Maple Leaf Academy (franchisee, ON)
  {
    id: "loc_mla_toronto",
    ownershipId: "ten_mla",
    name: "Toronto Downtown",
    addressLine1: "365 Bloor St E",
    city: "Toronto",
    stateProvince: "ON",
    country: "Canada",
    postalCode: "M4W 3L4",
    isActive: true,
  },
  {
    id: "loc_mla_mississauga",
    ownershipId: "ten_mla",
    name: "Mississauga",
    addressLine1: "100 City Centre Dr",
    city: "Mississauga",
    stateProvince: "ON",
    country: "Canada",
    postalCode: "L5B 2C9",
    isActive: true,
  },
  {
    id: "loc_mla_brampton",
    ownershipId: "ten_mla",
    name: "Brampton",
    addressLine1: "25 Peel Centre Dr",
    city: "Brampton",
    stateProvince: "ON",
    country: "Canada",
    postalCode: "L6T 3R5",
    isActive: true,
  },
];

export const LOCATIONS_BY_TENANT: Record<string, Location[]> = LOCATIONS.reduce(
  (acc, loc) => {
    (acc[loc.ownershipId] ??= []).push(loc);
    return acc;
  },
  {} as Record<string, Location[]>,
);

export const LOCATION_BY_ID: Record<string, Location> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
);
