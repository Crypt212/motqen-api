# Changelog

## [Unreleased] - 2026-05-28

### Added
- Proposal system for global orders
- ProposalController with endpoints for submitting, listing, getting, and accepting proposals
- Proposal entity type definitions and domain logic
- ProposalService with business logic for proposal management
- ProposalRepository interface and Prisma implementation
- Proposal routes in `/routes/v1/proposals.ts`
- Proposal request and response validation schemas
- Proposal model in Prisma schema with relationships to Order and WorkerProfile
- New ProposalStatus enum (PENDING, NEGOTIATING, ACCEPTED, REJECTED, WITHDRAWN, DISMISSED)
- Unique constraint on proposal combinations (orderId, workerProfileId)

### Changed
- Enhanced OrderController.create endpoint to use schema validation and structured response
- Added proposal relationship to Order model
- Added proposal relationship to Negotiation model (proposalId field)
- Updated OrderController to include OrderResponseSchema import and usage
- Modified Order creation flow to use CreateOrderSchema for validation
- Enhanced Order response formatting with proper validation
- Added proposal fetching capabilities to Order model queries
- Updated Negotiation model to optionally reference a proposal
- Enhanced repository interfaces to support proposal operations
- Added proposal-related methods to repository implementations:
  - findManyWithWorkerSummary for retrieving proposals with worker details
  - updateStatus for changing proposal status
  - bulkDismiss for dismissing multiple proposals
  - countRecentByWorker for rate limiting
  - findLatestByProposalId for getting latest negotiation
- Added proposal relationship handling in Proposal entity domain types
- Added worker summary types for proposal responses
- Added proposal filter descriptors for querying
- Added proposal create and update input types

### Files Modified
- prisma/schema.prisma - Added Proposal model and relationships
- src/controllers/OrderController.ts - Enhanced create endpoint with schema validation
- src/controllers/ProposalController.ts - New controller for proposal endpoints
- src/domain/negotiation.entity.ts - Added proposalId field to Negotiation
- src/domain/order.entity.ts - Added proposals relationship
- src/domain/proposal.entity.ts - New domain types for proposals
- src/repositories/interfaces/NegotiationRepository.ts - Added findLatestByProposalId method
- src/repositories/interfaces/OrderRepository.ts - No direct changes but used in proposal flow
- src/repositories/interfaces/ProposalRepository.ts - New interface for proposal operations
- src/repositories/prisma/NegotiationRepository.ts - Implementation of findLatestByProposalId
- src/repositories/prisma/OrderRepository.ts - Used in proposal service
- src/repositories/prisma/ProposalRepository.ts - New Prisma implementation
- src/routes/v1/orders.ts - No direct changes but order flow affected
- src/routes/v1/proposals.ts - New route definitions for proposals
- src/schemas/requests/order.request.ts - No direct changes but used
- src/schemas/requests/proposal.request.ts - New validation schemas for proposals
- src/schemas/responses/order.response.ts - No direct changes but used
- src/schemas/responses/proposal.response.ts - New response schemas for proposals
- src/services/OrderService.ts - Used in proposal service
- src/services/ProposalService.ts - New service for proposal business logic
- src/state.ts - Added proposal controller instantiation
- src/utils/stateMachine.ts - No direct changes but order states affected