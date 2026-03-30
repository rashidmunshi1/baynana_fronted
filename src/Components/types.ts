export interface BusinessTimings {
  monday?: { closed?: boolean; open?: string; close?: string };
  tuesday?: { closed?: boolean; open?: string; close?: string };
  wednesday?: { closed?: boolean; open?: string; close?: string };
  thursday?: { closed?: boolean; open?: string; close?: string };
  friday?: { closed?: boolean; open?: string; close?: string };
  saturday?: { closed?: boolean; open?: string; close?: string };
  sunday?: { closed?: boolean; open?: string; close?: string };
}

export interface Business {
  _id: string;
  businessName: string;
  userId: string;
  category: { _id: string; name: string }; // Populated object
  subcategories: { _id: string; name: string }[]; // Populated objects
  ownerName: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  locationUrl?: string | null;
  latitude?: number;
  longitude?: number;
  description?: string;
  services: string[];
  images: string[];
  timings?: BusinessTimings;
  isPaid: boolean;
  paidAmount: number;
  paidDays: number;
  paidExpiry: string | null;
  status: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  rating?: number;
  ratingCount?: number;
  holidays: [];
  createdAt: string;
  updatedAt: string;
}
