export const enCommercialTexts = {
  commercialProfileEyebrow: 'Sell commercially',
  commercialProfileTitle: 'Commercial seller profile',
  commercialProfileSubtitle: 'Add your business details and submit your profile for review.',
  commercialBackToProfile: 'Back to profile',

  commercialVerificationTitle: 'Verification status',
  commercialVerificationStatus: 'Current status',
  commercialStatusNotRequested: 'Not submitted',
  commercialStatusPendingReview: 'Review in progress',
  commercialStatusApproved: 'Approved',
  commercialStatusRejected: 'Rejected',
  commercialStatusSuspended: 'Suspended',

  commercialStatusNotRequestedDescription:
    'Complete your business details and submit your profile for review.',
  commercialStatusPendingReviewDescription: 'Selorya is currently reviewing your business details.',
  commercialStatusApprovedDescription:
    'Your commercial seller profile is approved and can submit listings for product review.',
  commercialStatusRejectedDescription:
    'Your profile has not been approved yet. Review the reason and submit it again.',
  commercialStatusSuspendedDescription:
    'Your commercial seller profile is currently suspended. New sales and checkouts are unavailable.',

  commercialRejectionReason: 'Reason',
  commercialStatusResetHint: 'Changing business details resets a pending or existing approval.',
  commercialSuspendedHint: 'A new review cannot be requested while the profile is suspended.',

  commercialSellerTypeTitle: 'Seller type',
  commercialSellerTypeSubtitle:
    'Private sellers can sell directly. Commercial sellers require approval before publication.',
  commercialSellerTypePrivate: 'Sell privately',
  commercialSellerTypePrivateDescription: 'For private individual sales without a business review.',
  commercialSellerTypeCommercial: 'Sell commercially',
  commercialSellerTypeCommercialDescription:
    'For sales on behalf of a company or commercial activity.',
  commercialSellerTypePrivateLocked:
    'An approved commercial profile cannot be changed back to private directly.',

  commercialBusinessDetailsTitle: 'Business details',
  commercialBusinessDetailsSubtitle:
    'These details are required to review your commercial seller profile.',
  commercialLegalName: 'Company / legal name',
  commercialLegalForm: 'Legal form',
  commercialRepresentativeName: 'Authorised representative',
  commercialBusinessEmail: 'Business email address',
  commercialBusinessPhone: 'Business phone number',
  commercialAddressLine1: 'Street and house number',
  commercialAddressLine2: 'Address addition',
  commercialPostalCode: 'Postal code',
  commercialCity: 'City',
  commercialCountry: 'Country',
  commercialRegisterCourt: 'Register court',
  commercialRegisterNumber: 'Commercial register number',
  commercialVatId: 'VAT ID',
  commercialOptional: 'Optional',
  commercialRequiredField: 'This field is required for review.',

  commercialSave: 'Save business details',
  commercialSaving: 'Saving...',
  commercialProfileSaved: 'Business details were saved.',
  commercialProfileSaveFailed: 'The business details could not be saved.',
  commercialRequestReview: 'Request review',
  commercialRequestingReview: 'Requesting review...',
  commercialReviewRequested: 'Your commercial seller profile was submitted for review.',
  commercialReviewFailed: 'The review could not be requested.',
  commercialReviewRequiredFields:
    'Complete all required fields before requesting commercial review.',

  adminCommercialMenuGroup: 'Administration',
  adminCommercialNav: 'Commercial seller reviews',
  adminCommercialEyebrow: 'Selorya administration',
  adminCommercialTitle: 'Review commercial sellers',
  adminCommercialSubtitle:
    'Review business details and decide whether commercial seller profiles are approved.',
  adminCommercialReload: 'Refresh',
  adminCommercialSearchLabel: 'Search company or account',
  adminCommercialSearchPlaceholder: 'Company name, name, or email',
  adminCommercialStatusLabel: 'Filter review status',
  adminCommercialSearchAction: 'Search',
  adminCommercialAllStatuses: 'All statuses',
  adminCommercialLoadingTitle: 'Loading reviews',
  adminCommercialLoadingDescription: 'Commercial seller profiles are being retrieved.',
  adminCommercialLoadFailedTitle: 'Reviews could not be loaded',
  adminCommercialLoadFailedDescription:
    'The commercial seller profile list is currently unavailable.',
  adminCommercialRetry: 'Try again',
  adminCommercialEmptyTitle: 'No commercial seller profiles found',
  adminCommercialEmptyDescription: 'There are no results for the selected status or search query.',
  adminCommercialBusinessSection: 'Business',
  adminCommercialReviewSection: 'Review',
  adminCommercialBusinessAddress: 'Business address',
  adminCommercialRegistry: 'Registration details',
  adminCommercialRequestedAt: 'Review requested',
  adminCommercialReviewedAt: 'Latest decision',
  adminCommercialReviewer: 'Reviewed by',
  adminCommercialNoValue: 'Not provided',
  adminCommercialApproveAction: 'Approve',
  adminCommercialRejectAction: 'Reject',
  adminCommercialSuspendAction: 'Suspend',
  adminCommercialApproveTitle: 'Approve commercial profile',
  adminCommercialRejectTitle: 'Reject commercial profile',
  adminCommercialSuspendTitle: 'Suspend commercial profile',
  adminCommercialApproveDescription:
    'After approval, the seller can submit listings for product review.',
  adminCommercialRejectDescription:
    'The provided reason will be shown to the seller in the business profile.',
  adminCommercialSuspendDescription:
    'Suspension blocks new sales and checkouts for this commercial seller profile.',
  adminCommercialApproveConfirm: 'Approve now',
  adminCommercialRejectConfirm: 'Save rejection',
  adminCommercialSuspendConfirm: 'Suspend now',
  adminCommercialDecisionReason: 'Reason',
  adminCommercialDecisionReasonPlaceholder:
    'Explain precisely why this profile is rejected or suspended.',
  adminCommercialDecisionReasonRequired: 'A reason is required for this decision.',
  adminCommercialCancelAction: 'Cancel',
  adminCommercialApproveSuccess: 'The commercial seller profile was approved.',
  adminCommercialRejectSuccess: 'The commercial seller profile was rejected.',
  adminCommercialSuspendSuccess: 'The commercial seller profile was suspended.',
  adminCommercialActionFailed: 'The decision could not be saved.',
} as const;
