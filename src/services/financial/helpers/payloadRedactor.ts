export function redactPaymobPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;

  const rootFieldsToRedact = [
    'card_holder_name',
    'card_num',
    'email',
    'phone',
  ];

  for (const field of rootFieldsToRedact) {
    if (field in clone) {
      clone[field] = '[REDACTED]';
    }
  }

  if ('billing_data' in clone && clone.billing_data && typeof clone.billing_data === 'object') {
    const billingData = clone.billing_data as Record<string, unknown>;
    const billingFieldsToRedact = [
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'street',
      'building',
    ];

    for (const field of billingFieldsToRedact) {
      if (field in billingData) {
        billingData[field] = '[REDACTED]';
      }
    }
  }

  return clone;
}
