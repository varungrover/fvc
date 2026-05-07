# Module 6 Specification — Coach & Staff Management

## 1. Goal
Provide a comprehensive system for managing the academy's workforce, focusing on coach qualifications, dynamic availability, and automated status tracking.

## 2. Core Entities

### 2.1 Profile Extensions
- **Role**: All users in this module must have `role_id = 'coach'`.
- **Ownership**: Every coach is tied to an `ownership_id` for multi-tenant isolation.
- **Derived Status**:
    - `Inactive`: `profiles.is_active = false`.
    - `On Leave`: `profiles.is_active = true` AND today falls within an approved `staff_leaves` range.
    - `Active`: `profiles.is_active = true` AND NOT `On Leave`.

### 2.2 Qualifications (`staff_planets`)
- Maps coaches to `planets`.
- **Purpose**: Prevents assigning coaches to programs they aren't trained for.
- **Constraint**: Unique pair of `(profile_id, planet_id)`.

### 2.3 Weekly Availability (`staff_availability`)
- Stores recurring time blocks per day of the week.
- **Format**: `day_of_week` (string), `start_time` (time), `end_time` (time).
- **Validation**: `start_time < end_time`. No overlapping blocks for the same day.

### 2.4 Staff Leaves (`staff_leaves`)
- Non-recurring date ranges for absences.
- **Fields**: `start_date`, `end_date`, `reason`, `status`.
- **Logic**: Overlapping leaves are disallowed for the same coach.

## 3. Scoping & Security (RLS)

| Role | `profiles` (Coach) | `staff_planets` | `staff_availability` | `staff_leaves` |
|---|---|---|---|---|
| **Franchisor Admin** | All | All | All | All |
| **Franchisee Admin** | Own Ownership | Own Ownership | Own Ownership | Own Ownership |
| **Coach** | Self (Read) | Self (Read) | Self (Manage) | Self (Manage) |

## 4. UI/UX Standards
- **Status Indicators**: Use vibrant pills (Green for Active, Orange for On Leave, Gray for Inactive).
- **Scheduling**: Use a 24-hour time picker or select list with 15-minute increments.
- **Design**: Adhere to the `TLP` design system (Navy/Teal/TealLight).
