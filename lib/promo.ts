export type PromoPopupConfig = {
  enabled: boolean
  frequency: 'always' | 'once_session' | 'once_day' | 'once_ever' | 'custom_times'
  max_views: number
  image_url: string
  headline: string
  subtitle: string
  description: string
  code: string
  button_text: string
  button_link: string
  timer_hours: number
}

export const DEFAULT_PROMO_POPUP: PromoPopupConfig = {
  enabled: true,
  frequency: 'always',
  max_views: 3,
  image_url: '/hijab-medina.jpg',
  headline: "Here's 15% Off Just For You",
  subtitle: "BEFORE YOU GO!",
  description: "Use the code below at checkout and get 15% OFF on your first order.",
  code: "WELCOME15",
  button_text: "SHOP NOW",
  button_link: "/shop",
  timer_hours: 62,
}
