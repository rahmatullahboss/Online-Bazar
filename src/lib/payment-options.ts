import { PAYMENT_BKASH_NUMBER, PAYMENT_NAGAD_NUMBER } from './site-config'

export type PaymentMethod = 'cod' | 'bkash' | 'nagad'

export interface PaymentLogo {
  src: string
  alt: string
  width: number
  height: number
}

export interface PaymentOption {
  value: PaymentMethod
  label: string
  logo: PaymentLogo
}

// Use payment numbers from site config (env variables)
export const DIGITAL_PAYMENT_ACCOUNT_NUMBER = PAYMENT_BKASH_NUMBER

export const DIGITAL_PAYMENT_INSTRUCTIONS: Partial<Record<PaymentMethod, string[]>> = {
  bkash: [
    `Send your payment to our bKash number ${PAYMENT_BKASH_NUMBER} using "Send Money".`,
    'After completing the transfer, provide the sender wallet number and transaction ID in the boxes below so we can verify your payment.',
  ],
  nagad: [
    `Send your payment to our Nagad number ${PAYMENT_NAGAD_NUMBER} using "Send Money".`,
    'After completing the transfer, provide the sender wallet number and transaction ID in the boxes below so we can verify your payment.',
  ],
}

export const DIGITAL_PAYMENT_METHODS: PaymentMethod[] = ['bkash', 'nagad']

export const isDigitalPaymentMethod = (method: PaymentMethod): boolean =>
  DIGITAL_PAYMENT_METHODS.includes(method)

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    logo: {
      src: '/payment/cod.svg',
      alt: 'Cash on Delivery logo',
      width: 512,
      height: 256,
    },
  },
  {
    value: 'bkash',
    label: 'bKash',
    logo: {
      src: '/payment/bkash.svg',
      alt: 'bKash payment logo',
      width: 512,
      height: 341,
    },
  },
  {
    value: 'nagad',
    label: 'Nagad',
    logo: {
      src: '/payment/nagad.svg',
      alt: 'Nagad payment logo',
      width: 512,
      height: 341,
    },
  },
]

export const PAYMENT_OPTION_MAP: Record<PaymentMethod, PaymentOption> = PAYMENT_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<PaymentMethod, PaymentOption>,
)
