# Admin Orders Management Dashboard

## Required Reading

Before starting:

Read:

* docs/specs/admin/*
* docs/specs/audits/*
* docs/specs/progress/*

Additionally:

Review the existing order implementation before making any modifications.

Mandatory review:

* src/routes/v1/admin/*
* src/routes/v1/orders/*
* Order controllers
* Order services
* Order repositories
* Chat services
* Negotiation services
* Dispute services
* Report services
* Financial services related to orders

Review existing admin implementations and follow the same architecture patterns.

Important:

Do not assume missing functionality.

A significant portion of order lifecycle logic already exists.

Before creating new services, DTOs, repositories, or routes:

* inspect existing implementations
* reuse existing logic
* extend current functionality
* avoid duplication

Do not create parallel order management workflows.

---

# Objective

Implement the Admin Orders Dashboard.

Purpose:

Allow admins to:

* view all platform orders
* search and filter orders
* inspect complete order history
* inspect conversations
* inspect images
* inspect negotiations
* inspect payment status
* inspect disputes
* perform administrative actions

This dashboard is read-heavy and investigation-focused.

---

# Order Identifier

Review current implementation.

If order reference number does not already exist:

Implement a human-readable order reference.

Format:

```text
ORD-000001
ORD-000002
ORD-000003
```

Must be unique.

Must never change after creation.

---

## Search

If order reference exists:

Search must support:

* order reference

Otherwise search must support:

* client name
* worker name

Search should be case-insensitive.

Partial matching required.

---

# Orders Listing

Add or extend:

GET /api/v1/admin/orders

Purpose:

Retrieve all platform orders.

---

## Response Data

Each item should include:

Order Information:

* orderId
* orderReference
* title
* orderStatus
* workStatus
* orderMode
* isUrgent

Client Information:

* clientId
* clientName

Worker Information:

* workerId
* workerName

Financial Information:

* initialPrice
* finalPrice

Timeline Information:

* createdAt
* startDate
* workStartedAt
* workFinishedAt

Administrative Information:

* disputeExists
* reportExists

---

# Filters

Support:

## Order Status

* PENDING
* OPEN
* PRICE_AGREED
* PAID
* COMPLETED
* CANCELLED

---

## Work Status

* PENDING
* WAITING_FOR_WORK
* STARTED
* DONE

---

## Order Mode

* DIRECT
* GLOBAL

---

## Government

Filter by order location government.

---

## Specialization

Filter by order specialization.

---

## Date Range

Support:

* createdFrom
* createdTo

---

## Search

Search by:

* order reference
* client name
* worker name

---

# Order Details

Add endpoint:

GET /api/v1/admin/orders/:orderId

Purpose:

Provide complete investigation view.

---

# Order Information Section

Return:

* order data
* order reference
* status
* work status
* description
* pricing
* urgency
* specialization
* location

---

# Client Information

Return:

* user id
* full name
* phone number
* account status

---

# Worker Information

Return:

* worker profile id
* full name
* phone number
* verification status
* account status
* worker rating

---

# Timeline

Return complete order timeline.

Include:

* order created
* proposal submitted
* negotiation events
* negotiation accepted
* payment completed
* work started
* work finished
* dispute opened
* dispute resolved
* refunds
* withdrawals related to order earnings

Reuse existing event data where available.

Do not create duplicate timeline systems.

---

# Order Images

Return:

OrderImage entries.

Include:

* image url
* upload date

---

# Conversation Review

Purpose:

Allow admin investigation.

Return conversation data linked to the order.

Include:

* conversation
* participants
* messages

Admin must have read-only access.

No message editing.

No message deletion.

---

# Conversation Images

Return all image messages.

Include:

* message id
* image url
* sender
* createdAt

Used by dashboard image review section.

---

# Negotiation History

Return:

* all negotiations
* sender
* receiver
* price
* note
* status
* createdAt

---

# Payment Information

Return:

* payment status
* payment amount
* escrow status
* refund status

Reuse existing financial services.

---

# Reports

Return:

* reports linked to this order
* report statuses
* report creators
* report types

---

# Disputes

Return:

* dispute information
* dispute status
* dispute messages
* dispute resolution

Reuse existing dispute implementation.

---

# Administrative Actions

## Convert To Issue

Add endpoint:

POST /api/v1/admin/orders/:orderId/convert-to-issue

Purpose:

Create an issue workflow from an order investigation.

Requirements:

* ISSUES_MANAGEMENT
* SUPER_ADMIN

If an issue/report/dispute already exists:

return existing item.

Do not create duplicates.

Audit log required.

---

# Administrative Notes

Add support for internal notes.

Notes are not visible to users.

Used for investigations.

Review existing note implementation first.

If already implemented:

reuse it.

Otherwise:

extend existing issue notes system.

Do not create a second notes system.

---

# Order Activity Log

Return:

* admin actions
* status changes
* financial actions
* moderation actions

Reuse existing audit infrastructure.

Do not create a duplicate history mechanism.

---

# Permissions

View Access:

* USER_MANAGEMENT
* FINANCIAL_MONITOR
* ISSUES_MANAGEMENT
* SUPER_ADMIN

Administrative Actions:

* ISSUES_MANAGEMENT
* SUPER_ADMIN

Only.

---

# Audit Logging

Reuse existing audit infrastructure.

Generate audit records for:

* ORDER_VIEWED
* ORDER_CONVERTED_TO_ISSUE
* ORDER_ADMIN_NOTE_CREATED

Only if similar logging pattern already exists.

Do not introduce a second audit system.

---

# Swagger

Document:

* order listing
* filters
* search
* order details
* timeline
* conversation review
* negotiation history
* convert to issue
* permissions

Follow existing admin swagger patterns.

---

# Implementation Requirements

Before implementation:

Inspect:

* src/routes/v1/admin/*
* src/routes/v1/orders/*
* related controllers
* related services
* related repositories

Follow existing architecture.

Use:

* SuccessResponse
* AppError
* validation middleware
* repository pattern
* dependency injection

Do not introduce architectural inconsistencies.

---

# Verification Checklist

* Build passes.
* Prisma generation passes.
* Existing order implementation reviewed.
* Existing admin implementation reviewed.
* Existing dispute implementation reused.
* Existing report implementation reused.
* Existing chat implementation reused.
* Existing financial implementation reused.
* Order listing operational.
* Filters operational.
* Search operational.
* Order details operational.
* Timeline operational.
* Conversation review operational.
* Conversation image review operational.
* Negotiation history operational.
* Reports visible.
* Disputes visible.
* Convert-to-issue action operational.
* Audit logs generated.
* Swagger updated.
