# Security Specification for YeEgna

This document specifies the Data Invariants and Red Team Security Payload tests designed to lock down the YeEgna joint-couple financial database on Firestore.

## 1. Core Data Invariants

1. **Strict Auth Boundary (Zero Trust Isolation)**: A user authenticated as `uid` can ONLY read or write resources under `/couples/uid` and its subcollections.
2. **Identity Integrity**: Values for audit fields (such as `addedBy` or who made variations) must strictly correspond to correct state.
3. **Temporal Integrity**: Structural timestamps (`createdAt` or `updatedAt`) must coincide with the server duration `request.time`.
4. **Denial of Wallet Range Bounds**: Text and list sizes must be capped below safe maximum ranges.

---

## 2. The "Dirty Dozen" Payloads (Red Team Exploit Vectors)

These payloads are designed to challenge and test the bounds of the Firestore security configuration. Every one of them must return `PERMISSION_DENIED` under a secure fortress rules policy.

### Payload 1: Stranger Reading Couple Profile
* **Target Path**: `/couples/couple_A` (read by authenticated `stranger_user`)
* **Vector**: Cross-Tenant Read

### Payload 2: Stranger Creating Couple Subcollection Item
* **Target Path**: `/couples/couple_B/transactions/tx_leak` (created by authenticated `stranger_user`)
* **Vector**: Cross-Tenant Write

### Payload 3: Shadow Update (Ghost Field Injection)
* **Target Path**: `/couples/couple_A` (updated by actual `couple_A` user)
* **Payload**: `{ wifeName: "Belen", husbandName: "Michael", hucksterGhostSecretField: "HAXX" }`
* **Vector**: Schemaless Field Poisoning

### Payload 4: ID Poisoning (Junk Character ID Attack)
* **Target Path**: `/couples/couple_A/transactions/VERY_LONG_STRING_OVER_100_CHARACTERS_THAT_EXHAUSTS_FIRESTORE_RESOURCES_AND_DENIES_WALLET_BY_INJECTING_JUNK`
* **Vector**: ID Exhaustion Attack

### Payload 5: Negative Amount Transaction Creation
* **Target Path**: `/couples/couple_A/transactions/tx_negative`
* **Payload**: `{ id: "tx_negative", amount: -1000, category: "Food", date: "2026-05-26", wallet: "shared", type: "expense", addedBy: "wife" }`
* **Vector**: Invalid Value Injection

### Payload 6: Invalid Enum addedBy Spoofing
* **Target Path**: `/couples/couple_A/transactions/tx_spoof`
* **Payload**: `{ id: "tx_spoof", amount: 150, category: "Food", date: "2026-05-26", wallet: "shared", type: "expense", addedBy: "hacker" }`
* **Vector**: Identity Spoofing

### Payload 7: Client-Forged Timestamps
* **Target Path**: `/couples/couple_A/transactions/tx_time`
* **Payload**: `{ id: "tx_time", amount: 150, category: "Food", date: "2026-05-26", wallet: "shared", type: "expense", addedBy: "wife", createdAt: "2020-01-01T00:00:00Z" }`
* **Vector**: Temporal Spoofing

### Payload 8: Immutable Field Overwrite
* **Target Path**: `/couples/couple_A/transactions/tx_1` (updating existing transaction)
* **Payload**: `{ amount: 200, category: "Shopping", date: "2026-05-26", wallet: "shared", type: "expense", addedBy: "husband" }` (while trying to change the immutable ID or role)
* **Vector**: Read-Only Modification

### Payload 9: Goal Overfund Exploit (Unchecked Large Saved Amount)
* **Target Path**: `/couples/couple_A/goals/goal_1`
* **Payload**: `{ savedAmount: 100000000000, targetAmount: 5000 }`
* **Vector**: Field Overflow

### Payload 10: Notification Spoofing
* **Target Path**: `/couples/couple_A/notifications/notif_spoof`
* **Payload**: `{ id: "notif_spoof", title: "Fake Success!", message: "Hacked", date: "2026-05-26", read: false, type: "unpermitted_type" }`
* **Vector**: Category Enum Poisoning

### Payload 11: Non-Owner Public Reading of Private Spends (PII Leak)
* **Target Path**: `/couples/couple_A/transactions/private_tx` (accessed by anonymous user)
* **Vector**: Unauthenticated Reading

### Payload 12: Terminal State Shortcutting (Updating Completed Savings Goal)
* **Target Path**: `/couples/couple_A/goals/goal_completed` (updating savedAmount or details AFTER goal is already completed and locked)
* **Vector**: Lifecycle Shortcutting

---

## 3. The Test Suite Architecture

We will verify that these payloads fail rules processing. A corresponding `firestore.rules.test.ts` outline provides the testing runner mechanism.
