# Security Specification: BSCpE Examination Question Data Bank

## 1. Data Invariants
- Questions cannot be modified by non-authors once created unless user is an Administrator or assigned Reviewer.
- Only Approved or Published questions may be selected into Examination sets when `requireReviewBeforeExam` is enabled.
- Courses and system settings can only be created or modified by authorized Administrators.
- Audit logs are immutable records once written.
- User profile roles are protected from self-escalation.

## 2. The Dirty Dozen Payloads
1. Non-admin attempting to overwrite `/settings/global`.
2. Faculty attempting to write a question with a fake author UID.
3. Reviewer attempting to modify question body instead of review decision.
4. Anonymous user attempting to query draft questions of other users.
5. Injected 2MB oversized payload into question field.
6. User attempting to delete an approved question without admin privileges.
7. User setting own role to 'admin' during user profile update.
8. Attacker injecting non-standard characters into document IDs.
9. Modifying immutable creation timestamps (`createdAt`).
10. Examiner attempting to publish an exam with unapproved questions.
11. Bypassing course validation with negative credit units.
12. Forging an audit log entry with another user's identity.

## 3. Threat Mitigation Summary
All write actions require authentication. Document updates require validation against `incoming()` data boundaries. Admin checks verify administrative role or trusted admin credentials (`jcos83531@gmail.com`).
