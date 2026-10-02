# @repo/providers-kyc

Provider-agnostic KYC port with a deterministic mock adapter backed by `@repo/db`.

## Port

`KycProvider` exposes three methods:

- `getStatus(userId)` returns `none`, `pending`, `approved`, or `rejected`.
- `getApplication(userId)` returns the persisted application or `null`.
- `submitApplication(userId, input)` creates or resubmits an application.

The persistence model has one `kyc_applications` row per user. Its status is mirrored to `users.kyc_status`, which remains the status consumed by the wallet session.

## Deterministic mock behavior

The mock evaluates applications in this order:

1. Applicant self-declares PEP status or sanctions: immediately reject and set the corresponding screening match fields.
2. `/pep|sanction/i` in a document name: immediately reject and set the corresponding screening match fields.
3. `/reject/i`: immediately reject.
4. `/approve/i`: immediately approve.
5. Otherwise: start as pending and lazily approve on the next status/application read after `autoApproveAfterMs` (15,000ms by default).

Configure the delay with `createMockKycProvider(db, { autoApproveAfterMs })`. No background timer runs. Tests can use a deterministic clock with `createMockKycProvider(db, { now: () => fixedDate })`.

This package deliberately does not wire KYC into `apps/wallet`; API routes and UI belong to the onboarding and gating tasks.
