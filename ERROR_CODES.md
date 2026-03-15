# Error Codes

Standard error schema for all 4xx/5xx responses:

```json
{
  "error_code": "MACHINE_READABLE_CODE",
  "message": "Safe client-facing message",
  "details": {}
}
```

`details` is optional and is used for validation errors and selected business-rule errors.

## Generic Error Codes

- `BAD_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `METHOD_NOT_ALLOWED` (405)
- `CONFLICT` (409)
- `RESOURCE_EXPIRED` (410)
- `PAYLOAD_TOO_LARGE` (413)
- `UNSUPPORTED_MEDIA_TYPE` (415)
- `VALIDATION_ERROR` (422)
- `RATE_LIMITED` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

## Route-Level Error Codes

### Common

- `ROUTE_NOT_FOUND` (404): Requested endpoint does not exist.

### Draft Orders / Promo

- `DRAFT_ORDER_NOT_FOUND` (404): Draft order id is invalid or does not exist.
- `DRAFT_ORDER_FORBIDDEN` (403): Draft order does not belong to current client.
- `DRAFT_ORDER_EXPIRED` (410): Draft order expiration time passed.
- `PROMO_NOT_FOUND` (404): Promo code is invalid.
- `PROMO_INACTIVE` (400): Promo exists but not active.
- `PROMO_EXPIRED` (400): Promo exists but expired.
- `PROMO_USAGE_LIMIT_REACHED` (400): Promo usage limit has been reached.
- `PROMO_CRAFTSMAN_SCOPE_MISMATCH` (400): Promo scoped to a different craftsman.
- `PROMO_ALREADY_APPLIED` (409): Draft already has an applied promo.
